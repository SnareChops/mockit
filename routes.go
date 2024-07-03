package main

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"slices"
)

type FakeRoute struct {
	Path   string `json:"path"`
	Method string `json:"method"`
	Status int    `json:"status"`
	Type   string `json:"type"`
	Body   any    `json:"body"`
	Once   bool   `json:"once"`
}

type Logged struct {
	Path   string     `json:"path"`
	Method string     `json:"method"`
	Query  url.Values `json:"query"`
	Status int        `json:"status"`
	Req    any        `json:"req"`
	Res    any        `json:"res"`
}

func NewLoggedRequest(r *http.Request, status int, body any) Logged {
	reqBody, _ := parseBody(r.Header["Content-Type"], r.Body)
	return Logged{
		Path:   r.URL.Path,
		Method: r.Method,
		Query:  r.URL.Query(),
		Status: status,
		Req:    reqBody,
		Res:    body,
	}
}

func parseBody(contentType []string, body io.ReadCloser) (result any, err error) {
	if slices.Contains(contentType, "application/json") {
		err = json.NewDecoder(body).Decode(&result)
		return
	}
	// Treat as a string by default
	var b []byte
	b, err = io.ReadAll(body)
	if err != nil {
		return
	}
	result = string(b)
	return
}
