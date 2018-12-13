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
    startBtn = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'startBtn').setInteractive();
    startBtn.on('pointerdown', startGame);

    enteryourpseudo = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Enter your pseudo:', {
      font: '32px Courier',
      fill: '#ffffff',
      align: 'center'
    });
    enteryourpseudo.setOrigin(0.5);

    textEntry = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Nickname', {
      font: '32px Courier',
      fill: '#fff',
      backgroundColor: '#696969',
      align: 'center'
    });
    textEntry.setOrigin(0.5);

    keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keyBackspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);

    this.input.keyboard.on('keydown', function(event) {
      if ('Nickname' == textEntry.text) textEntry.text = '';
      if (event.keyCode === 32 || (event.keyCode >= 65 && event.keyCode <= 90)) {
        textEntry.text += event.key;
      }
    });

    bool = 0;
  },

  update: function() {
    // Update objects & variables
    if (keyBackspace.isDown && bool % 4 == 0) {
      textEntry.text = textEntry.text.substr(0, textEntry.text.length - 1);
    }
    bool = bool + 1;
  }
});

// Add scene to list of scenes
myGame.scenes.push(mainMenuState);

function startGame() {
  myGame.name = textEntry.text;
  game.scene.start('GamePlay');
  startBtn.destroy();
  enteryourpseudo.destroy();
  textEntry.destroy();
}