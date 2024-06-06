FROM golang:alpine as builder
WORKDIR /app
COPY . .
RUN go get
RUN GOOS=linux GOARCH=amd64 go build -o mockit .

FROM scratch
COPY --from=builder /app/mockit /app/mockit
ENTRYPOINT ["/app/mockit"]