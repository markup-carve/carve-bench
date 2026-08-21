use std::fmt::Write as _;
use std::hint::black_box;
use std::time::Instant;

fn main() {
    let mut args = std::env::args().skip(1);
    let engine = args.next().expect("engine");
    let path = args.next().expect("document");
    let iterations: usize = args.next().and_then(|s| s.parse().ok()).unwrap_or(100);
    let trials: usize = args.next().and_then(|s| s.parse().ok()).unwrap_or(5);
    let source = std::fs::read_to_string(path).expect("cannot read document");
    let render = || -> String {
        match engine.as_str() {
            "carve-rs" => carve::to_html(&source),
            "jotdown" => jotdown::html::render_to_string(jotdown::Parser::new(&source)),
            "comrak" => {
                let mut options = comrak::Options::default();
                options.extension.table = true;
                comrak::markdown_to_html(&source, &options)
            }
            "pulldown-cmark" => {
                let mut html = String::new();
                let options = pulldown_cmark::Options::ENABLE_TABLES;
                pulldown_cmark::html::push_html(
                    &mut html,
                    pulldown_cmark::Parser::new_ext(&source, options),
                );
                html
            }
            _ => panic!("unknown engine: {engine}"),
        }
    };
    for _ in 0..20 {
        black_box(render());
    }
    let mut samples = Vec::with_capacity(trials);
    for _ in 0..trials {
        let start = Instant::now();
        for _ in 0..iterations {
            black_box(render());
        }
        samples.push(start.elapsed().as_secs_f64() * 1000.0 / iterations as f64);
    }
    let min = samples.iter().copied().fold(f64::INFINITY, f64::min);
    let throughput = source.len() as f64 / 1_048_576.0 / (min / 1000.0);
    let mut encoded = String::new();
    for (index, sample) in samples.iter().enumerate() {
        if index > 0 {
            encoded.push(',');
        }
        write!(&mut encoded, "{sample:.6}").unwrap();
    }
    // Only the Carve row carries `carve_source`; on a peer row it would name an
    // engine that did not produce the number.
    let carve_source = if engine == "carve-rs" {
        format!(",\"carve_source\":\"{}\"", env!("CARVE_ENGINE_SOURCE"))
    } else {
        String::new()
    };
    println!("{{\"engine\":\"{engine}\",\"bytes\":{},\"iterations\":{iterations},\"trials\":{trials},\"samples\":[{encoded}],\"ms_per_op\":{min:.6},\"mb_per_s\":{throughput:.2}{carve_source}}}", source.len());
}
