var express = require('express')
  , path = require('path')
  , app = express(app)
  , server = require('http').createServer(app);
  
app.use(express.static(path.resolve(__dirname, 'client')));

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
  
var Eureca = require('eureca.io');
  
var eurecaServer = new Eureca.Server({allow: ['setId', 'spawnShip', 'updateState', 'removeShip', 'pong', 'diastole']});

eurecaServer.attach(server);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res, next) {
  res.sendFile('index.html');
});

var clients = {};

eurecaServer.onConnect(function (connection) {
  console.log('New client ', connection.id);
  
  var newClient = eurecaServer.getClient(connection.id);
  
  clients[connection.id] = {
    id: connection.id,
    remote: newClient,
    lastState: null
  }
  
  newClient.setId(connection.id);
});

eurecaServer.onDisconnect(function (connection) {
  console.log('Client disconnected ', connection.id);
  
  if (clients[connection.id]) {
    delete clients[connection.id];
  }
  
  for (c in clients) {
    clients[c].remote.removeShip(connection.id);
  }
});

eurecaServer.exports.joinGame = function (id) {
  console.log('join game ', id);
  for (c in clients) {
    clients[id].remote.spawnShip(clients[c].id, clients[c].lastState);
  }
  
  for (c in clients) {
    if (clients[c].id != id) {  
      clients[c].remote.spawnShip(id, clients[id].lastState);
    }
  }
  
  return true;
}

eurecaServer.exports.notifyStateChange = function (id, state) {
  clients[id].lastState = state;
/*
  for (c in clients) {
    clients[c].remote.updateState(id, clients[c].lastState);
  }
*/  
}

eurecaServer.exports.ping = function (ping) {
  eurecaServer.getClient(this.connection.id).pong(ping);
}

eurecaServer.exports.systole = function (request) {
  console.log(request);

  for (c in clients) {
    clients[c].remote.diastole(this.connection.id, request);
  }
//  eurecaServer.getClient(this.connection.id).diastole(request + 1);
}
  
server.listen(8080);  
