package main

import (
	"encoding/json"
	"errors"
	"flag"
	"net/http"
	"os"
	"strings"

	"gopkg.in/yaml.v2"
)

var port string
var file string

func init() {
	flag.StringVar(&port, "port", "8080", "port to listen on")
	flag.Parse()
	file = flag.Arg(0)
	if file == "" {
		panic("missing file path to mock routes file")
	}
}

func main() {
	// Load fake routes from json or yaml file
	routes, err := load(file)
	if err != nil {
		panic(err)
	}
	// Start the server
	if err := http.ListenAndServe(":"+port, NewMux(routes)); err != nil {
		panic(err)
	}

}

type FakeRoute struct {
	Path   string `json:"path" yaml:"path"`
	Method string `json:"method" yaml:"method"`
	Status int    `json:"status" yaml:"status"`
	Body   any    `json:"body" yaml:"body"`
}

func load(path string) (routes []FakeRoute, err error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	if strings.HasSuffix(path, ".json") {
		err = json.NewDecoder(file).Decode(&routes)
	} else if strings.HasSuffix(path, ".yaml") {
		err = yaml.NewDecoder(file).Decode(&routes)
	} else {
		err = errors.New("unsupported file format")
	}
	return
}
