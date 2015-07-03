var eurecaServer, ready, myId, myShip, ships = {};

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
}

var Ship = function (id, state) {
  this.id = id;
  this.isAlive = true;
  
  this.input = {
    up: false,
    left: false,
    right: false
  }  
  
  this.keys = {
    up: false,
    left: false,
    right: false
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
  console.log(this.keys);
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
}

function render () {
}

function enableControl() {  
  w = game.input.keyboard.addKey(Phaser.Keyboard.W);
  a = game.input.keyboard.addKey(Phaser.Keyboard.A);
  d = game.input.keyboard.addKey(Phaser.Keyboard.D);
  
  w.onDown.add(function () {
    ships[myId].input.up = true;
    eurecaServer.notifyStateChange(myId, ships[myId].getState());
  });
  
  w.onUp.add(function () {
    ships[myId].input.up = false;
    eurecaServer.notifyStateChange(myId, ships[myId].getState());
  });
  
  a.onDown.add(function () {
    ships[myId].input.left = true;
    eurecaServer.notifyStateChange(myId, ships[myId].getState());
  });
  
  a.onUp.add(function () {
    ships[myId].input.left = false;
    eurecaServer.notifyStateChange(myId, ships[myId].getState());
  });
  
  d.onDown.add(function () {
    ships[myId].input.right = true;
    eurecaServer.notifyStateChange(myId, ships[myId].getState());
  });
  
  d.onUp.add(function () {
    ships[myId].input.right = false;
    eurecaServer.notifyStateChange(myId, ships[myId].getState());
  });
}


