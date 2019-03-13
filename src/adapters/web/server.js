// var connect = require('connect');

// var serveStatic = require('serve-static');

const port = 1080;

// connect().use(serveStatic(__dirname)).listen(port, function(){
//   console.log(`Server running on ${port}...`);
// });

// npm run webpack.build && node src/adapters/web/vanilla/server.js

var express = require('express')
var app = express()

app.get(/^\/api/, async (req, res) => {
  const url = `https://www.metlink.org.nz/${req.path}`;
  
  console.log(`Forwarding to <${url}>`);

  const request = require("request");

  await request({ uri: url }, async (error, _, body) => {
    if (error){
      res.send(error);
      return;
    }

    const reply = JSON.parse(body);

    console.log(`Returning:\n${JSON.stringify(reply, null, 2)}`);

    res.status(200).json(reply);
  }) 
});

app.get(/^\/(vanilla|dist)/, function (req, res) {
  const path = `${__dirname}/${req.path}`;

  console.log(`returning file <${path}>`);

  res.sendFile(path);
});

app.listen(port, () => console.log(`Server running on ${port}...`));