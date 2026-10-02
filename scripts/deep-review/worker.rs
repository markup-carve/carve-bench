use std::{hint::black_box, time::Instant};

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let source = std::fs::read_to_string(&args[1]).unwrap();
    let count: usize = args[2].parse().unwrap();
    let citations = carve::Citations::new();
    let options = carve::Options {
        extensions: vec![&citations],
        positions: args[3] == "true",
        ..carve::Options::default()
    };
    for _ in 0..3 {
        black_box(carve::parse_with_options(&source, &options));
    }
    let mut times = Vec::new();
    for _ in 0..count {
        let start = Instant::now();
        black_box(carve::parse_with_options(&source, &options));
        times.push(start.elapsed().as_secs_f64() * 1000.0);
    }
    println!("{}", times.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(","));
    print!("{}", carve::to_json(&carve::parse_with_options(&source, &options)));
}
