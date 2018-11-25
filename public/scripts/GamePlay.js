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
      "./img/pacman_sprite.png", {
        frameWidth: 100,
        frameHeight: 100
      });

    this.load.spritesheet(
      "pacman_red",
      "./img/pacman_red_sprite.png", {
        frameWidth: 100,
        frameHeight: 100
      });

    this.load.spritesheet(
      "pacman_green",
      "./img/pacman_green_sprite.png", {
        frameWidth: 100,
        frameHeight: 100
      });

    this.load.image("ball", "./img/ball.png");

    /* Walls */
    this.load.image("u_wall", "./img/wall_up.png");
    this.load.image("d_wall", "./img/wall_down.png");
    this.load.image("l_wall", "./img/wall_left.png");
    this.load.image("r_wall", "./img/wall_right.png");
  },

  create: function() {
    // Create objects
    console.log("GamePlay");

    // Create player
    pacman = this.physics.add.sprite(w_shape, w_shape, "pacman");
    pacman.x = random(cols) * w_shape;
    pacman.y = random(rows) * w_shape;
    pacman.score = 0;
    pacman.speed = 10;

    //Scale pacman
    pacman.setDisplaySize(w_shape, w_shape);
    //pacman.setSize(w_shape, w_shape)

    // Create animations for player
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("pacman", {
        start: 2,
        end: 3
      }),
      repeat: 0
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("pacman", {
        start: 6,
        end: 7
      }),
      repeat: 0
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("pacman", {
        start: 0,
        end: 1
      }),
      repeat: 0
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("pacman", {
        start: 4,
        end: 5
      }),
      repeat: 0
    });

    // Create Keyboard controls
    upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);


    //show background

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
        //pacman.score++;
      }, null, this);

    //Fin show background

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
          //existe deja dans le tableau donc pas la peine de le Creer
          //on met juste a jour son groupe et ses coordonnees
          if (exist != -1) {
            //si le score du pacman courant est superieur a celui de 'mon' pacman
            if (pac.score > pacman.score && !enemy.contains(pacmans[exist])) {
              //on lui change sont groupe (sauf si il appartient deja)
              oldGroup = (neutral.contains(pacmans[exist])) ? neutral : food;
              oldGroup.destroy(pacmans[exist]);
              enemy.add(pacmans[exist]);
            } else if (pac.score < pacman.score && !food.contains(pacmans[exist])) {
              oldGroup = (neutral.contains(pacmans[exist])) ? neutral : enemy;
              oldGroup.destroy(pacmans[exist]);
              food.add(pacmans[exist]);
            } else if (!neutral.contains(pacmans[exist])) {
              oldGroup = (enemy.contains(pacmans[exist])) ? enemy : food;
              oldGroup.destroy(pacmans[exist]);
              neutral.add(pacmans[exist]);
            }

            pacmans[exist].x = pac.x;
            pacmans[exist].y = pac.y;
          }
          //sinon on construit l'objet physics
          else {
            var new_pacman = this.physics.add.sprite(w_shape, w_shape, "pacman");
            new_pacman.id = pac.id;
            new_pacman.x = random(cols) * 10;
            new_pacman.y = random(rows) * 10;
            new_pacman.score = 0;

            if (0 < pacman.score) {
              food.add(new_pacman);
            } else if (0 == pacman.score) {
              neutral.add(new_pacman);
            }

            //new_pacman.setDisplaySize(w_shape, w_shape);
            //new_pacman.setSize(w_shape, w_shape)

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
    pacman.body.velocity.x = 0;
    pacman.body.velocity.y = 0;
    if (upKey.isDown) {
      this.physics.moveTo(pacman, pacman.x, pacman.y - w_shape, pacman.speed, 33);
      pacman.anims.play("up", 30);
    } else if (downKey.isDown) {
      this.physics.moveTo(pacman, pacman.x, pacman.y + w_shape, pacman.speed, 33);
      pacman.anims.play("down", 30);
    } else if (leftKey.isDown) {
      this.physics.moveTo(pacman, pacman.x - w_shape, pacman.y, pacman.speed, 33);
      pacman.anims.play("left", 30);
    } else if (rightKey.isDown) {
      this.physics.moveTo(pacman, pacman.x + w_shape, pacman.y, pacman.speed, 33);
      pacman.anims.play("right", 30);
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