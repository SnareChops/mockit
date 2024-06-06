package main

import (
	"flag"
	"fmt"
	"net/http"
)

var port string

func init() {
	flag.StringVar(&port, "port", "8080", "port to listen on")
	flag.Parse()
}

func main() {
	fmt.Println("Mockit server listening on port: ", port)
	if err := http.ListenAndServe(":"+port, NewHandler()); err != nil {
		panic(err)
	}
}

// func load(path string) (routes []FakeRoute, err error) {
// 	file, err := os.Open(path)
// 	if err != nil {
// 		return nil, err
// 	}
// 	if strings.HasSuffix(path, ".json") {
// 		err = json.NewDecoder(file).Decode(&routes)
// 	} else if strings.HasSuffix(path, ".yaml") {
// 		err = yaml.NewDecoder(file).Decode(&routes)
// 	} else {
// 		err = errors.New("unsupported file format")
// 	}
// 	return
// }
