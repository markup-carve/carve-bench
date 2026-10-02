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
    for n in (128, 1024):
        for positions in ("true", "false"):
            yield "rs", "plain", n, positions, "A paragraph with *emphasis*.\n\n" * n
    for kind, source in (("table", "<table>" + '<tr><td><blockquote cite="u"><p>q</p></blockquote></td></tr>' * 1024 + "</table>"),
                         ("definition", "<dl>" + "<dt>Term</dt><dd><p>Definition</p></dd>" * 1024 + "</dl>")):
        for stage in ("encode", "decode", "import"):
            yield "php", kind, 1024, stage, source
    yield "php", "plain", 1024, "plain", "A paragraph with *emphasis*.\n\n" * 1024


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
                            hash=next(iter(hashes))))
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
    args = parser.parse_args()
    if args.rounds < 2 or args.rounds % 2 or args.samples < 1:
        parser.error("Use an even number of rounds >= 2 and at least one sample")
    if args.output.exists():
        parser.error("Output already exists; choose a new session path")
    roots = {(e, v): getattr(args, f"{e}_{v}").resolve() for e in ("js", "php", "rs") for v in ("main", "candidate")}
    identities = {f"{e}-{v}": source_identity(root) for (e, v), root in roots.items()}
    repo = HERE.parent.parent
    bench = source_identity(repo)
    workers = {name: digest(HERE / name) for name in ("run.py", "worker.mjs", "worker.php", "worker.rs")}
    binaries = {}
    with tempfile.TemporaryDirectory(prefix="carve-deep-review-") as temporary:
        build = Path(temporary)
        (build / "src").mkdir()
        shutil.copyfile(HERE / "worker.rs", build / "src/main.rs")
        for variant in ("main", "candidate"):
            root = roots["rs", variant]
            (build / "Cargo.toml").write_text('[package]\nname="carve-deep-review"\nversion="0.0.0"\nedition="2021"\n'
                + '[dependencies]\ncarve={package="carve-lang",path=' + json.dumps(str(root)) + '}\n'
                + '[profile.release]\nlto="thin"\ncodegen-units=1\n')
            env = dict(os.environ, CARGO_TARGET_DIR=str(args.cargo_target.resolve()))
            subprocess.run(["cargo", "build", "--release", "--manifest-path", str(build / "Cargo.toml")], env=env, check=True)
            binary = build / f"worker-{variant}"
            shutil.copyfile(args.cargo_target / "release/carve-deep-review", binary)
            binaries[variant] = binary
        for variant in ("main", "candidate"):
            subprocess.run(["npm", "run", "build"], cwd=roots["js", variant], check=True)
        for root in roots.values():
            source_identity(root)
        session = {"started_at": timestamp(), "driver": bench, "worker_hashes": workers,
                   "sources": identities, "rounds": args.rounds, "samples_per_round": args.samples,
                   "cpu": args.cpu, "invocation": sys.argv, "runtimes": {"js": execute(["node", "--version"]).strip(),
                   "php": execute(["php", "-v"]).splitlines()[0], "rs": execute(["rustc", "--version"]).strip()},
                   "rust_binary_hashes": {v: digest(p) for v, p in binaries.items()}, "rows": []}
        args.output.parent.mkdir(parents=True, exist_ok=True)
        for round_index in range(args.rounds):
            variants = ("main", "candidate") if round_index % 2 == 0 else ("candidate", "main")
            for engine, kind, n, stage, source in cases():
                fixture = build / "fixture.txt"
                fixture.write_text(source)
                for variant in variants:
                    root = roots[engine, variant]
                    if engine == "rs":
                        command = [str(binaries[variant]), str(fixture), str(args.samples), stage]
                    elif engine == "js":
                        command = ["node", str(HERE / "worker.mjs"), str(root), str(fixture), stage, str(args.samples)]
                    else:
                        command = ["php", "-d", "opcache.enable_cli=0", "-d", "pcov.enabled=0", str(HERE / "worker.php"), str(root), str(fixture), stage, str(args.samples)]
                    observed = timestamp()
                    load = os.getloadavg()
                    result = execute(["taskset", "-c", str(args.cpu), *command])
                    if engine == "rs":
                        samples, ast = result.split("\n", 1)
                        row = {"samples": [float(x) for x in samples.split(",")], "hash": hashlib.sha256(ast.encode()).hexdigest(), "warmups": 3}
                    else:
                        row = json.loads(result)
                    row.update(engine=engine, variant=variant, kind=kind, n=n, stage=stage, round=round_index,
                               observed_at=observed, load_average=load, fixture_hash=digest(fixture))
                    session["rows"].append(row)
                    args.output.write_text(json.dumps(session, indent=2) + "\n")
            print(f"Completed round {round_index + 1}/{args.rounds}", flush=True)
        for key, root in roots.items():
            if source_identity(root) != identities["-".join(key)]:
                raise RuntimeError(f"Source changed during measurement: {root}")
        if source_identity(repo) != bench or any(digest(HERE / name) != value for name, value in workers.items()):
            raise RuntimeError("Benchmark driver changed during measurement")
        session["finished_at"] = timestamp()
        session["summary"] = summarize(session["rows"])
        args.output.write_text(json.dumps(session, indent=2) + "\n")


if __name__ == "__main__":
    main()
