# Mockit

An extremely simple mocking webservice. Designed for use in call-and-response testing scenarios. In e2e tests this can be
used to mock an external service. Tests can use setup mock
responses, then verify the requests were made and with the
correct data. Mockit then be reset ready for the next tests. 

## Usage 

The easiest and recommended way to use mockit is using docker.
```
docker run -p 8080:8080 snarechops/mockit
```
or with compose
```
services:
    mockit:
        image: snarechops/mockit
        ports:
            - 8080:8080
```

To create a mock response
```
POST http://localhost:8080/mockit/routes
Content-Type: application/json

{
    "path": "/test",
    "method": "GET",
    "status": 200,
    "body": "Hello Mockit",
    "once": true
}
```
Now the defined endpoint can be called, and will receive the specified response
```
GET http://localhost:8080/test 

=> 200 "Hello Mockit"
```
To Verify if a request has been made, and details about that request
```
GET http://localhost:8080/mockit/requests
```
To reset mockit back to a clean state use
```
POST http://localhost:8080/mockit/clear
```