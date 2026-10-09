# roxctl table output

The rendering configuration follows `pkg/printers/table.go` in
stackrox/stackrox 4.11.3, commit `9947d9c2267c78595af7af197c4af8900008b269`.
It uses the same `github.com/olekukonko/tablewriter` v1.1.4 dependency.
Source: https://github.com/stackrox/stackrox/blob/9947d9c2267c78595af7af197c4af8900008b269/pkg/printers/table.go

Go code is compiled into the existing browser WASM tool, with no external runtime
requests. The native command is used by output comparison tests only.
Upstream code is licensed under Apache-2.0; see `LICENSE`.

`src/security/rhacs/default-policies.ts` contains all 89 policy JSON files from
`pkg/defaults/policies/files` at the same commit, retaining their IDs, default
status, stages and enforcement actions. Their prose is upstream material under
Apache-2.0. The image catalog, vulnerability associations, violation messages and
release hardening policy are authored training fixtures, not registry scan data.
Tablewriter is MIT licensed; its license is distributed with the offline tools.

Output oracle: `tools/roxctl-conformance/compare.mjs` runs native roxctl 4.11.3
against explicit localhost gRPC/HTTP servers with fictional credentials and
compares stdout bytes and exit codes. It does not contact a real Central or
validate the full server-side policy engine. Reproduce after `npm test`:

```
(cd tools/roxformat && go build -o /private/tmp/ghostroute-rox-table ./cmd)
node tools/roxctl-conformance/compare.mjs
```
