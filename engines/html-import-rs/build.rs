use std::{env, fs, process::Command};

fn main() {
    println!("cargo:rerun-if-changed=Cargo.lock");
    let lock = fs::read_to_string("Cargo.lock").expect("read worker lockfile");
    let package = lock
        .split("[[package]]")
        .find(|entry| entry.contains("name = \"carve-lang\""))
        .expect("locked carve-lang package");
    let source = package
        .lines()
        .find(|line| line.starts_with("source = "))
        .unwrap();
    let revision = source.split('#').nth(1).unwrap().trim_end_matches('"');
    println!("cargo:rustc-env=CARVE_ENGINE_REVISION={revision}");
    let compiler = Command::new(env::var("RUSTC").unwrap())
        .arg("--version")
        .output()
        .unwrap();
    println!(
        "cargo:rustc-env=CARVE_BUILD_RUSTC={}",
        String::from_utf8(compiler.stdout).unwrap().trim()
    );
}
