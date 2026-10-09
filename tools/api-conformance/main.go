// Upstream API metadata and strategic merge oracle. Apache-2.0 dependencies.
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"reflect"
	"strings"

	route "github.com/openshift/api/route/v1"
	security "github.com/openshift/api/security/v1"
	apps "k8s.io/api/apps/v1"
	core "k8s.io/api/core/v1"
	networking "k8s.io/api/networking/v1"
	rbac "k8s.io/api/rbac/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/serializer"
	"k8s.io/apimachinery/pkg/util/strategicpatch"
)

var types = map[string]any{
	"Pod": core.Pod{}, "Deployment": apps.Deployment{}, "Namespace": core.Namespace{},
	"Service": core.Service{}, "ServiceAccount": core.ServiceAccount{}, "ConfigMap": core.ConfigMap{},
	"Secret": core.Secret{}, "ResourceQuota": core.ResourceQuota{}, "LimitRange": core.LimitRange{},
	"Node": core.Node{}, "Event": core.Event{}, "Role": rbac.Role{}, "RoleBinding": rbac.RoleBinding{},
	"ClusterRole": rbac.ClusterRole{}, "ClusterRoleBinding": rbac.ClusterRoleBinding{},
	"NetworkPolicy": networking.NetworkPolicy{}, "Route": route.Route{},
	"SecurityContextConstraints": security.SecurityContextConstraints{},
}

type rule struct {
	Key        string   `json:"key,omitempty"`
	Strategies []string `json:"strategies"`
}
type jsonRule struct {
	OmitEmpty  bool `json:"omitEmpty,omitempty"`
	OmitZero   bool `json:"omitZero,omitempty"`
	Default    any  `json:"default,omitempty"`
	Fill       bool `json:"fill,omitempty"`
	Time       bool `json:"time,omitempty"`
	Pointer    bool `json:"pointer,omitempty"`
	Collection bool `json:"collection,omitempty"`
}

func jsonRules(t reflect.Type, path string, result map[string]jsonRule, parents map[reflect.Type]bool) {
	for t.Kind() == reflect.Pointer || t.Kind() == reflect.Slice {
		t = t.Elem()
	}
	if t.Kind() != reflect.Struct || parents[t] {
		return
	}
	parents[t] = true
	defer delete(parents, t)
	for i := 0; i < t.NumField(); i++ {
		f := t.Field(i)
		tag := strings.Split(f.Tag.Get("json"), ",")
		name := tag[0]
		if name == "-" {
			continue
		}
		next := path
		if name != "" {
			next += "." + name
			r := jsonRule{}
			for _, flag := range tag[1:] {
				if flag == "omitempty" {
					r.OmitEmpty = true
				}
				if flag == "omitzero" {
					r.OmitZero = true
				}
			}
			r.Time = f.Type.PkgPath() == "k8s.io/apimachinery/pkg/apis/meta/v1" && f.Type.Name() == "Time"
			r.Pointer = f.Type.Kind() == reflect.Pointer
			r.Collection = f.Type.Kind() == reflect.Slice || f.Type.Kind() == reflect.Map
			r.Fill = !r.OmitZero && (!r.OmitEmpty || f.Type.Kind() == reflect.Struct)
			if r.Fill {
				b, err := json.Marshal(reflect.Zero(f.Type).Interface())
				if err == nil {
					json.Unmarshal(b, &r.Default)
				}
			}
			if f.Type.Kind() == reflect.Struct {
				r.OmitEmpty = false
			}
			if r.OmitEmpty || r.OmitZero || r.Fill || r.Time {
				result[next] = r
			}
		}
		jsonRules(f.Type, next, result, parents)
	}
}
func orders(t reflect.Type, path string, result map[string][]string, parents map[reflect.Type]bool) {
	for t.Kind() == reflect.Pointer || t.Kind() == reflect.Slice {
		t = t.Elem()
	}
	if t.Kind() != reflect.Struct || parents[t] {
		return
	}
	parents[t] = true
	defer delete(parents, t)
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		name := strings.Split(field.Tag.Get("json"), ",")[0]
		if name == "-" {
			continue
		}
		next := path
		if name != "" {
			result[path] = append(result[path], name)
			next += "." + name
		}
		orders(field.Type, next, result, parents)
	}
}
func schema(t reflect.Type, path string, rules map[string]rule, parents map[reflect.Type]bool) {
	for t.Kind() == reflect.Pointer || t.Kind() == reflect.Slice {
		t = t.Elem()
	}
	if t.Kind() != reflect.Struct || parents[t] {
		return
	}
	parents[t] = true
	defer delete(parents, t)
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		name := strings.Split(field.Tag.Get("json"), ",")[0]
		if name == "-" {
			continue
		}
		next := path
		if name != "" {
			next += "." + name
		}
		if strategies := field.Tag.Get("patchStrategy"); strategies != "" {
			rules[next] = rule{field.Tag.Get("patchMergeKey"), strings.Split(strategies, ",")}
		}
		schema(field.Type, next, rules, parents)
	}
}

func main() {
	if len(os.Args) > 1 && os.Args[1] == "json-rules" {
		result := map[string]map[string]jsonRule{}
		for kind, object := range types {
			rules := map[string]jsonRule{}
			jsonRules(reflect.TypeOf(object), "", rules, map[reflect.Type]bool{})
			result[kind] = rules
		}
		encoded, err := json.MarshalIndent(result, "", "  ")
		if err != nil {
			panic(err)
		}
		fmt.Println(string(encoded))
		return
	}
	if len(os.Args) > 1 && os.Args[1] == "orders" {
		result := map[string]map[string][]string{}
		for kind, object := range types {
			fields := map[string][]string{}
			orders(reflect.TypeOf(object), "", fields, map[reflect.Type]bool{})
			result[kind] = fields
		}
		encoded, err := json.MarshalIndent(result, "", "  ")
		if err != nil {
			panic(err)
		}
		fmt.Println(string(encoded))
		return
	}
	if len(os.Args) > 1 && os.Args[1] == "decode" {
		scheme := runtime.NewScheme()
		core.AddToScheme(scheme)
		apps.AddToScheme(scheme)
		rbac.AddToScheme(scheme)
		networking.AddToScheme(scheme)
		route.AddToScheme(scheme)
		security.AddToScheme(scheme)
		data, err := io.ReadAll(os.Stdin)
		if err != nil {
			panic(err)
		}
		object, _, err := serializer.NewCodecFactory(scheme).UniversalDeserializer().Decode(data, nil, nil)
		if err != nil {
			panic(err)
		}
		encoded, err := json.Marshal(object)
		if err != nil {
			panic(err)
		}
		fmt.Println(string(encoded))
		return
	}
	if len(os.Args) > 1 && os.Args[1] == "schema" {
		result := map[string]map[string]rule{}
		for kind, object := range types {
			rules := map[string]rule{}
			schema(reflect.TypeOf(object), "", rules, map[reflect.Type]bool{})
			result[kind] = rules
		}
		encoded, err := json.MarshalIndent(result, "", "  ")
		if err != nil {
			panic(err)
		}
		fmt.Println(string(encoded))
		return
	}
	var req struct {
		Kind   string
		Object json.RawMessage
		Patch  json.RawMessage
	}
	if err := json.NewDecoder(os.Stdin).Decode(&req); err != nil {
		panic(err)
	}
	object, ok := types[req.Kind]
	if !ok {
		panic("no upstream strategic schema for " + req.Kind)
	}
	result, err := strategicpatch.StrategicMergePatch(req.Object, req.Patch, object)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	fmt.Println(string(result))
}
