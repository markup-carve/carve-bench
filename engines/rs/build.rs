fn main() {
    let rustc = std::env::var("RUSTC").unwrap_or_else(|_| "rustc".into());
    let out = std::process::Command::new(rustc).arg("--version").output().expect("rustc --version");
    let version = String::from_utf8_lossy(&out.stdout).trim().trim_start_matches("rustc ").to_string();
    println!("cargo:rustc-env=BENCH_RUSTC_VERSION={version}");
}
