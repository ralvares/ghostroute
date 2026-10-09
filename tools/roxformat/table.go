// Table configuration follows stackrox/stackrox 4.11.3 pkg/printers/table.go.
// Upstream license: Apache-2.0. See UPSTREAM.md.
package roxformat

import (
	"bytes"
	"encoding/json"
	"github.com/olekukonko/tablewriter"
	"github.com/olekukonko/tablewriter/renderer"
	"github.com/olekukonko/tablewriter/tw"
)

type Request struct {
	Headers  []string   `json:"headers"`
	Rows     [][]string `json:"rows"`
	Merge    bool       `json:"merge"`
	NoHeader bool       `json:"noHeader"`
}

func Render(input []byte) (string, error) {
	var req Request
	if err := json.Unmarshal(input, &req); err != nil {
		return "", err
	}
	var out bytes.Buffer
	merge := tw.MergeNone
	if req.Merge {
		merge = tw.MergeHierarchical
	}
	table := tablewriter.NewTable(&out,
		tablewriter.WithRenderer(renderer.NewBlueprint(tw.Rendition{
			Symbols:  tw.NewSymbols(tw.StyleASCII),
			Settings: tw.Settings{Separators: tw.Separators{BetweenRows: tw.On}, Lines: tw.Lines{ShowFooterLine: tw.On}},
		})),
		tablewriter.WithConfig(tablewriter.Config{
			Header: tw.CellConfig{Formatting: tw.CellFormatting{Alignment: tw.AlignCenter}},
			Row:    tw.CellConfig{Formatting: tw.CellFormatting{MergeMode: merge, Alignment: tw.AlignCenter, AutoWrap: tw.WrapNormal}},
		}),
	)
	if !req.NoHeader {
		table.Header(req.Headers)
	}
	for _, row := range req.Rows {
		if err := table.Append(row); err != nil {
			return "", err
		}
	}
	if err := table.Render(); err != nil {
		return "", err
	}
	return out.String(), nil
}
