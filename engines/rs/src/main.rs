//! Rust lane: Carve 0.2, Carve 0.1 on its tree route, and the Markdown and Djot peers, parse and parse plus HTML.
//!   carve-bench-rs DOCS_DIR OUT_FILE [ROUNDS] [SAMPLE_MS]
use serde_json::{json, Value};
use std::hint::black_box;
use std::time::{Duration, Instant};

type Run = fn(&str) -> usize;

struct Engine {
    id: &'static str,
    label: &'static str,
    version: &'static str,
    lang: &'static str,
    parse: Run,
    html: Run,
}

// The tree the renderer works on: parsed and resolved in an arena.
fn carve02_parse(src: &str) -> usize {
    let arena = carve2::Arena::new();
    black_box(carve2::parse_resolved_in(src, &carve2::Options::default(), &arena)).children.len()
}

// The same tree before the resolve step (references, heading ids, numbers, sections).
fn carve02_parse_only(src: &str) -> usize {
    let arena = carve2::Arena::new();
    black_box(carve2::parse_in(src, &arena)).children.len()
}

fn carve02_html(src: &str) -> usize {
    carve2::render(src, &carve2::Options::default()).len()
}

fn carve01_parse(src: &str) -> usize {
    black_box(carve::parse(src)).children.len()
}

// The 0.1 normal path. `carve::to_html` would try `try_layout_html` first.
fn carve01_html(src: &str) -> usize {
    carve::render_html(&carve::parse(src)).expect("parsed tree").len()
}

fn pulldown_parse(src: &str) -> usize {
    pulldown_cmark::Parser::new(src).collect::<Vec<_>>().len()
}

fn pulldown_html(src: &str) -> usize {
    let mut out = String::new();
    pulldown_cmark::html::push_html(&mut out, pulldown_cmark::Parser::new(src));
    out.len()
}

fn comrak_parse(src: &str) -> usize {
    let arena = comrak::Arena::new();
    let root = comrak::parse_document(&arena, src, &comrak::Options::default());
    root.children().count()
}

fn comrak_html(src: &str) -> usize {
    let arena = comrak::Arena::new();
    let options = comrak::Options::default();
    let root = comrak::parse_document(&arena, src, &options);
    let mut out = String::new();
    comrak::format_html(root, &options, &mut out).expect("comrak html");
    out.len()
}

// comrak with the extensions that bring it closer to what Carve reads by default.
fn comrak_ext_options() -> comrak::Options<'static> {
    let mut options = comrak::Options::default();
    options.extension.table = true;
    options.extension.footnotes = true;
    options.extension.tasklist = true;
    options.extension.strikethrough = true;
    options.extension.header_id_prefix = Some(String::new());
    options
}

fn comrak_ext_parse(src: &str) -> usize {
    let arena = comrak::Arena::new();
    let root = comrak::parse_document(&arena, src, &comrak_ext_options());
    root.children().count()
}

fn comrak_ext_html(src: &str) -> usize {
    let arena = comrak::Arena::new();
    let options = comrak_ext_options();
    let root = comrak::parse_document(&arena, src, &options);
    let mut out = String::new();
    comrak::format_html(root, &options, &mut out).expect("comrak html");
    out.len()
}

fn jotdown_parse(src: &str) -> usize {
    jotdown::Parser::new(src).collect::<Vec<_>>().len()
}

fn jotdown_html(src: &str) -> usize {
    jotdown::html::render_to_string(jotdown::Parser::new(src)).len()
}

fn engines() -> Vec<Engine> {
    vec![
        Engine { id: "carve02", label: "Carve 0.2", version: "0.2 (carve2, v2/)", lang: "crv", parse: carve02_parse, html: carve02_html },
        Engine { id: "carve02-parse-only", label: "Carve 0.2, no resolve", version: "0.2 (carve2, v2/)", lang: "crv", parse: carve02_parse_only, html: carve02_html },
        Engine { id: "carve01", label: "Carve 0.1", version: "carve-lang 0.1.14", lang: "crv", parse: carve01_parse, html: carve01_html },
        Engine { id: "pulldown-cmark", label: "pulldown-cmark (no tree)", version: "0.13.4", lang: "md", parse: pulldown_parse, html: pulldown_html },
        Engine { id: "comrak", label: "comrak", version: "0.54.0", lang: "md", parse: comrak_parse, html: comrak_html },
        Engine { id: "comrak-ext", label: "comrak + extensions", version: "0.54.0", lang: "md", parse: comrak_ext_parse, html: comrak_ext_html },
        Engine { id: "jotdown", label: "jotdown (no tree)", version: "0.10.0", lang: "dj", parse: jotdown_parse, html: jotdown_html },
    ]
}

struct Cell {
    engine: usize,
    doc: usize,
    phase: &'static str,
    samples: Vec<f64>,
}

/// Microseconds per call over a loop of at least `min`.
fn sample(run: Run, src: &str, min: Duration, sink: &mut usize) -> f64 {
    let start = Instant::now();
    let mut iterations = 0u32;
    loop {
        *sink = sink.wrapping_add(run(black_box(src)));
        iterations += 1;
        let elapsed = start.elapsed();
        if elapsed >= min {
            return elapsed.as_secs_f64() * 1e6 / f64::from(iterations);
        }
    }
}

fn median(values: &[f64]) -> f64 {
    let mut sorted = values.to_vec();
    sorted.sort_by(f64::total_cmp);
    let mid = sorted.len() / 2;
    if sorted.len() % 2 == 1 { sorted[mid] } else { (sorted[mid - 1] + sorted[mid]) / 2.0 }
}

const ELEMENTS: [(&str, &[&str]); 6] = [
    ("p", &["<p>", "<p "]),
    ("li", &["<li>", "<li "]),
    ("h1-h6", &["<h1>", "<h1 ", "<h2>", "<h2 ", "<h3>", "<h3 ", "<h4>", "<h4 ", "<h5>", "<h5 ", "<h6>", "<h6 "]),
    ("a", &["<a "]),
    ("td/th", &["<td>", "<td ", "<th>", "<th "]),
    ("code", &["<code>", "<code "]),
];

fn counts(html: &str) -> Value {
    let mut map = serde_json::Map::new();
    for (name, needles) in ELEMENTS {
        let total: usize = needles.iter().map(|n| html.matches(n).count()).sum();
        map.insert(name.to_string(), json!(total));
    }
    Value::Object(map)
}

fn first_heading_text(doc: &mut carve::Document) -> Option<&mut String> {
    doc.children.iter_mut().find_map(|block| match block {
        carve::BlockNode::Heading(h) => h.children.iter_mut().find_map(|inline| match inline {
            carve::InlineNode::Text(t) => Some(&mut t.value),
            _ => None,
        }),
        _ => None,
    })
}

/// `render_html` takes only the tree; an edit to the tree shows in the HTML.
fn route_proof() -> Value {
    let src = "# Title\n\nHello *world*.\n";
    let mut doc = carve::parse(src);
    let before = carve::render_html(&doc).expect("tree");
    let edited = first_heading_text(&mut doc).map(|text| *text = "TREE-ROUTE".to_string()).is_some();
    let after = carve::render_html(&doc).expect("tree");
    json!({
        "engine": "Carve 0.1 (Rust)",
        "input": src,
        "toHtml": carve::to_html(src),
        "treeRouteHtml": before,
        "treeRouteHtmlAfterTreeEdit": after,
        "builtFromTree": edited && after.contains("TREE-ROUTE") && before == carve::to_html(src),
    })
}

fn read(dir: &str, name: &str, lang: &str) -> String {
    std::fs::read_to_string(format!("{dir}/{name}.{lang}")).expect("document")
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let dir = args.get(1).expect("DOCS_DIR").clone();
    let out = args.get(2).expect("OUT_FILE").clone();
    let rounds: usize = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(15);
    let sample_ms: u64 = args.get(4).and_then(|s| s.parse().ok()).unwrap_or(200);
    let min = Duration::from_millis(sample_ms);
    let names: Vec<String> = read(&dir, "list", "txt").lines().filter(|l| !l.is_empty()).map(String::from).collect();
    let all = engines();
    let sources: Vec<Vec<String>> = names.iter().map(|n| all.iter().map(|e| read(&dir, n, e.lang)).collect()).collect();

    let verify: Vec<Value> = names.iter().enumerate().map(|(d, name)| {
        let src = &sources[d][0];
        json!({
            "document": name,
            "carve01": counts(&carve::render_html(&carve::parse(src)).expect("tree")),
            "carve02": counts(&carve2::render(src, &carve2::Options::default())),
        })
    }).collect();

    let mut cells = Vec::new();
    for doc in 0..names.len() {
        for engine in 0..all.len() {
            for phase in ["parse", "html"] {
                cells.push(Cell { engine, doc, phase, samples: Vec::new() });
            }
        }
    }
    let mut sink = 0usize;
    let run_of = |c: &Cell| if c.phase == "parse" { all[c.engine].parse } else { all[c.engine].html };
    for c in &cells {
        sample(run_of(c), &sources[c.doc][c.engine], min, &mut sink);
    }
    let n = cells.len();
    for round in 0..rounds {
        let offset = round * n / rounds;
        for i in 0..n {
            let at = (offset + i) % n;
            let us = sample(run_of(&cells[at]), &sources[cells[at].doc][cells[at].engine], min, &mut sink);
            cells[at].samples.push(us);
        }
    }

    let result = json!({
        "language": "Rust",
        "runtime": format!("rustc {}", env!("BENCH_RUSTC_VERSION")),
        "method": { "rounds": rounds, "sampleMs": sample_ms, "warmup": format!("one loop of at least {sample_ms} ms per cell"), "order": "rotated per round" },
        "engines": all.iter().map(|e| json!({ "id": e.id, "label": e.label, "version": e.version, "lang": e.lang })).collect::<Vec<_>>(),
        "documents": names.iter().enumerate().map(|(d, name)| {
            let bytes = |lang: &str| read(&dir, name, lang).len();
            let _ = d;
            json!({ "name": name, "bytes": { "crv": bytes("crv"), "md": bytes("md"), "dj": bytes("dj") } })
        }).collect::<Vec<_>>(),
        "cells": cells.iter().map(|c| json!({
            "engine": all[c.engine].id, "document": names[c.doc], "phase": c.phase,
            "bytes": sources[c.doc][c.engine].len(),
            "medianUs": median(&c.samples), "minUs": c.samples.iter().copied().fold(f64::INFINITY, f64::min),
            "samplesUs": c.samples,
        })).collect::<Vec<_>>(),
        "verify": verify,
        "route": route_proof(),
        "sink": sink,
    });
    std::fs::write(out, serde_json::to_string_pretty(&result).expect("json") + "\n").expect("write");
}
