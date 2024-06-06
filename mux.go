package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Mux struct {
	handlers map[string]http.HandlerFunc
}

func NewMux(routes []FakeRoute) *Mux {
	handlers := map[string]http.HandlerFunc{}
	for _, route := range routes {
		handlers[route.Method+"|"+route.Path] = handler(route)
	}
	return &Mux{
		handlers: handlers,
	}
}

func (m *Mux) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if handler, ok := m.handlers[r.Method+"|"+r.URL.Path]; ok {
		handler(w, r)
		return
	}
	http.NotFound(w, r)
}

func handler(route FakeRoute) http.HandlerFunc {
	var body []byte
	switch value := route.Body.(type) {
	case string:
		body = []byte(value)
	case int:
		body = []byte(fmt.Sprint(value))
	case float64:
		body = []byte(fmt.Sprint(value))
	default:
		body, _ = json.Marshal(route.Body)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(route.Status)
		w.Write(body)
	})
}
