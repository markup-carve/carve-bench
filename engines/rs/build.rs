//! Bakes the RESOLVED carve engine identity into the harness binaries.
//!
//! The benchmark's product is comparability, so a run has to be able to say
//! which engine produced its numbers. Cargo does not expose a dependency's
//! version to a dependent's build script, but it resolves every dependency
//! into `Cargo.lock` before compiling anything, so the lock beside this
//! manifest is the record of what will actually be linked.
//!
//! A path dependency on a local checkout leaves the package in the lock with no
//! `source` key; that is reported as a checkout rather than as a release, so a
//! checkout run cannot be mistaken for a published one. Which checkout is not
//! in the lock, so `CARVE_BENCH_RS_OVERRIDE` carries it - a build that does not
//! set it says the tree was not recorded rather than implying any tree.

use std::path::Path;

const ENGINE: &str = "carve-lang";
const OVERRIDE: &str = "CARVE_BENCH_RS_OVERRIDE";

fn main() {
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR");
    let lock_path = Path::new(&manifest_dir).join("Cargo.lock");
    println!("cargo:rerun-if-changed={}", lock_path.display());
    println!("cargo:rerun-if-env-changed={OVERRIDE}");

    let overridden = std::env::var(OVERRIDE).ok().filter(|tree| !tree.is_empty());
    let resolved = std::fs::read_to_string(&lock_path)
        .ok()
        .and_then(|lock| describe(&lock, overridden.as_deref()))
        .unwrap_or_else(|| format!("{ENGINE} unresolved (no lock entry)"));

    // The harnesses embed this in a hand-written JSON line, so keep it free of
    // characters that would need escaping there.
    let resolved = resolved.replace('\\', "/").replace('"', "'");
    println!("cargo:rustc-env=CARVE_ENGINE_SOURCE={resolved}");
}

/// Find the `[[package]]` block for the engine and render it as one line.
fn describe(lock: &str, overridden: Option<&str>) -> Option<String> {
    let block = lock
        .split("[[package]]")
        .find(|block| field(block, "name").as_deref() == Some(ENGINE))?;
    let version = field(block, "version").unwrap_or_else(|| "unknown".to_owned());
    let origin = match field(block, "source") {
        // Same wording as the JS and PHP harnesses report for a checkout, so one
        // reader can check all three lanes against the tree that was asked for.
        None => match overridden {
            Some(tree) => format!("local checkout {tree}"),
            None => "local checkout, tree not recorded".to_owned(),
        },
        Some(source) if source.starts_with("registry+") => match field(block, "checksum") {
            Some(sum) => format!("crates.io, checksum {}", &sum[..sum.len().min(16)]),
            None => "crates.io".to_owned(),
        },
        Some(source) => match source.split_once('#') {
            Some((_, rev)) => format!("git {}", &rev[..rev.len().min(8)]),
            None => format!("git {source}"),
        },
    };
    Some(format!("{ENGINE} {version} ({origin})"))
}

/// Read a `key = "value"` line out of one lock block.
fn field(block: &str, key: &str) -> Option<String> {
    block.lines().find_map(|line| {
        let (found, value) = line.split_once('=')?;
        if found.trim() != key {
            return None;
        }
        Some(value.trim().trim_matches('"').to_owned())
    })
}
