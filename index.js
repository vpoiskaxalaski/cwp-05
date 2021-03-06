const http = require('http');
const fs = require("fs");

const hostname = '127.0.0.1';
const port = 3000;

const handlers = {
  '/api/articles/readall': readall, //возвращает массив статей с комментариями
  '/api/articles/read': read,//возвращает статью с комментариями по переданному в теле запроса id 
  '/api/articles/create': create, //создает статью с переданными в теле запроса параметрами / id генерируется на сервере / сервер возвращает созданную статью 
  '/api/articles/update': update, //обновляет статью с переданными параметрами по переданному id
  '/api/articles/delete': deleteArticle, //удаляет комментарий по переданному id
  '/api/comments/create': createComment,
  '/api/comments/delete': deleteComment 
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
  let date = new Date();
  let log = "Дата: " + date.getDate() + "." + date.getMonth() + "." + date.getFullYear() + "\r\n";
  log += "Время: " + date.getHours() + " ч. " + date.getMinutes() + " мин. \r\n"; 
  log += "URL: " + url + "\r\n";
  fs.appendFileSync("log.txt", log);
  return handlers[url] || notFound;
}


///==================ОБРАБОТЧИКИ URL====================

//возвращает массив статей с комментариями
function readall(req, res, payload, cb) {

  const fileContent = fs.readFileSync("articles.json");
  const response = JSON.parse(fileContent);
  let message = response[0]['title'] + '( '+ response[0]['comments'][0]['text'] + ',' 
                                            + response[0]['comments'][1]['text'] + ' ),   ';
  message += response[1]['title'] + '( '+  response[1]['comments'][0]['text'] + ', '
                                         + response[1]['comments'][1]['text'] +' )';
                             console.log(message);                 
  const result = message;
  cb(null, result);
}

//возвращает статью с комментариями по переданному в теле запроса id 
function read(req, res, payload, cb) {
  
  let result;
  let id = payload.id;
  const content = getJSONContent();

  (Array.from(content)).forEach(element => {
    if(id == element.id){
      result ="Header: "+ element['title']+ "[ " + element['text'] + " ]";
      result += " Comments: " + element['comments'][0]['text'] + ', ' + element['comments'][1]['text'];
    }
  });

    if(result==null){
      result = { code: 404, message: 'Not found'};
    }
  cb(null, result);
}


//создает статью с переданными в теле запроса параметрами / id генерируется на сервере / сервер возвращает созданную статью 
function create(req, res, payload, cb) {
  const fileContent = getJSONContent();

  let id = getID();
  id++;

  let article = payload;
  article.id = id;
  (Array.from(article.comments)).forEach(element => {
    element.articleId = id;
  });

  fileContent[--id] = article; 

  rewriteJSON(fileContent);                              
  const result = "article created";

  cb(null, result);
}

//обновляет статью с переданными параметрами по переданному id
function update(req, res, payload, cb) {
  const fileContent = getJSONContent();
  let fileContentArr = Array.from(fileContent);
  let id = payload.id;
  let article = payload;

  for(let i=0;i< fileContentArr.length; i++){
    if(fileContentArr[i].id == id){
      fileContentArr[i] = article;
    }
  }
  
  rewriteJSON(fileContentArr);  
  const result = "Article updated";
   cb(null, result);
}

//удаляет комментарий по переданному id
function deleteArticle(req, res, payload, cb) {
  let result;

  const content = getJSONContent();;
  let id = payload.id;
  let contextArray = Array.from(content);

  for(let i =0; i<contextArray.length; i++){
    if(id == contextArray[i].id){
        delete contextArray[i];

        rewriteJSON(contextArray); 
  
      result = "Article deleted";
    }
  }
  
  if(result==null){
    result = { code: 404, message: 'Not found'};
  }

  cb(null, result);
}

//создает комментарий 
function createComment(req, res, payload, cb) {
  const fileContent = getJSONContent();
  let fileContentArr = Array.from(fileContent);

  let id = payload.articleId;

  let newComment = payload;
  (Array.from(fileContentArr)).forEach(a => {
    if(a.id == id){
      let commentArray = a.comments;
      commentArray[commentArray.length] = newComment;
    }
    
  });
  console.log(fileContentArr);
  rewriteJSON(fileContentArr);                              
  const result = "comment created";

  cb(null, result);
}

//удаляет комментарий
function deleteComment(req, res, payload, cb) {
  let result;

  const content = getJSONContent();;
  let idA = payload.articleId;
  let idC = payload.id;
  let contextArray = Array.from(content);

  for(let i =0; i<contextArray.length; i++){
    if(idA == contextArray[i].id){
      let commentArray = contextArray[i].comments;
      for(let j = 0; j< commentArray.length;j++){
        if(idC == commentArray[j].id){
          delete commentArray[j];
        }
      }
      rewriteJSON(contextArray); 
  
      result = "comment deleted";
    }  
  }
  
  if(result==null){
    result = { code: 404, message: 'Not found'};
  }

  cb(null, result);
}

//===================ДОП ФУНКЦИОНАЛ=================
//считывание файло json и получение id
function getID(){
  const fileContent = getJSONContent();

  let actualId;
  (Array.from(fileContent)).forEach(element => {
    actualId = element.id;
  });

  return actualId;
}

function getJSONContent(){
  const fileContent = fs.readFileSync("articles.json");
  const response = JSON.parse(fileContent);

  return response;
}

function rewriteJSON(cntnt){
  const newJson = JSON.stringify(cntnt);
  fs.writeFileSync("js.json", newJson);
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
    let log = "Тело запроса: " + body;
    fs.appendFileSync("log.txt", log+ "\r\n");
    cb(null, params);
  });
}
