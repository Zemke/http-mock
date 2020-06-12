# `http-mock` [![npm version](https://badge.fury.io/js/%40zemke%2Fhttp-mock.svg)](https://badge.fury.io/js/%40zemke%2Fhttp-mock)

Serve JSON mocks conveniently.

## Usage

```js
// Start server on port 3333.
const httpMock = require('@zemke/http-mock')(3333);

// When http://localhost:3333/api/tournament is requested
// respond with contents of the JSON file under the given path.
httpMock.add('/api/tournament', __dirname + '/mocks/api_tournament.json');
```

### Examples

```js
httpMock.add("/api/heythere/1", {hello: "world"});
httpMock.add("/api/blah/1", __dirname + '/1.json');
httpMock.add(/\/api\/else\/(.+)/, __dirname + '/$1.json');
httpMock.add("/api/something", (req, payload) => payload);
```

## API

### `add(urlMatcher: string | RegExp, mock: string | object | Function<http.IncomingMessage, object>)`

Add a new mock for the given URL pattern. Performs a replace, if the URL pattern already exists.

`urlMatcher` — May be a string to match the exact path or a regular expression.

`mock` — A path to a JSON file or inline JSON object or a handler function with params [`http.IncomingMessage`](https://nodejs.org/api/http.html#http_class_http_incomingmessage) and the POST payload. If `urlMatcher` is regular expression, you can do replace operations here (see example above).

### `clean()`

Remove all mocks.

### `close(Function<>)`

Close the server with an optional callback method when the closing errors.

## Examples

```
httpMock.add(/\/api\/procedures\/(.+)/, __dirname + '/mocks/$1.json');
```
