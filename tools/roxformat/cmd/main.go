package main

import (
	"fmt"
	roxformat "ghostroute-roxformat"
	"io"
	"os"
)

func main() {
	input, err := io.ReadAll(os.Stdin)
	if err == nil {
		var output string
		output, err = roxformat.Render(input)
		if err == nil {
			fmt.Print(output)
			return
		}
	}
	fmt.Fprintln(os.Stderr, err)
	os.Exit(1)
}
