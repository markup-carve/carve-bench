// Rust driver: perf-carve-rs <head|base> <corpus dir> <lint-rules.json>
// `head` is the carve-rs checkout, `base` the pinned release crate; the feature `base-api-01`
// selects the 0.1 API for the base. JSON lines {op,file,reps,warm} in, {ns:[...]} or {err} out.
use std::collections::HashMap;
use std::io::{BufRead, Write};
use std::sync::{Arc, Mutex};
use std::time::Instant;

type Op = Box<dyn Fn(&str)>;
type Reader = Arc<dyn Fn(&str) -> Result<String, ()> + Send + Sync>;

const STANDARD: [&str; 11] = ["carve.cite", "carve.codeGroup", "carve.details", "carve.fencedRender.mermaid",
    "carve.imgFence.image", "carve.imgFence.img", "carve.mathBlock", "carve.spoiler", "carve.spoilerBlock",
    "carve.tabs", "carve.wiki"];

macro_rules! ops_02 {
    ($c:ident, $read:expr, $rules:expr) => {{
        use $c::api;
        let mut ops: HashMap<&'static str, Op> = HashMap::new();
        let o = api::Options::default();
        ops.insert("parse", Box::new(move |s| { let _ = api::parse(s, &o); }));
        let o = api::Options::default();
        ops.insert("render", Box::new(move |s| { let _ = api::render(s, &o); }));
        let mut host = api::Carve::new();
        for n in STANDARD {
            if let Err(e) = host.enable_standard(n, n != "carve.cite") {
                eprintln!("enable {n}: {e:?}");
            }
        }
        let o = api::Options::default();
        ops.insert("ext", Box::new(move |s| { host.render(s, &o).unwrap(); }));
        let lo = api::LintOptions::default();
        ops.insert("lint", Box::new(move |s| { let _ = api::lint(s, &lo); }));
        let w = api::WriteOptions::default();
        let fhost = api::Carve::new();
        ops.insert("fmt", Box::new(move |s| { fhost.format(s, &w).unwrap(); }));
        // fix: one lint pass with every fixable rule on (the CLI's fix loop on a clean document).
        let mut fo = api::LintOptions::default();
        for r in $rules["rules"].as_array().into_iter().flatten() {
            if r.get("fix").is_some() {
                fo.rules.insert(r["id"].as_str().unwrap().into(), "on".into());
            }
        }
        ops.insert("fix", Box::new(move |s| { let _ = api::lint(s, &fo); }));
        let io = api::ImportOptions::default();
        ops.insert("import", Box::new(move |s| { api::import_document(s, &io).unwrap(); }));
        let r2: Reader = $read;
        let resolver: api::Resolver = Arc::new(move |req: &api::Request<'_>| {
            r2(req.path).map(|t| (t.into_bytes(), req.path.to_string())).map_err(|_| api::Cause::NotFound)
        });
        let mut inc = api::Includes::new(resolver);
        inc.file = Some("entry.crv".into());
        let mut io2 = api::Options::default();
        io2.includes = Some(inc);
        ops.insert("include", Box::new(move |s| { api::render(s, &io2).unwrap(); }));
        ops
    }};
}

#[cfg(feature = "base-api-01")]
fn base_ops(_read: Reader, _rules: &serde_json::Value) -> HashMap<&'static str, Op> {
    let mut ops: HashMap<&'static str, Op> = HashMap::new();
    ops.insert("parse", Box::new(|s| { let _ = base::parse(s); }));
    ops.insert("render", Box::new(|s| { let _ = base::to_html(s); }));
    ops.insert("lint", Box::new(|s| { let _ = base::lint_carve(s); }));
    ops.insert("fmt", Box::new(|s| { let _ = base::to_carve(s); }));
    let ho = base::HtmlImportOptions::default();
    ops.insert("import", Box::new(move |s| { let _ = base::html_to_carve(s, &ho); }));
    ops
}

#[cfg(not(feature = "base-api-01"))]
fn base_ops(read: Reader, rules: &serde_json::Value) -> HashMap<&'static str, Op> {
    ops_02!(base, read, rules)
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let (which, corpus, rules_path) = (args[1].clone(), args[2].clone(), args[3].clone());
    let cache: Arc<Mutex<HashMap<String, String>>> = Arc::default();
    let read: Reader = Arc::new(move |f: &str| {
        let mut c = cache.lock().unwrap();
        if let Some(s) = c.get(f) {
            return Ok(s.clone());
        }
        let s = std::fs::read_to_string(format!("{corpus}/{f}")).map_err(|_| ())?;
        c.insert(f.into(), s.clone());
        Ok(s)
    });
    let rules: serde_json::Value = serde_json::from_str(&std::fs::read_to_string(&rules_path).unwrap()).unwrap();
    let ops = match which.as_str() {
        "head" => ops_02!(head, read.clone(), rules),
        "base" => base_ops(read.clone(), &rules),
        w => panic!("unknown driver {w}"),
    };
    let stdin = std::io::stdin();
    let mut out = std::io::stdout();
    for line in stdin.lock().lines() {
        let line = line.unwrap();
        let req: serde_json::Value = serde_json::from_str(&line).unwrap();
        let op = req["op"].as_str().unwrap();
        let reps = req["reps"].as_u64().unwrap();
        let warm = req["warm"].as_u64().unwrap_or(0);
        let reply = match (ops.get(op), read(req["file"].as_str().unwrap())) {
            (None, _) => serde_json::json!({ "err": "unsupported" }),
            (_, Err(())) => serde_json::json!({ "err": "unreadable" }),
            (Some(f), Ok(s)) => match std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                for _ in 0..warm {
                    f(&s);
                }
                (0..reps).map(|_| { let t = Instant::now(); f(&s); t.elapsed().as_nanos() as u64 }).collect::<Vec<_>>()
            })) {
                Ok(ns) => serde_json::json!({ "ns": ns }),
                Err(_) => serde_json::json!({ "err": "panic" }),
            },
        };
        writeln!(out, "{reply}").unwrap();
        out.flush().unwrap();
    }
}
