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
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
        res.setHeader("Access-Control-Allow-Headers", "*");

        if (req.method.toUpperCase() === 'OPTIONS') return res.end();

        const matchingMocks = mocks.filter(m => urlMatchesPattern(req.url, m[0]));

        if (matchingMocks.length > 1) {
            console.warn("HTTP400 - More than one pattern matches the URL:");
            matchingMocks.forEach((matchingMock, idx) => console.warn(` ${idx + 1}. ${matchingMock[0]}`));
            res.statusCode = 400;
            res.end();
        } else if (matchingMocks.length === 0) {
            console.warn(`HTTP404 - No pattern matches URL of ${req.url}`);
            res.statusCode = 404;
            res.end();
        } else {
            res.setHeader('Content-Type', 'application/json');
            const mock = matchingMocks[0][1];

            if (typeof mock === "object") {
                console.log(`Serving inline mock for ${req.url}`);
                res.end(JSON.stringify(mock));
            } else if (typeof mock === "function") {
                console.log(`Serving mock from function for ${req.url}`);

                if (req.method.toUpperCase() === 'POST') {
                    let body = "";
                    req
                        .on('data', chunk => body += chunk)
                        .on('end', () => res.end(JSON.stringify(mock(req, JSON.parse(body.toString())))));
                } else {
                    res.end(JSON.stringify(mock(req)));
                }
            } else {
                if (!fs.existsSync(mock)) {
                    console.warn(`HTTP500 - ${mock} does not exist.`);
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
        add: (stringOrRegExpUrlMatcher, jsonOrFilePath) => {
            const indexOfUrlPattern = mocks.findIndex(mock => mock[0].toString() === stringOrRegExpUrlMatcher.toString());
            indexOfUrlPattern === -1
                ? mocks.push([stringOrRegExpUrlMatcher, jsonOrFilePath])
                : (mocks[indexOfUrlPattern][1] = jsonOrFilePath);
        },
        clear: () => mocks.splice(0, mocks.length),
    };
};

