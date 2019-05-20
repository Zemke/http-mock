# `http-mock`

Serve JSON mocks conveniently.

## Usage

```js
require('http-mock')(3333, __dirname + '/mocks');
```

Starts a server on port `3333` with JSON files to serve located in the current directory under `mocks/`.
If you create a file in `mocks/` named `api_users_1_details.json` it will be served when `http://localhost:3333/api/users/1/details` is requested.

## Appendix

You might also roll your own version of this. Peek into `index.js` it’s kids’ stuff.
