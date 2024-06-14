package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type handler struct {
	once bool
	fn   http.HandlerFunc
}

type Handler struct {
	routes map[string]handler
	logged []Logged
}

func NewHandler() *Handler {
	return &Handler{routes: map[string]handler{}}
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
	if route, ok := h.routes[key]; ok {
		route.fn(w, r)
		if route.once {
			debug("'once' route used, removing.", r.Method, r.URL.Path)
			delete(h.routes, key)
		}
		return
	}
	trace("Unknown request received", r.Method, r.URL.Path)
	http.NotFound(w, r)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	var route FakeRoute
	err := json.NewDecoder(r.Body).Decode(&route)
	if err != nil {
		debug("Failed to decode mock route", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	h.routes[route.Method+"|"+route.Path] = h.handler(route)
	w.WriteHeader(http.StatusCreated)
	trace("Mock route created", route.Method, route.Path, "once:", route.Once)
}

func (h *Handler) clear(w http.ResponseWriter, _ *http.Request) {
	h.routes = map[string]handler{}
	h.logged = []Logged{}
	w.WriteHeader(http.StatusNoContent)
	trace("Mocks and requests cleared!")
}

func (h *Handler) requests(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(h.logged)
	if err != nil {
		debug("Failed to encode requests", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	trace("Request history requested")
}

func (h *Handler) handler(route FakeRoute) handler {
	return handler{
		once: route.Once,
		fn: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			trace("Mock request received", route.Method, route.Path)
			h.logged = append(h.logged, NewLoggedRequest(r, route.Status, route.Body))
			w.WriteHeader(route.Status)
			body := prepareBody(route.Body)
			w.Write(body)
			debug("Sending mock response", route.Status, string(body))
		}),
	}
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
