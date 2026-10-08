package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"syscall/js"
	"text/template"
)

func main() {
	js.Global().Set("renderGoTemplate", js.FuncOf(func(this js.Value, args []js.Value) any {
		reply := map[string]string{}
		var data any
		err := json.Unmarshal([]byte(args[1].String()), &data)
		var output bytes.Buffer
		if err == nil {
			var parsed *template.Template
			parsed, err = template.New("output").Funcs(template.FuncMap{
				"base64decode": func(value string) (string, error) {
					decoded, err := base64.StdEncoding.DecodeString(value)
					return string(decoded), err
				},
			}).Parse(args[0].String())
			if err == nil {
				err = parsed.Execute(&output, data)
			}
		}
		if err != nil {
			reply["error"] = fmt.Sprint(err)
		} else {
			reply["output"] = output.String()
		}
		encoded, _ := json.Marshal(reply)
		return string(encoded)
	}))
	select {}
}
