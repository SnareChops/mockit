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

## UI
Mockit comes with a browser UI that shows the registered routes, and requests that have been received. The UI is available at `/mockit/ui`

## WebSocket
Mockit exposes a websocket that will signal when requests to your mocked endpoints are received. This is useful in automation scenarios where you need to wait until a request has made. Additionally it provides the request details that can be asserted in your testing to confirm that the correct details were sent to the endpoint.

Websocket is available at `/mockit/ws`. Messages will be a JSON string in the following format:
```json
{
    "id": 1,
    "type": "called",
    "value": {
        "path": "some/path",
        "method": "GET",
        "status": 200,
        "query": {"a":"1"},
        "req": any, // whatever the request body is
        "res": any, // whatever the response is
    }
}
```
> Note: In the situation where multiple identical calls are made to the same endpoint, there is currently no way to differentiate between them other than what is provided in the above JSON. Therefore automated testing that is running in parallel may cause race conditions or have unexpected side-effects.

## JavaScript/TypeScript
If using js or ts for automated testing, a companion npm package is available that provides a testing harness for use in automating control over the mock api.

```
npm install @snarechops/mockit
```

```typescript
import { Mockit } from '@snarechops/mockit';

const mockit = new Mockit('http://localhost:8080');

// To create a mock endpoint use .mock()
// Returns a "Waiter" that is a promise that can be awaited until a request for this
// mock endpoint has been received by the mock api
const waiter = mockit.mock('GET', '/some/path', 200, 'Some Response')

...

// Wait for a request to be made to the mock endpoint
await waiter()

// To create a mock endpoint that only responds once and then removes itself use .mockOnce()
// Arguments and usage are identical to .mock()
const waiter = mockit.mockOnce('POST', '/some/other/path', 201, JSON.stringify({some: 'reponse'}))


// To get a list of ALL requests to the mock api that have been made since the last clear()
// use .requests() 
const requests = await mockit.requests()

// To clear ALL mocks and requests use .clear()
await mockit.clear()
```