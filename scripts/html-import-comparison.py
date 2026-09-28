#!/usr/bin/env python3
"""Run the upstream HTML import probes with comparable persistent Carve workers."""

import argparse
import atexit
import hashlib
import json
import math
import os
from pathlib import Path
import platform
import random
import select
import statistics
import subprocess
import sys
import time
import tomllib


class Worker:
    def __init__(self, argv):
        self.argv = argv
        self.process = None
        self.serial = 0

    def close(self):
        if self.process is not None and self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
                self.process.wait()

    def request(self, request, timeout=120):
        if self.process is None:
            self.process = subprocess.Popen(self.argv, stdin=subprocess.PIPE, stdout=subprocess.PIPE, bufsize=0)
            atexit.register(self.close)
        self.serial += 1
        request = {**request, "id": self.serial}
        payload = (json.dumps(request) + "\n").encode("utf-8")
        sent = 0
        deadline = time.monotonic() + timeout
        while sent < len(payload):
            if not select.select([], [self.process.stdin], [], max(0, deadline - time.monotonic()))[1]:
                self.close()
                raise TimeoutError("converter worker did not read its request")
            sent += os.write(self.process.stdin.fileno(), payload[sent:sent + 4096])
        response_bytes = bytearray()
        while not response_bytes.endswith(b"\n"):
            if not select.select([self.process.stdout], [], [], max(0, deadline - time.monotonic()))[0]:
                self.close()
                raise TimeoutError("converter worker did not complete its response")
            chunk = os.read(self.process.stdout.fileno(), 65536)
            if not chunk:
                raise RuntimeError("converter worker closed its output")
            response_bytes.extend(chunk)
        response = json.loads(response_bytes)
        if response.get("id") != self.serial or not response.get("ok"):
            raise RuntimeError(response)
        return response

    def convert(self, html, _base_url):
        return self.request({"html": html, "mode": "safe"})["markdown"]


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def require_quiet(limit):
    load = os.getloadavg()[0]
    if load > limit:
        raise RuntimeError(f"load average {load:.2f} exceeds timing limit {limit:.2f}")
    return load


def require_complete(timings, fidelity_only):
    if len(timings["pages"]) != 10 or not timings["tools"]:
        raise RuntimeError("incomplete benchmark: expected ten pages and at least one tool")
    for page in timings["pages"].values():
        for name in timings["tools"]:
            row = page["tools"].get(name)
            if row is None or row["error"] or not row.get("output_sha256"):
                raise RuntimeError(f"incomplete conversion: {name}")
            if not fidelity_only and (len(row["samples_ms"]) != timings["reps"]
                    or any(not math.isfinite(value) or value <= 0 for value in row["samples_ms"])):
                raise RuntimeError(f"incomplete timing samples: {name}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--upstream", required=True, type=Path)
    parser.add_argument("--js", required=True, type=Path)
    parser.add_argument("--rs", required=True, type=Path)
    parser.add_argument("--js-revision", required=True)
    parser.add_argument("--rs-revision", required=True)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--reps", type=int, default=7)
    parser.add_argument("--seed", type=int, default=20260928)
    parser.add_argument("--max-load", type=float, default=(os.cpu_count() or 1) / 2)
    parser.add_argument("--only", default="")
    parser.add_argument("--fidelity-only", action="store_true")
    args = parser.parse_args()
    if args.reps < 3:
        parser.error("at least three measured repetitions are required")
    args.out.mkdir(parents=True, exist_ok=False)
    sys.dont_write_bytecode = True
    sys.path.insert(0, str(args.upstream / "harness"))
    from adapters import ALL, Adapter
    from adapters.clitools import ADAPTERS as CLI_ADAPTERS
    cli_names = {adapter.name for adapter in CLI_ADAPTERS}
    from run_all import load_corpus, slugify, measure_spawn_overhead
    import score
    import report

    root = Path(__file__).resolve().parent.parent
    js = Worker(["node", str(root / "engines/js/html-import-worker.mjs"), str(args.js.resolve())])
    rs = Worker([str(args.rs.resolve())])
    js_head = subprocess.check_output(["git", "-C", str(args.js.parent), "rev-parse", "HEAD"], text=True).strip()
    js_state = subprocess.check_output(["git", "-C", str(args.js.parent), "status", "--porcelain", "--untracked-files=no"], text=True)
    if js_head != args.js_revision or js_state:
        raise RuntimeError("JS revision does not match a clean source checkout")
    upstream_state = subprocess.check_output(["git", "-C", str(args.upstream), "status", "--porcelain", "--untracked-files=all", "--", "harness", "corpus", ":!**/__pycache__/**"], text=True)
    if upstream_state:
        raise RuntimeError("upstream harness or corpus differs from its recorded revision")
    rs_version = rs.request({"op": "version"})
    lock_text = (root / "engines/html-import-rs/Cargo.lock").read_text(encoding="utf-8")
    engine_package = next(package for package in tomllib.loads(lock_text)["package"] if package["name"] == "carve-lang")
    if rs_version["lockfile"] != lock_text or rs_version["revision"] != engine_package["source"].split("#")[-1] or rs_version["revision"] != args.rs_revision:
        raise RuntimeError("Rust worker revision or embedded lockfile does not match this benchmark")
    chosen = [adapter for adapter in ALL if not adapter.name.startswith("carve")]
    for name, language, worker, revision in [
        ("carve-js (dev main)", "JavaScript", js, args.js_revision),
        ("carve-rs (dev main)", "Rust", rs, args.rs_revision),
    ]:
        chosen.append(Adapter(name=name, kind="converter", lang=language,
            repo=f"https://github.com/markup-carve/carve-{'js' if language == 'JavaScript' else 'rs'}",
            convert=worker.convert, version_fn=lambda revision=revision: revision,
            notes="safe HTML import to AST, then Markdown; persistent worker with IPC included"))
    if args.only:
        wanted = set(args.only.split(","))
        unknown = wanted - {adapter.name for adapter in chosen}
        if unknown:
            parser.error(f"unknown tools: {sorted(unknown)}")
        chosen = [adapter for adapter in chosen if adapter.name in wanted]
    pages = load_corpus(str(args.upstream / "corpus"))
    if len(pages) != 10:
        raise RuntimeError(f"expected ten corpus pages, got {len(pages)}")
    manifest = {
        "command": sys.argv, "platform": platform.platform(), "cpu_count": os.cpu_count(),
        "node": subprocess.check_output(["node", "--version"], text=True).strip(),
        "python": sys.version, "rustc": rs_version["rustc"],
        "upstream_status": upstream_state, "js_status": js_state,
        "dependency_manifests": {str(path.relative_to(args.upstream)): digest(path)
            for name in ["package.json", "package-lock.json", "requirements.txt", "requirements.lock"]
            for path in [args.upstream / name] if path.is_file()},
        "seed": args.seed, "reps": args.reps, "fidelity_only": args.fidelity_only,
        "js_sha256": digest(args.js), "rs_sha256": digest(args.rs),
        "js_modules": {str(path.relative_to(args.js.parent)): digest(path)
            for path in sorted(args.js.parent.rglob("*.js"))},
        "runner_sha256": digest(__file__),
        "js_worker_sha256": digest(root / "engines/js/html-import-worker.mjs"),
        "rs_lock_sha256": digest(root / "engines/html-import-rs/Cargo.lock"),
        "upstream_revision": subprocess.check_output(["git", "-C", str(args.upstream), "rev-parse", "HEAD"], text=True).strip(),
        "fixtures": {str(path.relative_to(args.upstream)): digest(path)
            for path in sorted((args.upstream / "corpus").rglob("*")) if path.is_file()},
        "harness": {str(path.relative_to(args.upstream)): digest(path)
            for path in sorted((args.upstream / "harness").rglob("*")) if path.suffix in {".py", ".mjs"}},
    }
    (args.out / "provenance.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    timings = {"reps": args.reps, "tools": {}, "pages": {},
        "spawn_overhead_ms": None if args.fidelity_only else measure_spawn_overhead()}
    for adapter in chosen:
        version = adapter.version()
        if version.startswith("unknown"):
            raise RuntimeError(f"unverified tool version: {adapter.name}: {version}")
        timings["tools"][adapter.name] = {"version": version, "lang": adapter.lang,
            "kind": adapter.kind, "repo": adapter.repo, "ranked": adapter.ranked, "notes": adapter.notes,
            "invocation": "CLI including startup" if adapter.name in cli_names else "persistent worker" if adapter.name.startswith("carve-") or adapter.lang == "JavaScript" else "in-process"}
    rng = random.Random(args.seed)
    failed = False
    for page in pages:
        destination = args.out / "outputs" / page["slug"]
        destination.mkdir(parents=True)
        records = {}
        timings["pages"][page["slug"]] = {"bytes": len(page["html"].encode()), "tools": records}
        order = list(chosen)
        rng.shuffle(order)
        for adapter in order:
            records[adapter.name] = {"samples_ms": [], "load_samples": [], "median_ms": None, "error": None}
            try:
                if not args.fidelity_only:
                    require_quiet(args.max_load)
                baseline = adapter.convert(page["html"], page["meta"]["source_url"])
                (destination / f"{slugify(adapter.name)}.md").write_text(baseline, encoding="utf-8")
                records[adapter.name]["output_sha256"] = hashlib.sha256(baseline.encode()).hexdigest()
                records[adapter.name]["output_bytes"] = len(baseline.encode())
            except Exception as error:
                records[adapter.name]["error"] = str(error)
                failed = True
        if not args.fidelity_only:
            for _ in range(args.reps):
                rng.shuffle(order)
                for adapter in order:
                    record = records[adapter.name]
                    if record["error"]:
                        continue
                    try:
                        record["load_samples"].append(require_quiet(args.max_load))
                        start = time.perf_counter_ns()
                        output = adapter.convert(page["html"], page["meta"]["source_url"])
                        elapsed = (time.perf_counter_ns() - start) / 1e6
                        require_quiet(args.max_load)
                        if hashlib.sha256(output.encode()).hexdigest() != record["output_sha256"]:
                            raise RuntimeError("output changed between repetitions")
                        record["samples_ms"].append(elapsed)
                    except Exception as error:
                        record["error"] = str(error)
                        failed = True
            for record in records.values():
                if not record["error"] and len(record["samples_ms"]) == args.reps:
                    samples = record["samples_ms"]
                    record["median_ms"] = statistics.median(samples)
                    quartiles = statistics.quantiles(samples, n=4, method="inclusive")
                    record["spread_ms"] = {"min": min(samples), "max": max(samples), "iqr": quartiles[2] - quartiles[0],
                        "cv": statistics.stdev(samples) / statistics.mean(samples)}
        (args.out / "timings.json").write_text(json.dumps(timings, indent=2) + "\n", encoding="utf-8")
        print(page["slug"], {name: row["error"] or row["median_ms"] for name, row in records.items()}, flush=True)
    if failed:
        raise RuntimeError("incomplete benchmark: inspect timings.json; no ranking generated")
    require_complete(timings, args.fidelity_only)
    score.ALL = chosen
    sys.argv = ["score.py", "--corpus", str(args.upstream / "corpus"), "--results", str(args.out)]
    score.main()
    rows, timing_rows, detail = report.load(str(args.out))
    aggregate = report.aggregate(rows, timing_rows, detail)
    if args.fidelity_only:
        for row in aggregate.values():
            row["total_ms"] = None
            row["median_ms"] = None
    (args.out / "summary.json").write_text(json.dumps(aggregate, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
