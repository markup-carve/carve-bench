#!/usr/bin/env python3
"""Check the Rust HTML import worker at its supported nesting boundary."""

import json
from pathlib import Path
import resource
import subprocess
import sys


def limit_stack():
    size = 2 * 1024 * 1024
    resource.setrlimit(resource.RLIMIT_STACK, (size, size))


def request(depth, request_id):
    return {"id": request_id, "html": "<div>" * depth + "word" + "</div>" * depth, "mode": "safe"}


worker = Path(sys.argv[1]).resolve()
result = subprocess.run(
    [str(worker)],
    input="".join(json.dumps(request(depth, index)) + "\n" for index, depth in ((1, 63), (2, 64))),
    text=True,
    capture_output=True,
    timeout=10,
    check=True,
    preexec_fn=limit_stack,
)
responses = [json.loads(line) for line in result.stdout.splitlines()]
assert len(responses) == 2, responses
assert responses[0]["id"] == 1 and responses[0]["ok"] and responses[0]["markdown"].strip() == "word", responses[0]
assert responses[1] == {"id": 2, "ok": False, "error": "DepthLimit"}, responses[1]
print("ok: 63 nested elements import on a 2 MiB stack; 64 meet the depth limit")
