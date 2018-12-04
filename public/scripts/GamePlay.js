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
      "./assets/img/pacman/pacman_sprite.png", {
        frameWidth: 100,
        frameHeight: 100
      });

    this.load.spritesheet(
      "pacman_red",
      "./assets/img/pacman/pacman_red_sprite.png", {
        frameWidth: 100,
        frameHeight: 100
      });

    this.load.spritesheet(
      "pacman_green",
      "./assets/img/pacman/pacman_green_sprite.png", {
        frameWidth: 100,
        frameHeight: 100
      });

    this.load.image("ball", "./assets/img/map/ball.png");

    /* Walls */
    this.load.image("u_wall", "./assets/img/map/wall_up.png");
    this.load.image("d_wall", "./assets/img/map/wall_down.png");
    this.load.image("l_wall", "./assets/img/map/wall_left.png");
    this.load.image("r_wall", "./assets/img/map/wall_right.png");

    if (isMobile) {
      this.load.image('vjoy_base', './assets/img/joystick/base.png');
      this.load.image('vjoy_body', './assets/img/joystick/body.png');
      this.load.image('vjoy_cap', './assets/img/joystick/cap.png');
    }
  },

  create: function() {
    console.log("GamePlay");

    scoreText = this.add.text(16, 16, 'score: 0', {
      fontSize: '32px',
      fill: '#fff'
    });

    scoreText.setScrollFactor(0);

    this.initPacman();

    if (isMobile) {
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

    this.showMap();

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
    // Attach camera to player
    cam.startFollow(pacman);
    //cam.setSize(50, 50);

    this.websocket();
  },

  initPacman: function() {
    // Create player
    let x = random(cols) * w_shape;
    let y = random(rows) * w_shape;
    pacman = new MyPacman(this, x, y);
  },

  showMap: function() {

    // Create walls
    walls = this.physics.add.staticGroup();
    // Create balls
    balls = this.physics.add.staticGroup();

    map.forEach((cell) => {
      var x = calc(cell.x) * w_shape;
      var y = calc(cell.y) * w_shape;
      myCreate(x, y, balls, 'ball');
      cell.walls.forEach((wall, idx) => {
        if (!wall) {
          if (idx == 0) myCreate(x + w_shape, y, walls, 'r_wall');
          if (idx == 1) myCreate(x - w_shape, y, walls, 'l_wall');
          if (idx == 2) myCreate(x, y + w_shape, walls, 'd_wall');
          if (idx == 3) myCreate(x, y - w_shape, walls, 'u_wall');
        } else {
          if (idx == 0) {
            myCreate(x + w_shape, y, balls, 'ball');
            myCreate(x + w_shape, y + w_shape, walls, 'd_wall');
            myCreate(x + w_shape, y - w_shape, walls, 'u_wall');
          }
          if (idx == 1) {
            myCreate(x - w_shape, y, balls, 'ball');
            myCreate(x - w_shape, y + w_shape, walls, 'd_wall');
            myCreate(x - w_shape, y - w_shape, walls, 'u_wall');
          }
          if (idx == 2) {
            myCreate(x, y + w_shape, balls, 'ball');
            myCreate(x + w_shape, y + w_shape, walls, 'r_wall');
            myCreate(x - w_shape, y + w_shape, walls, 'l_wall');
          }
          if (idx == 3) {
            myCreate(x, y - w_shape, balls, 'ball');
            myCreate(x + w_shape, y - w_shape, walls, 'r_wall');
            myCreate(x - w_shape, y - w_shape, walls, 'l_wall');
          }
        }
      });
    });

    balls.refresh();
    walls.refresh();

    // Add collider between player and walls
    this.physics.add.collider(pacman, walls);

    // Add overlap between player and balls
    this.physics.add.overlap(pacman, balls,
      (pacman, ball) => {
        //ball.disableBody(true, true);
        ball.destroy(true);
        pacman.score++;
        scoreText.setText('Score: ' + pacman.score);
      }, null, this);
  },

  websocket: function() {
    //Websocket
    var data = {
      x: pacman.x,
      y: pacman.y,
      score: pacman.score
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
          pacmans.forEach((pcm, idx) => {
            if (pac.id == pcm.id) {
              exist = idx;
            }
          });

          //si exist n'est pas egale a -1 cela veut dire que le pacmans
          //existe deja dans le tableau donc pas la peine de le Cceer
          if (exist != -1) {
            //on met juste a jour son groupe et ses coordonnees
            pacmans[exist].updateAttr(pac.x, pac.y, pac.score);
            pacmans[exist].updateGroup(enemy, food, neutral, pacman.score);
          }
          //sinon on construit l'objet physics
          else {
            var new_pacman = new s_Pacman(this, pac.id, pac.x, pac.y);
            new_pacman.updateGroup(enemy, food, neutral, pacman.score);
            pacmans.push(new_pacman);
          }
        }
      });
      //le troisieme cas est celui ou un joueur c'est deconnecte
      //il faut donc supprimer sa physics
      if (data.length < pacmans.length + 1) {
        pacmans.forEach((pcm, idx) => {
          var exist = false;
          data.forEach((pac) => {
            if (pac.id == pcm.id) {
              exist = true;
            }
          });
          if (!exist) {
            pacmans[idx].destroy(true);
            pacmans.splice(idx, 1);
          }
        });
      }
    });
  },

  update: function() {
    _x = Math.floor(pacman.x);
    _y = Math.floor(pacman.y);
    pacman.body.velocity.x = 0;
    pacman.body.velocity.y = 0;

    if (isMobile) {
      var souris = this.input.manager.pointers[1].position;
      plugin.setDirection(souris);
      var cursors = plugin.getCursors();

      pacman.move(cursors.up, cursors.down, cursors.left, cursors.right);
    } else {
      pacman.move(upKey.isDown, downKey.isDown, leftKey.isDown, rightKey.isDown);
    }

    var data = {
      x: pacman.x,
      y: pacman.y,
      score: pacman.score
    };
    socket.emit('update', data);
  },
});

// Add scene to list of scenes
myGame.scenes.push(gamePlayState);

/**
 *
 *
 * @method calc
 * @param {number} - Le n-ieme index
 * @return {number} - Le chiffre correspondante a la suite pour le n
 */

function calc(n) {
  return 3 * n + 1;
}