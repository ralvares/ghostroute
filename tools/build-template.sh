#!/bin/sh
set -eu
task_go_root=$(go env GOROOT)
mkdir -p public/tools
GOOS=js GOARCH=wasm GOCACHE=/tmp/nexus-go-cache go build -trimpath -ldflags='-s -w' -o public/tools/template.wasm tools/template/main.go
cp "$task_go_root/lib/wasm/wasm_exec.js" public/tools/wasm_exec.js
if test -f "$task_go_root/LICENSE"; then
  cp "$task_go_root/LICENSE" public/tools/GO-LICENSE
else
  cp "$task_go_root/../LICENSE" public/tools/GO-LICENSE
fi
