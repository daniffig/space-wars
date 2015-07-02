var eurecaServer, ready;

var eurecaClientSetup = function () {
  var eurecaClient = new Eureca.Client();
  
  eurecaClient.ready(function (proxy) {
    eurecaServer = proxy;
    
    create();
  });
  
  eurecaClient.exports.test = function () {
    if (input.up) {    
      game.physics.arcade.accelerationFromRotation(ship.rotation, 200, ship.body.acceleration);
    }
    else
    {    
      ship.body.acceleration.set(0);
    }
  
    if (input.left) {  
      ship.body.angularVelocity = -300;
    }
    else if (input.right) {
    
      ship.body.angularVelocity = 300;
    }
    else {
      ship.body.angularVelocity = 0;
    }
  }
}

var game = new Phaser.Game(1280, 320, Phaser.AUTO, 'space-wars', { preload: preload, create: eurecaClientSetup, update: update, render: render });

var cursors, ship, w;
var input = {
  up: false,
  left: false,
  right: false
}

function preload () {
  game.load.image('ship', 'assets/ship.png');
}

function create () {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  
  ship = game.add.sprite(200, 200, 'ship');
  
  ship.anchor.set(0.5);
  
  game.physics.enable(ship, Phaser.Physics.ARCADE);
  
  ship.body.drag.set(100);
  ship.body.maxVelocity.set(200);
  ship.body.collideWorldBounds = true;
  
  cursors = game.input.keyboard.createCursorKeys();
  
  w = game.input.keyboard.addKey(Phaser.Keyboard.W);
  a = game.input.keyboard.addKey(Phaser.Keyboard.A);
  d = game.input.keyboard.addKey(Phaser.Keyboard.D);
  
  w.onDown.add(function () {
    input.up = true;
    eurecaServer.test(input);
  });
  
  w.onUp.add(function () {
    input.up = false;
    eurecaServer.test(input);
  });
  
  a.onDown.add(function () {
    input.left = true;
    eurecaServer.test(input);
  });
  
  a.onUp.add(function () {
    input.left = false;
    eurecaServer.test(input);
  });
  
  d.onDown.add(function () {
    input.right = true;
    eurecaServer.test(input);
  });
  
  d.onUp.add(function () {
    input.right = false;
    eurecaServer.test(input);
  });
  
  ready = true;
}

function update () {
  if (!ready) return;
  
  /*
  if (cursors.up.isDown) {    
    eurecaServer.test(true);
  }
  else {
    ship.body.acceleration.set(0);
  }
  
  if (cursors.left.isDown) {  
    ship.body.angularVelocity = -300;
  }
  else if (cursors.right.isDown) {
  
    ship.body.angularVelocity = 300;
  }
  else {
    ship.body.angularVelocity = 0;
  }
  */
}

function render () {

}


