package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Handler struct {
	routes map[string]http.HandlerFunc
	logged []Logged
}

func NewHandler() *Handler {
	return &Handler{routes: map[string]http.HandlerFunc{}}
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/mockit/routes" && r.Method == http.MethodPost {
		h.create(w, r)
		return
	}
	if r.URL.Path == "/mockit/clear" && r.Method == http.MethodPost {
		h.clear(w, r)
		return
	}
	if r.URL.Path == "/mockit/requests" && r.Method == http.MethodGet {
		h.requests(w, r)
		return
	}
	key := r.Method + "|" + r.URL.Path
	if handler, ok := h.routes[key]; ok {
		handler(w, r)
		delete(h.routes, key)
		return
	}
	http.NotFound(w, r)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	var route FakeRoute
	err := json.NewDecoder(r.Body).Decode(&route)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	h.routes[route.Method+"|"+route.Path] = h.handler(route)
	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) clear(w http.ResponseWriter, _ *http.Request) {
	h.routes = map[string]http.HandlerFunc{}
	h.logged = []Logged{}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) requests(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(h.logged)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (h *Handler) handler(route FakeRoute) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h.logged = append(h.logged, NewLoggedRequest(r, route.Status, route.Body))
		w.WriteHeader(route.Status)
		w.Write(prepareBody(route.Body))
	})
}

func prepareBody(body any) (result []byte) {
	switch value := body.(type) {
	case string:
		result = []byte(value)
	case int:
		result = []byte(fmt.Sprint(value))
	case float64:
		result = []byte(fmt.Sprint(value))
	default:
		result, _ = json.Marshal(body)
	}
	return
}
