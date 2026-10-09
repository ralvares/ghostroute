#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
task_go_root=$(go env GOROOT)
mkdir -p public/tools
chmod u+w public/tools/*LICENSE 2>/dev/null || true
(cd tools/template && GOOS=js GOARCH=wasm GOCACHE=/tmp/nexus-go-cache go build -trimpath -ldflags='-s -w' -o ../../public/tools/template.wasm .)
cp "$task_go_root/lib/wasm/wasm_exec.js" public/tools/wasm_exec.js
if test -f "$task_go_root/LICENSE"; then
  cp "$task_go_root/LICENSE" public/tools/GO-LICENSE
else
  cp "$task_go_root/../LICENSE" public/tools/GO-LICENSE
fi

chmod u+w public/tools/KUBERNETES-LICENSE 2>/dev/null || true
cp "$(go env GOPATH)/pkg/mod/k8s.io/client-go@v0.35.2/LICENSE" public/tools/KUBERNETES-LICENSE

cp tools/roxformat/LICENSE public/tools/STACKROX-LICENSE
cp "$(go env GOPATH)/pkg/mod/github.com/olekukonko/tablewriter@v1.1.4/LICENSE.md" public/tools/TABLEWRITER-LICENSE

chmod u+w public/tools/*LICENSE
