var eurecaServer
  , ready
  , myId
  , myShip
  , ships = {}
  , collideBullets
  , collideShips;

var eurecaClientSetup = function () {
  var eurecaClient = new Eureca.Client();
  
  eurecaClient.ready(function (proxy) {
    eurecaServer = proxy;
    
    create();
  });
  
  eurecaClient.exports.setId = function (id) {
    myId = id;
    
    inGame = eurecaServer.joinGame(myId);
    
    if (inGame) enableControl();
  }
  
  eurecaClient.exports.spawnShip = function (id, state) {
    ships[id] = new Ship(id, state);
  }
  
  eurecaClient.exports.pong = function (pong) {
    now = new Date();    
    game.debug.text((now.getTime() - pong) + 'ms', 50, 50, 'white');
  }
  
  eurecaClient.exports.removeShip = function (id) {
    if (ships[id]) ships[id].kill();
  }
  
  eurecaClient.exports.diastole = function (id, response) {
    if (!ships[id] || (ships[id].req_seq_id > response.id)) return;
    
    ships[id].sprite.position = response.position;
    ships[id].sprite.rotation = response.rotation;   
    ships[id].keys = response.keys;
    ships[id].req_seq_id = response.id;
  }
}

var Ship = function (id, state) {
  this.id = id;
  this.req_seq_id = 0;
  this.isAlive = true;  
  this.keys = { up: false, right: false, left: false, fire: false };  
  this.sprite = game.add.sprite(200, 200, 'ship');
  
  if (state) {
    this.keys = state.keys;
    this.sprite.x = state.position.x;
    this.sprite.y = state.position.y;
    this.sprite.rotation = state.rotation;
  }
  
  this.sprite.anchor.set(0.5);
  
  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  
  this.sprite.body.drag.set(100);
  this.sprite.body.maxVelocity.set(200);
  this.sprite.body.collideWorldBounds = true;  
  
  this.sprite.body.height = this.sprite.body.height * 0.6;
  this.sprite.body.width = this.sprite.body.width * 0.6;
  
  this.sprite.body.bounce.setTo(1);

  //  Our ships bullets
  this.bullets = game.add.group();
  this.bullets.enableBody = true;
  this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

  //  All 40 of them
  this.bullets.createMultiple(40, 'bullet');
  this.bullets.setAll('anchor.x', 0.5);
  this.bullets.setAll('anchor.y', 0.5);
  
  this.nextFire = 0;
  this.fireRate = 200;  
  
  collideShips.add(this.sprite);
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
  if (this.keys.up) {    
    game.physics.arcade.accelerationFromRotation(this.sprite.rotation, 200, this.sprite.body.acceleration);
  }
  else this.sprite.body.acceleration.set(0);

  if (this.keys.left) {  
    this.sprite.body.angularVelocity = -300;
  }
  else if (this.keys.right) {  
    this.sprite.body.angularVelocity = 300;
  }
  else this.sprite.body.angularVelocity = 0;
  
  if (this.keys.fire) this.fire();
}

Ship.prototype.kill = function () {
  this.isAlive = false;
  this.sprite.kill();
}

Ship.prototype.getUserCommand = function () {
  userCommand = new dvUserCommand();
  
  userCommand.id = this.req_seq_id++;
  userCommand.keys = this.keys;
  userCommand.position.x = this.sprite.position.x;
  userCommand.position.y = this.sprite.position.y;
  userCommand.rotation = this.sprite.rotation;
  userCommand.velocity.x = this.sprite.body.velocity.x;
  userCommand.velocity.y = this.sprite.body.velocity.y;
  
  return userCommand;
}

Ship.prototype.fire = function () {
  if (game.time.now > this.nextFire)
  {
    bullet = this.bullets.getFirstExists(false);

    if (bullet)
    {
      bullet.reset(this.sprite.body.x + 16, this.sprite.body.y + 16);
      bullet.lifespan = 2000;
      bullet.rotation = this.sprite.rotation;
      game.physics.arcade.velocityFromRotation(this.sprite.rotation, 400, bullet.body.velocity);
      this.nextFire = game.time.now + this.fireRate;
    }
  }
}

var game = new Phaser.Game(640, 320, Phaser.AUTO, 'space-wars', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload () {
  game.stage.disableVisibilityChange = true;
  game.load.image('space', 'assets/deep-space.jpg');
  game.load.image('ship', 'assets/ship.png');
  game.load.image('bullet', 'assets/bullets.png');
}

function create () {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  
  game.add.tileSprite(0, 0, game.width, game.height, 'space');
  
  ready = true;
  
  collideBullets = game.add.group();
  
  collideShips = game.add.group();
/*  
  setInterval(function () {  
    now = new Date();
    eurecaServer.ping(now.getTime());
  }, 1000);  
*/  
}

function update () {
  if (!ready) return;
  
  for (s in ships) {
    if (ships[s].isAlive)
    {
      ships[s].update();
    }
  }
  
//  game.physics.arcade.collide(collideShips, collideShips, shipCollision);
}

var shipCollision = function (a, b) {
  console.log(a);
  console.log(b);
}

function render () {
  if (!ready) return;
  
  if (!ships[myId]) return;  

//  for (s in ships) game.debug.body(ships[s].sprite);
}

function enableControl() {  
  w = game.input.keyboard.addKey(Phaser.Keyboard.W);
  a = game.input.keyboard.addKey(Phaser.Keyboard.A);
  d = game.input.keyboard.addKey(Phaser.Keyboard.D);
  fire = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
  
  w.onDown.add(function () {
    ships[myId].keys.up = true;
    eurecaServer.systole(ships[myId].getUserCommand());
  });
  
  w.onUp.add(function () {
    ships[myId].keys.up = false;
    eurecaServer.systole(ships[myId].getUserCommand());
  });
  
  a.onDown.add(function () {
    ships[myId].keys.left = true;
    eurecaServer.systole(ships[myId].getUserCommand());
  });
  
  a.onUp.add(function () {
    ships[myId].keys.left = false;
    eurecaServer.systole(ships[myId].getUserCommand());
  });
  
  d.onDown.add(function () {
    ships[myId].keys.right = true;
    eurecaServer.systole(ships[myId].getUserCommand());
  });
  
  d.onUp.add(function () {
    ships[myId].keys.right = false;
    eurecaServer.systole(ships[myId].getUserCommand());
  });  
  
  fire.onDown.add(function () {
    ships[myId].keys.fire = true;
    eurecaServer.systole(ships[myId].getUserCommand());
  });
  
  fire.onUp.add(function () {
    ships[myId].keys.fire = false;
    eurecaServer.systole(ships[myId].getUserCommand());
  }); 
}

