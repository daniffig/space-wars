var eurecaServer;

var eurecaClientSetup = function () {
  var eurecaClient = new Eureca.Client();
  
  eurecaClient.ready(function (proxy) {
    eurecaServer = proxy;
    
    create();
  });
}

var game = new Phaser.Game(1280, 320, Phaser.AUTO, 'space-wars', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload () {
  game.load.image('ship', 'assets/ship.png');
}

function create () {

}

function update () {

}

function render () {

}


