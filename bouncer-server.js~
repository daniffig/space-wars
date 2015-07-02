var express = require('express')
  , path = require('path')
  , app = express(app)
  , server = require('http').createServer(app);
  
app.use(express.static(path.resolve(__dirname, 'client')));
  
var Eureca = require('eureca.io');
  
var eurecaServer = new Eureca.Server({allow: ['test']});

eurecaServer.attach(server);

app.get('/', function (req, res, next) {
  res.sendFile('index.html');
});

eurecaServer.onConnect(function (connection) {
  console.log('New client ', connection.id);
});
  
server.listen(8080);  
