package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/websocket"
)

type handler struct {
	route FakeRoute
	fn    http.HandlerFunc
}

type Handler struct {
	routes   map[string]handler
	logged   []Logged
	upgrader websocket.Upgrader
	conns    []*websocket.Conn
}

func NewHandler() *Handler {
	return &Handler{
		routes: map[string]handler{},
		logged: []Logged{},
		conns:  []*websocket.Conn{},
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		},
	}
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/mockit/routes" && r.Method == http.MethodPost {
		h.create(w, r)
		return
	}
	if r.URL.Path == "/mockit/routes" && r.Method == http.MethodGet {
		h.getMocks(w, r)
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
	if r.URL.Path == "/mockit/ws" && r.Method == http.MethodGet {
		h.upgradeWebsocket(w, r)
		return
	}
	if r.URL.Path == "/mockit/ui" && r.Method == http.MethodGet {
		http.ServeFile(w, r, "ui/index.html")
		return
	}
	if file, ok := strings.CutPrefix(r.URL.Path, "/mockit/ui"); ok && r.Method == http.MethodGet {
		http.ServeFile(w, r, "ui/"+file)
		return
	}
	key := r.Method + "|" + r.URL.Path
	if route, ok := h.routes[key]; ok {
		route.fn(w, r)
		if route.route.Once {
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
	h.broadcast("created", route)
	trace("Mock route created", route.Method, route.Path, "once:", route.Once)
}

func (h *Handler) getMocks(w http.ResponseWriter, _ *http.Request) {
	mocks := []FakeRoute{}
	for _, value := range h.routes {
		mocks = append(mocks, value.route)
	}
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(200)
	err := json.NewEncoder(w).Encode(mocks)
	if err != nil {
		log.Println(err)
		// http.Error(w, err.Error(), 500)
	}
}

func (h *Handler) clear(w http.ResponseWriter, _ *http.Request) {
	h.routes = map[string]handler{}
	h.logged = []Logged{}
	w.WriteHeader(http.StatusNoContent)
	h.broadcast("cleared", nil)
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
		route: route,
		fn: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			trace("Mock request received", route.Method, route.Path)
			logged := NewLoggedRequest(r, route.Status, route.Body)
			h.logged = append(h.logged, logged)
			w.Header().Add("Content-Type", route.Type)
			w.WriteHeader(route.Status)
			body := prepareBody(route.Body)
			w.Write(body)
			h.broadcast("called", logged)
			debug("Sending mock response", route.Status, string(body))
		}),
	}
}

func (h *Handler) upgradeWebsocket(w http.ResponseWriter, r *http.Request) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		debug("Failed to upgrade websocket", err.Error())
		return
	}
	trace("websocket listener connected")
	h.conns = append(h.conns, conn)
	conn.WriteJSON(map[string]any{"type": "hello"})
}

var id = 0

func (h *Handler) broadcast(typ string, value any) {
	id++
	for i, conn := range h.conns {
		err := conn.WriteJSON(map[string]any{"id": id, "type": typ, "value": value})
		if err != nil {
			debug("Failed to send websocket message:", err.Error())
			h.conns = append(h.conns[:i], h.conns[i+1:]...)
		}
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
