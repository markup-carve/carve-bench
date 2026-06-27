//! carve-rs render benchmark harness.
//! Usage: carve-bench-rs <doc-path> <iters>
//! Emits one JSON line: { engine, ms_per_op, mb_per_s, iters, bytes }.

use std::time::Instant;

fn main() {
    let mut args = std::env::args().skip(1);
    let doc_path = args.next().expect("usage: carve-bench-rs <doc-path> <iters>");
    let iters: u32 = args.next().and_then(|s| s.parse().ok()).unwrap_or(200);

    let src = std::fs::read_to_string(&doc_path).expect("cannot read doc");
    let bytes = src.len();

    // Warm up.
    for _ in 0..iters.min(20) {
        std::hint::black_box(carve::to_html(&src));
    }

    let start = Instant::now();
    for _ in 0..iters {
        std::hint::black_box(carve::to_html(&src));
    }
    let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;

    let ms_per_op = elapsed_ms / f64::from(iters);
    let mb_per_s = (bytes as f64) / 1024.0 / 1024.0 / (ms_per_op / 1000.0);
    println!(
        "{{\"engine\":\"carve-rs\",\"ms_per_op\":{:.4},\"mb_per_s\":{:.2},\"iters\":{},\"bytes\":{}}}",
        ms_per_op, mb_per_s, iters, bytes
    );
}
