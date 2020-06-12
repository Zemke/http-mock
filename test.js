const httpMock = require('./index')(8080);
const http = require('http');

const bold = txt => '\033[1m' + txt + '\033[0m\x1b[31m';
const parse = data => data.toString().replace(/\n/g, '').replace(/ /g, '').trim();

httpMock.add("/api/heythere/1", {hello: "world"});
httpMock.add("/api/blah/1", __dirname + '/1.json');
httpMock.add(/\/api\/else\/(.+)/, __dirname + '/$1.json');
httpMock.add("/api/something", (req, payload) => payload);

let fails = 0;
let pending = 0;

let resolver;
const promise = new Promise(resolve => resolver = () => {
  pending--;
  if (!pending) resolve();
});

const assert = (expected, actual) => {
  actual !== expected && fail(expected, actual);
}

const fail = (expected, actual) => {
  console.trace('\x1b[31m%s\x1b[0m', `Expected ${bold(expected)} got ${bold(actual)}`);
  fails++;
}

function asyncTest(fn) {
  fn()
  pending++;
}

asyncTest(() => {
  http.get(
    "http://localhost:8080/api/heythere/1",
    res => {
      assert(200, res.statusCode);
      res.on('data', data => assert('{"hello":"world"}', parse(data)))
      resolver();
    });
});

asyncTest(() => {
  http.get(
    "http://localhost:8080/thisdoesnotexist",
    ({statusCode}) => {
      assert(404, statusCode);
      resolver();
    });
});

asyncTest(() => {
  const payload = JSON.stringify({hello: "world"});
  const req = http.request(
    "http://localhost:8080/api/something",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    },
    res => {
      res.on('data', data => assert(payload, parse(data)));
      resolver();
    }
  );
  req.write(payload);
});

asyncTest(() => {
  http.get(
    "http://localhost:8080/api/blah/1",
    res => {
      assert(200, res.statusCode);
      res.on('data', data => assert('{"hello":"world"}', parse(data)))
      resolver();
    });
});

asyncTest(() => {
  http.get(
    "http://localhost:8080/api/else/1",
    res => {
      assert(200, res.statusCode);
      res.on('data', data => assert('{"hello":"world"}', parse(data)))
      resolver();
    });
});

promise.then(() => {
  httpMock.close();
  if (!fails) console.log('\x1b[32m%s\x1b[0m', 'SUCCESS');
  process.exit(fails);
});
