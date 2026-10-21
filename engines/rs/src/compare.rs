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
    let mut cpu_samples = Vec::with_capacity(trials);
    for _ in 0..trials {
        let start = Instant::now();
        let cpu_start = process_cpu_seconds();
        for _ in 0..iterations {
            black_box(render());
        }
        samples.push(start.elapsed().as_secs_f64() * 1000.0 / iterations as f64);
        cpu_samples.push(match (cpu_start, process_cpu_seconds()) {
            (Some(before), Some(after)) => Some((after - before) * 1000.0 / iterations as f64),
            _ => None,
        });
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
    let mut encoded_cpu = String::new();
    for (index, sample) in cpu_samples.iter().enumerate() {
        if index > 0 {
            encoded_cpu.push(',');
        }
        match sample {
            Some(value) => write!(&mut encoded_cpu, "{value:.6}").unwrap(),
            None => encoded_cpu.push_str("null"),
        }
    }
    // Only the Carve row carries `carve_source`; on a peer row it would name an
    // engine that did not produce the number.
    let carve_source = if engine == "carve-rs" {
        format!(",\"carve_source\":\"{}\"", env!("CARVE_ENGINE_SOURCE"))
    } else {
        String::new()
    };
    let mut output_hex = String::new();
    for byte in render().bytes() {
        write!(&mut output_hex, "{byte:02x}").unwrap();
    }
    println!("{{\"engine\":\"{engine}\",\"bytes\":{},\"iterations\":{iterations},\"trials\":{trials},\"samples\":[{encoded}],\"cpu_samples_ms\":[{encoded_cpu}],\"ms_per_op\":{min:.6},\"mb_per_s\":{throughput:.2}{carve_source},\"output_hex\":\"{output_hex}\"}}", source.len());
}

#[cfg(target_os = "linux")]
fn process_cpu_seconds() -> Option<f64> {
    use std::ffi::c_long;

    #[repr(C)]
    struct Timespec {
        tv_sec: c_long,
        tv_nsec: c_long,
    }
    unsafe extern "C" {
        fn clock_gettime(clock_id: i32, time: *mut Timespec) -> i32;
    }
    const CLOCK_PROCESS_CPUTIME_ID: i32 = 2;
    let mut time = Timespec {
        tv_sec: 0,
        tv_nsec: 0,
    };
    if unsafe { clock_gettime(CLOCK_PROCESS_CPUTIME_ID, &mut time) } != 0 {
        return None;
    }
    Some(time.tv_sec as f64 + time.tv_nsec as f64 / 1e9)
}

#[cfg(not(target_os = "linux"))]
fn process_cpu_seconds() -> Option<f64> {
    None
}
