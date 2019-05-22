const http = require('http');
const fs = require('fs');

module.exports = function (port, pathToMocks) {
    http.createServer((req, res) => {
        req.on('error', err => console.error(err.stack));
        res.setHeader('Access-Control-Allow-Origin', '*');

        const file = `${pathToMocks}/${req.url.substr(1).replace(/\//g, '_')}.json`;
        if (req.url === '/favicon.ico') {
            res.statusCode = 204;
            res.end();
        } else if (!fs.existsSync(file)) {
            console.warn(`${file} does not exist.`);
            res.statusCode = 404;
            res.end();
        } else {
            console.log(`Serving ${file}`);
            res.setHeader('Content-Type', 'application/json');
            fs.createReadStream(file).pipe(res);
        }
    }).listen(port);
}
