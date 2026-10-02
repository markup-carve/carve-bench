"""Measure focused engine changes in prepared, clean source trees."""
import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import statistics
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent


def execute(command, cwd=None):
    return subprocess.check_output(command, cwd=cwd, text=True)


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def tree_digest(root):
    digestor = hashlib.sha256()
    for path in sorted(root.rglob("*")):
        if path.is_file():
            digestor.update(str(path.relative_to(root)).encode())
            digestor.update(bytes.fromhex(digest(path)))
    return digestor.hexdigest()


def optional_text(path):
    return path.read_text().strip() if path.exists() else None


def timestamp():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def source_identity(root):
    status = execute(["git", "status", "--porcelain"], root)
    if status:
        raise RuntimeError(f"Source tree is dirty: {root}\n{status}")
    return {"root": str(root), "revision": execute(["git", "rev-parse", "HEAD"], root).strip()}


def cases():
    for kind in ("group", "unclosed", "nested"):
        for n in (128, 1024, 4096, 8192):
            if kind == "nested" and n > 4096:
                continue
            source = {"group": "[" + "; ".join(["@a"] * n) + "]\n",
                      "unclosed": "[@" * n + "\n", "nested": "[see [x] @a] " * n + "\n"}[kind]
            for positions in ("true", "false"):
                yield "rs", kind, n, positions, source
    for kind, fragment in (("nested", "[see [x] @a] "), ("emphasis", "_[b]_ [@a] "),
                           ("link", "[a *[b]*](u) [@a] "), ("group", None),
                           ("unclosed", "[@"), ("plain", "A paragraph with *emphasis*.\n\n")):
        for n in (128, 1024, 2048):
            source = ("[" + "; ".join(["@a"] * n) + "]\n") if fragment is None else fragment * n + "\n"
            yield "js", kind, n, "true", source
    for n in (128, 1024, 4096):
        yield "js", "empty-table-rows", n, "html-import", "<table>" + "<tr><td></td></tr>" * n + "</table>"
    for n in (128, 1024, 4096):
        yield "js", "empty-tables", n, "html-import", "<table><tr><td></td></tr></table>" * n
    for n in (128, 1024):
        for positions in ("true", "false"):
            yield "rs", "plain", n, positions, "A paragraph with *emphasis*.\n\n" * n
    for kind, source in (("table", "<table>" + '<tr><td><blockquote cite="u"><p>q</p></blockquote></td></tr>' * 1024 + "</table>"),
                         ("definition", "<dl>" + "<dt>Term</dt><dd><p>Definition</p></dd>" * 1024 + "</dl>")):
        for stage in ("encode", "decode", "import"):
            yield "php", kind, 1024, stage, source
    for kind, fragment in (("table-sections", "<tbody><tr><td>x</td></tr></tbody>"),
                           ("adjacent-definitions", "<dl><dt>t</dt><dd>d</dd></dl>")):
        for n in (128, 1024, 4096):
            source = fragment * n
            if kind == "table-sections":
                source = "<table>" + source + "</table>"
            yield "php", kind, n, "build", source
    yield "php", "plain", 1024, "parse+encode", "A paragraph with *emphasis*.\n\n" * 1024

    for engine in ('js', 'rs'):
        for kind, opening, closing in (
            ('rejected-wrappers', '[', ']'),
            ('rejected-suffixes', '[', ']x'),
            ('rejected-whitespace', '[', ' ]'),
            ('rejected-commas', '[,', ']'),
            ('rejected-items', '[@a;', ']'),
            ('rejected-middle-items', '[@a; bad; @b,', ']'),
        ):
            sizes = (1024, 4096, 16384) if engine == 'js' and kind in ('rejected-items', 'rejected-middle-items') else (4096, 16384, 65536)
            for n in sizes:
                yield engine, kind, n, 'false', opening * n + '@a' + closing * n
    for n in (128, 1024, 4096):
        yield 'php', 'sibling-partitioned-tables', n, 'build', '<table><tbody><tr><td>x</td></tr></tbody><tfoot><tr><td>y</td></tr></tfoot></table>' * n

    for kind, prefix, suffix in (
        ('captioned-blank-tables', '<table><caption>c</caption>', '</table>'),
        ('quoted-blank-tables', '<blockquote><table>', '</table></blockquote>'),
        ('listed-blank-tables', '<ul><li><table>', '</table></li></ul>'),
    ):
        for n in (128, 1024):
            yield 'js', kind, n, 'html-import', (prefix + '<tr><td></td></tr><tr><td>a</td></tr>' + suffix) * n


def summarize(rows):
    groups = {}
    for row in rows:
        key = row["engine"], row["kind"], row["n"], row["stage"]
        groups.setdefault(key, {}).setdefault(row["variant"], []).append(row)
    results = []
    for key, variants in groups.items():
        hashes = {r["hash"] for rs in variants.values() for r in rs}
        if len(hashes) != 1:
            raise RuntimeError(f"Output mismatch: {key}")
        times = {v: statistics.median([s for r in rs for s in r["samples"]]) for v, rs in variants.items()}
        results.append(dict(zip(("engine", "kind", "n", "stage"), key),
                            main_ms=times["main"], candidate_ms=times["candidate"],
                            change_percent=(times["candidate"] / times["main"] - 1) * 100,
                            hash=next(iter(hashes)),
                            round_medians={v: [statistics.median(r["samples"]) for r in rs] for v, rs in variants.items()},
                            ranges={v: [min(s for r in rs for s in r["samples"]), max(s for r in rs for s in r["samples"])] for v, rs in variants.items()}))
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for engine in ("js", "php", "rs"):
        for variant in ("main", "candidate"):
            parser.add_argument(f"--{engine}-{variant}", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--cargo-target", type=Path, required=True)
    parser.add_argument("--cpu", type=int, default=6)
    parser.add_argument("--rounds", type=int, default=4)
    parser.add_argument("--samples", type=int, default=11)
    parser.add_argument("--engines", nargs='+', choices=['js', 'php', 'rs'], default=['js', 'php', 'rs'])
    parser.add_argument("--control-samples", type=int)
    parser.add_argument("--kinds", nargs="+")
    parser.add_argument("--sizes", nargs="+", type=int)
    args = parser.parse_args()
    if args.rounds < 2 or args.rounds % 2 or args.samples < 1 or (args.control_samples is not None and args.control_samples < 1):
        parser.error("Use an even number of rounds >= 2 and at least one sample")
    if args.output.exists():
        parser.error("Output already exists; choose a new session path")
    roots = {(e, v): getattr(args, f"{e}_{v}").resolve() for e in ("js", "php", "rs") for v in ("main", "candidate")}
    identities = {f"{e}-{v}": source_identity(root) for (e, v), root in roots.items()}
    dependency_files = {}
    for (engine, variant), root in roots.items():
        name = "package-lock.json" if engine == "js" else "Cargo.lock" if engine == "rs" else "vendor/composer/installed.json"
        dependency_files[f"{engine}-{variant}"] = {"path": name, "hash": digest(root / name)}
    for engine in ("js", "php", "rs"):
        if identities[f"{engine}-main"]["revision"] == identities[f"{engine}-candidate"]["revision"]:
            parser.error(f"{engine}: main and candidate revisions must differ")
    repo = HERE.parent.parent
    bench = source_identity(repo)
    workers = {name: digest(HERE / name) for name in ("run.py", "worker.mjs", "worker.php", "worker.rs")}
    binaries = {}
    with tempfile.TemporaryDirectory(prefix="carve-deep-review-") as temporary:
        build = Path(temporary)
        (build / "src").mkdir()
        shutil.copyfile(HERE / "worker.rs", build / "src/main.rs")
        shutil.copyfile(roots["rs", "main"] / "Cargo.lock", build / "Cargo.lock")
        for variant in ("main", "candidate") if 'rs' in args.engines else ():
            root = roots["rs", variant]
            bin_name = f"carve-deep-review-{os.getpid()}-{variant}"
            (build / "Cargo.toml").write_text(f'[package]\nname="carve-deep-review-{os.getpid()}"\nversion="0.0.0"\nedition="2021"\n'
                + '[dependencies]\ncarve={package="carve-lang",path=' + json.dumps(str(root)) + '}\n'
                + f'[[bin]]\nname="{bin_name}"\npath="src/main.rs"\n'
                + '[profile.release]\nlto="thin"\ncodegen-units=1\n')
            env = dict(os.environ, CARGO_TARGET_DIR=str(args.cargo_target.resolve()))
            command = ["cargo", "build", "--release", "--manifest-path", str(build / "Cargo.toml")]
            if variant == "candidate":
                command.append("--locked")
            subprocess.run(command, env=env, check=True)
            binary = build / f"worker-{variant}"
            shutil.copy2(args.cargo_target.resolve() / "release" / bin_name, binary)
            binaries[variant] = binary
        rust_lockfile = (build / "Cargo.lock").read_text() if 'rs' in args.engines else None
        for variant in ("main", "candidate") if 'js' in args.engines else ():
            subprocess.run(["npm", "run", "build"], cwd=roots["js", variant], check=True)
        for root in roots.values():
            source_identity(root)
        artifacts = {f"js-{v}": tree_digest(roots["js", v] / "dist") for v in ("main", "candidate")}
        artifacts.update({f"php-{v}": tree_digest(roots["php", v] / "vendor/composer") for v in ("main", "candidate")})
        session = {"started_at": timestamp(), "driver": bench, "worker_hashes": workers,
                   "sources": identities, "rounds": args.rounds, "samples_per_round": args.samples,
                   "cpu": args.cpu, "invocation": sys.argv, "runtimes": {"js": execute(["node", "--version"]).strip(),
                   "php": execute(["php", "-v"]).splitlines()[0], "rs": execute(["rustc", "--version"]).strip()},
                   "rust_binary_hashes": {v: digest(p) for v, p in binaries.items()}, "rows": []}
        session["rust_worker_lockfile"] = rust_lockfile
        session["rust_worker_lockfile_hash"] = digest(build / "Cargo.lock") if 'rs' in args.engines else None
        session["selected_engines"] = args.engines
        session["control_samples_per_round"] = args.control_samples
        session["artifact_hashes"] = artifacts
        session["dependency_files"] = dependency_files
        session["node_modules_paths"] = {v: str((roots["js", v] / "node_modules").resolve()) for v in ("main", "candidate")}
        session["cargo_config_hashes"] = {str(path): digest(path) if path.exists() else None for path in (Path.home() / ".cargo/config.toml", repo / ".cargo/config.toml")}
        session["rust_build_environment"] = {key: os.environ.get(key) for key in ("RUSTFLAGS", "CARGO_ENCODED_RUSTFLAGS", "RUSTUP_TOOLCHAIN")}
        session["cargo_version"] = execute(["cargo", "--version"]).strip()
        session["php_modules"] = execute(["php", "-m"])
        session["host"] = {"platform": execute(["uname", "-srmo"]).strip(),
                           "cpu": json.loads(execute(["lscpu", "-J"])), "initial_load_average": os.getloadavg(),
                           "governor": optional_text(Path(f"/sys/devices/system/cpu/cpu{args.cpu}/cpufreq/scaling_governor"))}
        args.output.parent.mkdir(parents=True, exist_ok=True)
        output_hashes = {}
        for round_index in range(args.rounds):
            variants = ("main", "candidate") if round_index % 2 == 0 else ("candidate", "main")
            for engine, kind, n, stage, source in cases():
                if engine not in args.engines or (args.kinds and kind not in args.kinds) or (args.sizes and n not in args.sizes):
                    continue
                fixture = build / "fixture.txt"
                fixture.write_text(source)
                count = args.control_samples if args.control_samples and engine == 'rs' and (kind in ('nested', 'plain') or (kind == 'group' and stage == 'false')) else args.samples
                for variant in variants:
                    root = roots[engine, variant]
                    if engine == "rs":
                        command = [str(binaries[variant]), str(fixture), str(count), stage]
                    elif engine == "js":
                        command = ["node", str(HERE / "worker.mjs"), str(root), str(fixture), stage, str(args.samples)]
                    else:
                        command = ["php", "-d", "opcache.enable_cli=0", "-d", "pcov.enabled=0", "-d", "xdebug.mode=off", str(HERE / "worker.php"), str(root), str(fixture), stage, str(args.samples)]
                    observed = timestamp()
                    load = os.getloadavg()
                    result = execute(["taskset", "-c", str(args.cpu), *command])
                    if engine == "rs":
                        samples, ast = result.split("\n", 1)
                        row = {"samples": [float(x) for x in samples.split(",")], "hash": hashlib.sha256(ast.encode()).hexdigest(), "warmups": 3}
                    else:
                        row = json.loads(result)
                    key = engine, kind, n, stage
                    expected_hash = output_hashes.setdefault(key, row["hash"])
                    if row["hash"] != expected_hash:
                        raise RuntimeError(f"Output mismatch: {key}, {variant}")
                    row.update(engine=engine, variant=variant, kind=kind, n=n, stage=stage, round=round_index,
                               observed_at=observed, load_average=load, fixture_hash=digest(fixture))
                    row['sample_count'] = count
                    row["cpu_frequency_khz"] = optional_text(Path(f"/sys/devices/system/cpu/cpu{args.cpu}/cpufreq/scaling_cur_freq"))
                    session["rows"].append(row)
                    args.output.write_text(json.dumps(session, indent=2) + "\n")
            print(f"Completed round {round_index + 1}/{args.rounds}", flush=True)
        for key, root in roots.items():
            if source_identity(root) != identities["-".join(key)]:
                raise RuntimeError(f"Source changed during measurement: {root}")
        if source_identity(repo) != bench or any(digest(HERE / name) != value for name, value in workers.items()):
            raise RuntimeError("Benchmark driver changed during measurement")
        for variant in ("main", "candidate"):
            if tree_digest(roots["js", variant] / "dist") != artifacts[f"js-{variant}"] or tree_digest(roots["php", variant] / "vendor/composer") != artifacts[f"php-{variant}"]:
                raise RuntimeError(f"Build artifacts changed during measurement: {variant}")
        session["finished_at"] = timestamp()
        session["summary"] = summarize(session["rows"])
        args.output.write_text(json.dumps(session, indent=2) + "\n")


if __name__ == "__main__":
    main()
