var eurecaServer, ready, myId, myShip, ships = {}, created, count = 0;

var eurecaClientSetup = function () {
  var eurecaClient = new Eureca.Client();
  
  eurecaClient.ready(function (proxy) {
    eurecaServer = proxy;
    
    create();
  });
  
  eurecaClient.exports.setId = function (id) {
    myId = id;
    
    inGame = eurecaServer.joinGame(myId);
    
    if (inGame) {
      enableControl();
      created = true;
    }
  }
  
  eurecaClient.exports.spawnShip = function (id, state) {
    ships[id] = new Ship(id, state);
  }
  
  eurecaClient.exports.pong = function (pong) {
    now = new Date();    
    game.debug.text((now.getTime() - pong) + 'ms', 50, 50, 'white');
  }
  
  eurecaClient.exports.updateState = function (id, state) {
    if (ships[id]) {
      ships[id].setState(state);     
//      ships[id].update();
    }
  }
  
  eurecaClient.exports.removeShip = function (id) {
    if (ships[id]) {
      ships[id].kill();
    }
  }
  
  eurecaClient.exports.diastole = function (id, response) {
    if (!ships[id]) return;
    
    ships[id].sprite.position = response.position;
    ships[id].sprite.rotation = response.rotation;   
    ships[id].keys = response.keys;
  }
}

var Ship = function (id, state) {
  this.id = id;
  this.req_seq_id = 0;
  this.isAlive = true;
  
  this.input = {
    up: false,
    right: false,    
    left: false
  }  
  
  this.keys = {
    up: false,
    right: false,    
    left: false
  }
  
  this.sprite = game.add.sprite(200, 200, 'ship');
  
  if (state) {
    this.keys = state.input;
    this.sprite.x = state.position.x;
    this.sprite.y = state.position.y;
    this.sprite.rotation = state.rotation;
  }
  
  this.sprite.anchor.set(0.5);
  
  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  
  this.sprite.body.drag.set(100);
  this.sprite.body.maxVelocity.set(200);
  this.sprite.body.collideWorldBounds = true;
}

Ship.prototype.setState = function (state) {
  if (state) {
    this.keys = state.input;
    this.sprite.x = state.position.x;
    this.sprite.y = state.position.y;
    this.sprite.rotation = state.rotation;
  }
}

Ship.prototype.getState = function () {
  return {
    input: this.input,
    position: {
      x: this.sprite.x,
      y: this.sprite.y
    },
    rotation: this.sprite.rotation    
  }
}

Ship.prototype.update = function () {  
//  console.log(this.keys);
  if (this.keys.up) {    
    game.physics.arcade.accelerationFromRotation(this.sprite.rotation, 200, this.sprite.body.acceleration);
  }
  else
  {    
    this.sprite.body.acceleration.set(0);
  }

  if (this.keys.left) {  
    this.sprite.body.angularVelocity = -300;
  }
  else if (this.keys.right) {  
    this.sprite.body.angularVelocity = 300;
  }
  else {
    this.sprite.body.angularVelocity = 0;
  }
}

Ship.prototype.kill = function () {
  this.isAlive = false;
  this.sprite.kill();
}

Ship.prototype.getUserCommand = function () {
  userCommand = new dvUserCommand();
  
  userCommand.id = this.seq_req_id++;
  userCommand.keys = this.input;
  userCommand.position.x = this.sprite.position.x;
  userCommand.position.y = this.sprite.position.y;
  userCommand.rotation = this.sprite.rotation;
  userCommand.velocity.x = this.sprite.body.velocity.x;
  userCommand.velocity.y = this.sprite.body.velocity.y;
  
  return userCommand;
}

var game = new Phaser.Game(640, 320, Phaser.AUTO, 'space-wars', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload () {
  game.stage.disableVisibilityChange = true;
  game.load.image('ship', 'assets/ship.png');
}

function create () {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  
  ready = true;
  
  setInterval(function () {  
    now = new Date();
    eurecaServer.ping(now.getTime());
  }, 3000);
}

function update () {
  if (!ready) return;
  
  for (s in ships) {
    if (ships[s].isAlive)
    {
      ships[s].update();
    }
  }
  
//  console.log(count++);
  
  if (!created) return;
  
//  response = eurecaServer.systole(ships[myId].sprite.position.x);
}

function render () {
}

function enableControl() {  
  w = game.input.keyboard.addKey(Phaser.Keyboard.W);
  a = game.input.keyboard.addKey(Phaser.Keyboard.A);
  d = game.input.keyboard.addKey(Phaser.Keyboard.D);
  q = game.input.keyboard.addKey(Phaser.Keyboard.Q);
  
  w.onDown.add(function () {
    ships[myId].input.up = true;
//    eurecaServer.notifyStateChange(myId, ships[myId].getState());
  });
  
  w.onUp.add(function () {
    ships[myId].input.up = false;
//    eurecaServer.notifyStateChange(myId, ships[myId].getState());
  });
  
  a.onDown.add(function () {
    ships[myId].input.left = true;
//    eurecaServer.notifyStateChange(myId, ships[myId].getState());
  });
  
  a.onUp.add(function () {
    ships[myId].input.left = false;
//    eurecaServer.notifyStateChange(myId, ships[myId].getState());
  });
  
  d.onDown.add(function () {
    ships[myId].input.right = true;
//    eurecaServer.notifyStateChange(myId, ships[myId].getState());
  });
  
  d.onUp.add(function () {
    ships[myId].input.right = false;
//    eurecaServer.notifyStateChange(myId, ships[myId].getState());
  });  
  
  q.onDown.add(function () {
    console.log(ships[myId].getUserCommand().position.x);
    eurecaServer.systole(ships[myId].getUserCommand());
//    eurecaServer.systole(new dvUserCommand());
  });
}

var heartbeat = window.setInterval(function () { beat(); }, 50);

var beat = function () {
  if (!ships[myId]) return;
  
  eurecaServer.systole(ships[myId].getUserCommand());
//  console.log(ships[myId].sprite.position.x);
//  response = eurecaServer.systole(ships[myId].getState());
//  console.log(response);
}


