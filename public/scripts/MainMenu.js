var mainMenuState = new Phaser.Class({
  // Define scene
  Extends: Phaser.Scene,
  initialize: function MainMenu() {
    Phaser.Scene.call(this, {
      key: 'MainMenu'
    });
  },

  preload: function() {
    this.load.image("startBtn", "./assets/sprites/menu/startBtn.png");
  },

  create: function() {
    console.log("MainMenu");
    startBtn = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'startBtn').setInteractive();
    startBtn.on('pointerdown', startGame);
  },

  update: function() {
    // Update objects & variables
  }
});

// Add scene to list of scenes
myGame.scenes.push(mainMenuState);

function startGame() {
  game.scene.start('GamePlay');
  startBtn.destroy();
}