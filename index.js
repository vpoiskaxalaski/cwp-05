const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const handlers = {
  '/sum': sum
};

const fs = require("fs");



const server = http.createServer((req, res) => {

  parseBodyJson(req, (err, payload) => {
    const handler = getHandler(req.url);

    handler(req, res, payload, (err, result) => {
      if (err) {
        res.statusCode = err.code;
        res.setHeader('Content-Type', 'application/json');
        res.end( JSON.stringify(err) );

        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end( JSON.stringify(result) );
    });
  });
});

server.listen(port, hostname, () => {
  const comments = [
    {
        "id": "0",
        "articleId":"2",
        "text": "shure",
        "date": "12.12.2016",
        "author": "Vitalik"
    },
    {
        "id": "1",
        "articleId":"1",
        "text": "Burn you!",
        "date": "12.02.1796",
        "author": "Efim"
    },
    {
        "id": "3",
        "articleId":"2",
        "text": "wow",
        "date": "05.06.2009",
        "author": "Alina"
    }
  ]

  const articles = {
    "id": "1",
    "title": "siens",
    "text": "Earth is round!" ,
    "date": "05.01.1686",
    "author": "Gaalileo Galiley",
    "comments": comments
  }

  const a = JSON.stringify(articles);
  fs.writeFileSync("E:\\University\\3k1s\\PSKP\\git_tutorial\\work\\cwp-05\\jsn.json", a);

  console.log(`Server running at http://${hostname}:${port}/`);
});

function getHandler(url) {
  return handlers[url] || notFound;
}

function sum(req, res, payload, cb) {
  const result = { c: payload.a + payload.b };

  cb(null, result);
}

function notFound(req, res, payload, cb) {
  cb({ code: 404, message: 'Not found'});
}

function parseBodyJson(req, cb) {
  let body = [];

  req.on('data', function(chunk) {
    body.push(chunk);
  }).on('end', function() {
    body = Buffer.concat(body).toString();

    let params = JSON.parse(body);

    cb(null, params);
  });
}