use std::io::{self, BufRead, Write};
use std::time::{Duration, Instant};
use serde_json::{json, Value};

fn main() {
    let mut stdout = io::stdout().lock();
    writeln!(stdout, "{}", json!({"ready": true, "revision": env!("CARVE_REVISION")})).unwrap();
    stdout.flush().unwrap();
    for line in io::stdin().lock().lines() {
        let request: Value = serde_json::from_str(&line.unwrap()).unwrap();
        let source = request["source"].as_str().unwrap();
        let converted = carve::djot_to_carve(source);
        let html = carve::to_html(&converted);
        let operation = request["operation"].as_str().unwrap();
        let run = || {
            if operation == "import" {
                std::hint::black_box(carve::djot_to_carve(std::hint::black_box(source)));
            } else {
                std::hint::black_box(carve::to_html(std::hint::black_box(&converted)));
            }
        };
        let start = Instant::now();
        let mut runs = 0u64;
        if let Some(ms) = request["warmupMs"].as_u64() {
            let duration = Duration::from_millis(ms);
            while start.elapsed() < duration {
                run();
                runs += 1;
            }
        } else {
            for _ in 0..request["iterations"].as_u64().unwrap() {
                run();
                runs += 1;
            }
        }
        let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
        writeln!(stdout, "{}", json!({"milliseconds": elapsed_ms / runs as f64,
            "elapsedMs": elapsed_ms, "runs": runs, "converted": converted, "html": html})).unwrap();
        stdout.flush().unwrap();
    }
}
