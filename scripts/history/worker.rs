use std::{hint::black_box, time::Instant};

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.get(1).map(String::as_str) == Some("--identity") {
        println!("SOURCE_REVISION");
        return;
    }
    let source = std::fs::read_to_string(&args[1]).unwrap();
    let samples: usize = args[2].parse().unwrap();
    let warmups: usize = args[3].parse().unwrap();
    for _ in 0..warmups {
        black_box(carve::to_html(&source));
    }
    let mut times = Vec::new();
    let mut output = String::new();
    for _ in 0..samples {
        let start = Instant::now();
        output = black_box(carve::to_html(&source));
        times.push(start.elapsed().as_secs_f64() * 1000.0);
    }
    println!("{}", times.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(","));
    print!("{}", output);
}
