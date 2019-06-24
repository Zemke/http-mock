# `http-mock`

Serve JSON mocks conveniently.

## Usage

```js
// Start server on port 3333.
const httpMock = require('@zemke/http-mock')(3333);

// When http://localhost:3333/api/tournament is requested
// respond with contents of the JSON file under the given path.
httpMock.add('/api/tournament', __dirname + '/mocks/api_tournament.json');
```

## API

### `add(urlMatcher: string | RegExp, mock: string | object | Function<http.IncomingMessage, object>)`

Add a new mock for the given URL pattern. Performs a replace, if the URL pattern already exists.

`urlMatcher` — May be a string to match the exact path or a regular expression.

`mock` — A path to a JSON file or inline JSON or a handler function with params [`http.IncomingMessage`](https://nodejs.org/api/http.html#http_class_http_incomingmessage) and the POST payload.

### `clean()`

Remove all mocks.
