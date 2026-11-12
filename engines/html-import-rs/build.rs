use std::{env, fs, process::Command};

fn main() {
    println!("cargo:rerun-if-changed=Cargo.lock");
    let lock = fs::read_to_string("Cargo.lock").expect("read worker lockfile");
    let package = lock
        .split("[[package]]")
        .find(|entry| entry.contains("name = \"carve-lang\""))
        .expect("locked carve-lang package");
    let field = |key: &str| {
        package
            .lines()
            .find_map(|line| line.strip_prefix(&format!("{key} = \"")))
            .map(|value| value.trim_end_matches('"').to_owned())
    };
    // A git source names its commit; a registry release is identified by its version.
    let source = field("source").expect("locked carve-lang source");
    let revision = match source.split_once('#') {
        Some((_, rev)) => rev.to_owned(),
        None => field("version").expect("locked carve-lang version"),
    };
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
