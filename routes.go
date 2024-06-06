package main

import (
	"net/http"
	"net/url"
)

type FakeRoute struct {
	Path   string `json:"path"`
	Method string `json:"method"`
	Status int    `json:"status"`
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
	return Logged{
		Path:   r.URL.Path,
		Method: r.Method,
		Query:  r.URL.Query(),
		Status: status,
		Req:    r.Body,
		Res:    body,
	}
}
