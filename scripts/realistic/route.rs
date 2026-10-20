use std::{hint::black_box, time::Instant};

#[repr(C)]
struct Timespec { tv_sec: i64, tv_nsec: i64 }
// The benchmark runner targets 64-bit Linux, where this clock ID is process CPU time.
unsafe extern "C" { fn clock_gettime(clock_id: i32, tp: *mut Timespec) -> i32; }
fn cpu_ms() -> f64 {
    let mut t = Timespec { tv_sec: 0, tv_nsec: 0 };
    assert_eq!(unsafe { clock_gettime(2, &mut t) }, 0);
    t.tv_sec as f64 * 1000.0 + t.tv_nsec as f64 / 1_000_000.0
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.get(1).map(String::as_str) == Some("measure") {
        let source = std::fs::read_to_string(&args[2]).expect("fixture");
        let samples: usize = args[3].parse().expect("sample count");
        let warmups: usize = args[4].parse().expect("warmups");
        for _ in 0..warmups { black_box(carve::to_html(&source)); }
        let mut wall = Vec::new();
        let mut cpu = Vec::new();
        let mut output = String::new();
        for _ in 0..samples {
            let cpu_start = cpu_ms();
            let start = Instant::now();
            let next_output = black_box(carve::to_html(&source));
            let wall_elapsed = start.elapsed().as_secs_f64() * 1000.0;
            let cpu_elapsed = cpu_ms() - cpu_start;
            wall.push(wall_elapsed);
            cpu.push(cpu_elapsed);
            output = next_output;
        }
        println!("{}", wall.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(","));
        println!("{}", cpu.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(","));
        print!("{output}");
        return;
    }
    let path = args.get(1).expect("fixture path");
    let source = std::fs::read_to_string(path).expect("fixture");
    // Pinned carve-rs rejects ::: in parse::try_layout_into, the exact direct
    // guard called by to_html before the AST parser.
    assert!(source.contains(":::"), "fixture lacks the default API's AST-route marker");
    let route = carve::try_render_html_streaming(&source, &carve::Options::default(), |_| {});
    match route {
        carve::StreamOutcome::Complete => println!("direct"),
        carve::StreamOutcome::NeedsAst => println!("ast"),
    }
}
