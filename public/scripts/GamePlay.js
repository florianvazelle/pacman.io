var gamePlayState = new Phaser.Class({
  // Define scene
  Extends: Phaser.Scene,
  initialize: function GamePlay() {
    Phaser.Scene.call(this, {
      key: 'GamePlay'
    });
  },

  preload: function() {
    // Preload images for this state
    this.load.spritesheet(
      "pacman",
      "./assets/sprites/pacman/pacman_sprite.png", {
        frameWidth: 100,
        frameHeight: 100
      });

    this.load.spritesheet(
      "pacman_red",
      "./assets/sprites/pacman/pacman_red_sprite.png", {
        frameWidth: 100,
        frameHeight: 100
      });

    this.load.spritesheet(
      "pacman_green",
      "./assets/sprites/pacman/pacman_green_sprite.png", {
        frameWidth: 100,
        frameHeight: 100
      });

    this.load.image("ball", "./assets/sprites/map/ball.png");
    this.load.tilemapTiledJSON('map', './assets/tilemaps/maps/grid.json');
    this.load.image("tiles", "./assets/tilemaps/tiles/pacman-tiles-100x100.png");

    if (myGame.isMobile) {
      this.load.image('vjoy_base', './assets/sprites/joystick/base.png');
      this.load.image('vjoy_body', './assets/sprites/joystick/body.png');
      this.load.image('vjoy_cap', './assets/sprites/joystick/cap.png');
    }
  },

  create: function() {
    console.log("GamePlay");

    let x = random(myGame.cols()) * myGame.w_shape;
    let y = random(myGame.rows()) * myGame.w_shape;
    myGame.pacman = new MyPacman(this, x, y);

    /* Map */
    myGame.map = this.make.tilemap({
      key: 'map'
    });
    var tileset = myGame.map.addTilesetImage("tiles");
    var wallLayer = myGame.map.createStaticLayer("Wall Layer", tileset);
    var ballLayer = myGame.map.createDynamicLayer("Ball Layer", tileset, 0, 0);
    wallLayer.setScale(myGame.w_shape / 100);
    ballLayer.setScale(myGame.w_shape / 100);
    myGame.map.setCollisionBetween(2, 5, true, false, wallLayer);

    // Add collider between pacman and walls
    this.physics.add.collider(myGame.pacman, wallLayer);

    /* Score */
    scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff'
    });
    scoreText.setScrollFactor(0);

    if (myGame.isMobile) {
      plugin = this.plugins.get('VJoy');

      var imageGroup = [];
      imageGroup.push(this.add.sprite(0, 0, 'vjoy_cap'));
      imageGroup.push(this.add.sprite(0, 0, 'vjoy_body'));
      imageGroup.push(this.add.sprite(0, 0, 'vjoy_body'));
      imageGroup.push(this.add.sprite(0, 0, 'vjoy_base'));
      plugin.setSprite(imageGroup);

      this.input.on('pointerdown', function(pointer) {
        if (!plugin.active) {
          plugin.createJoystick(pointer.position);
        }
      }, this);
      this.input.on('pointerup', function(pointer) {
        if (plugin.active) {
          plugin.removeJoystick();
        }
      }, this);

    } else {
      // Create Keyboard controls
      upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    }

    enemy = this.physics.add.group({
      key: "pacman_red",
      setXY: {
        x: -100,
        y: -100
      }
    });
    food = this.physics.add.group({
      key: "pacman_green",
      setXY: {
        x: -100,
        y: -100
      }
    });
    neutral = this.physics.add.group({
      key: "pacman",
      setXY: {
        x: -100,
        y: -100
      }
    });

    // Get camera
    cam = this.cameras.main;
    this.cameras.main.setBounds(0, 0, myGame.map.widthInPixels, myGame.map.heightInPixels);
    // Attach camera to player
    cam.startFollow(myGame.pacman);

    this.websocket();
  },

  websocket: function() {
    //Websocket
    var data = {
      x: myGame.pacman.x,
      y: myGame.pacman.y,
      score: myGame.pacman.score
    };
    socket.emit('start', data);

    socket.on('heartbeat', (data) => {
      //on veut partir d'un tableau de Pacman      => data
      //pour arriver a un tableau d'objet physiaue => pacmans

      //on parcours data
      data.forEach((pac) => {
        if (pac.id != socket.id) {
          //si le pacman existe deja dans le tableau pacmans on le met juste a jour
          //pour cela on parcours la table pacmans
          var exist = -1;
          myGame.pacmans.forEach((pcm, idx) => {
            if (pac.id == pcm.id) {
              exist = idx;
            }
          });

          //si exist n'est pas egale a -1 cela veut dire que le pacmans
          //existe deja dans le tableau donc pas la peine de le Cceer
          if (exist != -1) {
            //on met juste a jour son groupe et ses coordonnees
            myGame.pacmans[exist].updateAttr(pac.x, pac.y, pac.score);
            myGame.pacmans[exist].updateGroup(enemy, food, neutral, myGame.pacman.score);
          }
          //sinon on construit l'objet physics
          else {
            var new_pacman = new s_Pacman(this, pac.id, pac.x, pac.y);
            new_pacman.updateGroup(enemy, food, neutral, myGame.pacman.score);
            myGame.pacmans.push(new_pacman);
          }
        }
      });
      //le troisieme cas est celui ou un joueur c'est deconnecte
      //il faut donc supprimer sa physics
      if (data.length < myGame.pacmans.length + 1) {
        myGame.pacmans.forEach((pcm, idx) => {
          var exist = false;
          data.forEach((pac) => {
            if (pac.id == pcm.id) {
              exist = true;
            }
          });
          if (!exist) {
            myGame.pacmans[idx].destroy(true);
            myGame.pacmans.splice(idx, 1);
          }
        });
      }
    });
  },

  update: function() {
    _x = Math.floor(myGame.pacman.x);
    _y = Math.floor(myGame.pacman.y);
    myGame.pacman.body.setVelocity(0);

    var tile = myGame.map.getTileAtWorldXY(_x, _y);
    var pointerTileX = myGame.map.worldToTileX(_x);
    var pointerTileY = myGame.map.worldToTileY(_y);
    if (tile != null) {
      if (tile.index == 1) {
        myGame.map.putTileAt(0, pointerTileX, pointerTileY);
        myGame.pacman.score += 1;
        scoreText.setText('Score: ' + myGame.pacman.score);
      }
    }

    if (myGame.isMobile) {
      var souris = this.input.manager.pointers[1].position;
      plugin.setDirection(souris);
      var cursors = plugin.getCursors();

      myGame.pacman.move(cursors.up, cursors.down, cursors.left, cursors.right);
    } else {
      myGame.pacman.move(upKey.isDown, downKey.isDown, leftKey.isDown, rightKey.isDown);
    }

    var data = {
      x: myGame.pacman.x,
      y: myGame.pacman.y,
      score: myGame.pacman.score
    };
    socket.emit('update', data);
  },
});

// Add scene to list of scenes
myGame.scenes.push(gamePlayState);

function random(n) {
  return Math.floor((Math.random() * n) + 1);
}