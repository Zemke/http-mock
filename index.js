const http = require('http');
const fs = require('fs');

const mocks = [];

const urlMatchesPattern = (url, pattern) =>
    typeof pattern[0] !== 'string' ? url.match(pattern) != null : url === pattern;

/**
 * Start the server and get returned methods to add mocks.
 *
 * @param port The port to start the server
 * @returns {{add: (function(*, *): number), clear: (function(): *[])}}
 */
module.exports = (port) => {
    http.createServer((req, res) => {
        req.on('error', err => console.error(err.stack));
        res.setHeader('Access-Control-Allow-Origin', '*');

        const matchingMocks = mocks.filter(m => urlMatchesPattern(req.url, m[0]));

        if (matchingMocks.length > 1) {
            console.warn("More than one pattern matches the URL:");
            matchingMocks.forEach(matchingMocks, idx => console.warn(`${idx + 1}. ${matchingMocks[0]}`));
            console.warn("This results in a 400 HTTP Bad Request");
            res.statusCode = 400;
            res.end();
        } else if (matchingMocks.length === 0) {
            console.warn(`No pattern matches URL of ${req.url}`);
            console.warn("This results in a 404 HTTP Not Found");
            res.statusCode = 404;
            res.end();
        } else {
            res.setHeader('Content-Type', 'application/json');
            const mock = matchingMocks[0][1];

            if (mock.trim().startsWith("{")) {
                console.log(`Serving inline mock for ${req.url}`);
                res.end(mock);
            } else {
                if (!fs.existsSync(mock)) {
                    console.warn(`${mock} does not exist.`);
                    console.warn("This results in a 500 HTTP Internal Server Error");
                    res.statusCode = 500;
                    res.end();
                } else {
                    console.log(`Serving mock file ${mock} for ${req.url}`);
                    fs.createReadStream(mock).pipe(res);
                }
            }
        }
    }).listen(port);

    return {
        add: (stringOrRegExpUrlMatcher, jsonOrFilePath) => mocks.push([stringOrRegExpUrlMatcher, jsonOrFilePath]),
        clear: () => mocks.splice(0, mocks.length),
    };
};

