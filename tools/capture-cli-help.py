"""Capture public native CLI help trees, without executing examples or server operations."""
import argparse
import hashlib
import json
import os
import re
import subprocess
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("cli", choices=["roxctl", "tkn"])
parser.add_argument("binary", type=Path)
options = parser.parse_args()
env = {k: v for k, v in os.environ.items() if not k.startswith("ROX_")}
env.update(KUBECONFIG="/dev/null", LC_ALL="C", LANG="C", NO_COLOR="1")

def run(args):
    result = subprocess.run([options.cli, *args], executable=str(options.binary), env=env,
                            text=True, capture_output=True, timeout=20, check=True)
    return {"stdout": result.stdout, "stderr": result.stderr}

def children(output):
    active = False
    for line in output.splitlines():
        if line and not line[0].isspace():
            active = line.rstrip().endswith("Commands:")
        if active:
            match = re.match(r"^  ([a-z][a-z0-9-]*)\*?\s+\S", line)
            if match:
                yield match[1]

queue = [()]
pages = {}
aliases = {}
inventory = []
while queue:
    path = queue.pop(0)
    key = " ".join(path)
    if key in pages:
        continue
    page = run([*path, "--help"])
    pages[key] = page
    output = page["stdout"] + page["stderr"]
    commands = [c for c in children(output) if c != "help"]
    match = re.search(r"^Aliases:\n\s+([^\n]+)", output, re.M)
    command_aliases = match[1].strip().split(", ") if match else []
    if path:
        for alias in command_aliases:
            aliases[" ".join((*path[:-1], alias))] = key
    inventory.append({"path": options.cli + (" " + key if key else ""),
                      "subcommands": commands, "aliases": command_aliases,
                      "flags": sorted(set(re.findall(r"^\s+(?:-\w, )?(--[a-z][a-z0-9-]*)", output, re.M)))})
    queue.extend((*path, child) for child in commands)
    print("captured", len(pages), options.cli, key, flush=True)

version = run(["version", "--component=client"]) if options.cli == "tkn" else run(["version"])
version = version["stdout"] + version["stderr"]
Path(f"src/terminal/{options.cli}-help-data.json").write_text(
    json.dumps({"pages": pages, "aliases": aliases}, separators=(",", ":"), ensure_ascii=False) + "\n")
Path(f"docs/reference/{options.cli}-command-inventory.json").write_text(
    json.dumps({"client": version.strip(),
                "binarySha256": hashlib.sha256(options.binary.read_bytes()).hexdigest(),
                "scope": "Public native help pages; capture does not establish operational support",
                "pages": len(pages), "commands": inventory}, indent=2) + "\n")
print("COMPLETE:", len(pages), options.cli, "help pages; no server operations executed")
