package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
)

var port string
var traceEnabled bool
var debugEnabled bool

func init() {
	flag.StringVar(&port, "port", "8080", "port to listen on")
	flag.BoolVar(&traceEnabled, "trace", false, "enable trace logging")
	flag.BoolVar(&debugEnabled, "debug", false, "enable debug logging")
	flag.Parse()
}

func main() {
	fmt.Println("Mockit server listening on port: ", port)
	if traceEnabled {
		fmt.Println("trace logging enabled")
	}
	if debugEnabled {
		fmt.Println("debug logging enabled")
	}
	if err := http.ListenAndServe(":"+port, NewHandler()); err != nil {
		panic(err)
	}
}

func trace(values ...any) {
	if traceEnabled || debugEnabled {
		log.Println(values...)
	}
}

func debug(values ...any) {
	if debugEnabled {
		log.Println(values...)
	}
}
