const http = require('http'); // pull in the http server module
const url = require('url');
const query = require('querystring');

const jsonHandler = require('./jsonResponses.js');
const htmlHandler = require('./htmlResponses.js');

// set the port. process.env.PORT and NODE_PORT are for servers like heroku
const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/getUsers': jsonHandler.getUsers,
    notReal: jsonHandler.notReal,
  },
  HEAD: {
    '/getUsers': jsonHandler.getUsersMeta,
    notReal: jsonHandler.notRealMeta,
  },
};

const handlePost = (request, response, parsedUrl) => {
  // if post is to /addUser (our only POST url)
  if (parsedUrl.pathname === '/addUser') {
    const res = response;

    // create body
    const body = [];

    // if we get an error throw a bad request
    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    // on 'data' is for each byte of data that comes in
    // from the upload. We will add it to our byte array.
    request.on('data', (chunk) => {
      body.push(chunk);
    });

    // on end of upload stream.
    request.on('end', () => {
      // combine and parse body byte data
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);

      // pass to our addUser function
      jsonHandler.addUser(request, res, bodyParams);
    });
  }
};

// send this function request and pre-filled response objects.
const onRequest = (request, response) => {
  // parse the url using the url module
  const parsedUrl = url.parse(request.url);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    if (urlStruct[request.method][parsedUrl.pathname]) {
      urlStruct[request.method][parsedUrl.pathname](request, response);
    } else {
      urlStruct[request.method].notReal(request, response);
    }
  }
};

// start HTTP server
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
