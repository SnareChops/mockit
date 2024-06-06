# Mockit

An extremely simple mocking webservice. Designed for use in call-and-response testing scenarios. Create a json or yaml file containing the routes and responses to mock.

## Usage

To run the mock service, pass a mock json or yaml file.
Optionally set the port number (default: 8080)

```
mockit --port 8080 mocks.json
```

## Mocks

In a json or yaml file, create a list of mocks for the service.

```
[{
    "path": "/test",
    "method": "GET",
    "status": 200,
    "body": "Test response"
}]
```
