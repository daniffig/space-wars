var eurecaServer
  , ready
  , myId
  , myShip
  , ships = {}
  , collideBullets
  , collideShips
  , ping = 0;

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
    if (id == myId) ping = Date.now() - response.createdAt;
    if (!ships[id] || (ships[id].req_seq_id > response.id)) return;
    
    ships[id].sprite.position = response.position;
    ships[id].sprite.rotation = response.rotation;   
    ships[id].keys = response.keys;
    ships[id].req_seq_id = response.id;
  }
  
  eurecaClient.exports.hit = function (killerId, victimId) {
    console.log('killer: ' + killerId + ' | victim: ' + victimId);
    
    if (!ships[victimId]) return;
    
    ships[victimId].hit(killerId);
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
  
  this.sprite.owner = this;
  
//  this.sprite.body.bounce.setTo(1);

  //  Our ships bullets
  this.bullets = game.add.group();
  this.bullets.enableBody = true;
  this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

  //  All 40 of them
  this.bullets.createMultiple(40, 'bullet');
  this.bullets.setAll('anchor.x', 0.5);
  this.bullets.setAll('anchor.y', 0.5);  
  
  this.bullets.owner = this;
  
  this.nextFire = 0;
  this.fireRate = 200;  
  
  collideBullets.add(this.bullets);
  collideShips.add(this.sprite);  
  
  style = { font: "12px Arial", fill: "#ffffff", align: "center" };
  
  this.health = 100;
  this.playerName = game.add.text(this.sprite.x, this.sprite.y, this.health, style);
  
//  this.healthBar = game.add.graphics((this.sprite.position.x - (this.playerName.width / 2)), (this.sprite.position.y - (this.sprite.height / 2)));

/*
  this.healthBar = game.add.graphics(0, 0);  
  
//  this.playerName.position.x = this.sprite.position.x - (this.playerName.width / 2);
//  this.playerName.position.y = this.sprite.position.y + (this.sprite.height / 2);

    // set a fill and line style
    this.healthBar.beginFill(0xFF3300);
    this.healthBar.lineStyle(5, 0xffd900, 1);
    
    
    // draw a shape
//    this.healthBar.moveTo(-20, -20);
    this.healthBar.lineTo(50, 0);
    this.healthBar.endFill();
    */
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
  
  this.playerName.position.x = this.sprite.position.x - (this.playerName.width / 2);
  this.playerName.position.y = this.sprite.position.y + (this.sprite.height / 2);
  this.playerName.text = this.health;
  /*
//  this.healthBar.position = this.sprite.position;
  
  this.healthBar.position.x = (this.sprite.position.x + (this.sprite.width / 2)) - (this.healthBar.width);
  
  this.healthBar.position.y = this.sprite.position.y - this.sprite.height;
  */
}

Ship.prototype.kill = function () {
  this.isAlive = false;
  this.sprite.kill();
  this.playerName.kill();
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
      bullet.reset(this.sprite.body.x + this.sprite.body.halfWidth, this.sprite.body.y + this.sprite.body.halfHeight);
      bullet.lifespan = 2000;
      bullet.rotation = this.sprite.rotation;
      game.physics.arcade.velocityFromRotation(this.sprite.rotation, 400, bullet.body.velocity);
      this.nextFire = game.time.now + this.fireRate;
    }
  }
}

Ship.prototype.hit = function (enemyShipId) {
  console.log('decrease health');
  this.health -= 10;
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
  
  game.physics.arcade.overlap(collideBullets, collideShips, bulletHitShip);
}

var bulletHitShip = function (bullet, ship) {
  killer = bullet.parent.owner;
  victim = ship.owner;
  
  if (killer.id == victim.id) return;
  if (!bullet.alive) return;
  
  bullet.kill();
  
  eurecaServer.hit(killer.id, victim.id);
}

function render () {
  if (!ready) return;
  
  if (!ships[myId]) return;  
  
  game.debug.text(ping + 'ms', 10, 20);

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

