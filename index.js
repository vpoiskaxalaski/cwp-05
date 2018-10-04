const http = require('http');
const fs = require("fs");

const hostname = '127.0.0.1';
const port = 3000;

const handlers = {
  '/api/articles/readall': readall, //возвращает массив статей с комментариями
  '/api/articles/read': read,//возвращает статью с комментариями по переданному в теле запроса id 
  '/api/articles/create': create, //создает статью с переданными в теле запроса параметрами / id генерируется на сервере / сервер возвращает созданную статью 
  '/api/articles/update': update, //обновляет статью с переданными параметрами по переданному id
  '/api/articles/delete': deleteArticle //удаляет комментарий по переданному id
};



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
    console.log(`Server running at http://${hostname}:${port}/`);
});

function getHandler(url) {
  return handlers[url] || notFound;
}

//удаляет комментарий по переданному id
function deleteArticle(req, res, payload, cb) {

  let id = payload.id;

  const fileContent = fs.readFileSync("articles.json");
  const content = JSON.parse(fileContent);

  
  content[--id] ="{}";

  const newJson = JSON.stringify(content);
  fs.writeFileSync("js.json", newJson);
  
  const result = "Article deleted";

  cb(null, result);
}

//обновляет статью с переданными параметрами по переданному id
function update(req, res, payload, cb) {

  let id = payload['id'];
  console.log(id);

  const fileContent = fs.readFileSync("articles.json");
  const content = JSON.parse(fileContent);

  content[--id] = payload;

  const newJson = JSON.stringify(content);
  fs.writeFileSync("js.json", newJson);
  
  const result = "Article updated";

  cb(null, result);
}

//создает статью с переданными в теле запроса параметрами / id генерируется на сервере / сервер возвращает созданную статью 
function create(req, res, payload, cb) {

  let article = payload;
  let id = 4;

  article['id'] = id;
  article['comments'][0]['articleId'] = id;
                              
  const result = article;

  cb(null, result);
}

//возвращает статью с комментариями по переданному в теле запроса id 
function read(req, res, payload, cb) {

  const fileContent = fs.readFileSync("articles.json");
  const response = JSON.parse(fileContent);

  let id = payload.id;
  let message ="Header: "+ response[id]['title']+ "[ " + response[id]['text'] + " ]";
  message += " Comments: " + response[id]['comments'][0]['text'] + ', ' + response[id]['comments'][1]['text'];
                              
  const result = message;

  cb(null, result);
}
//возвращает массив статей с комментариями
function readall(req, res, payload, cb) {

  const fileContent = fs.readFileSync("articles.json");
  const response = JSON.parse(fileContent);
  let message = response[0]['title'] + '( '+ response[0]['comments'][0]['text'] + ',' 
                                            + response[0]['comments'][1]['text'] + ' );\r\n';
  message += response[1]['title'] + '( '+  response[1]['comments'][0]['text'] + ', '
                                         + response[1]['comments'][1]['text'] +' ); \r\n';
                                              
  const result = message;

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