class Pacman extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'pacman');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(myGame.w_shape, myGame.w_shape);
    this.score = 0;
  }
}

class MyPacman extends Pacman {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene = scene;
    this.speed = 200;

    // Create animations for player
    var anims = [
      ["right", 0, 1],
      ["left", 2, 3],
      ["up", 4, 5],
      ["down", 6, 7]
    ];

    anims.forEach((anim) => {
      this.scene.anims.create({
        key: anim[0],
        frames: this.scene.anims.generateFrameNumbers("pacman", {
          start: anim[1],
          end: anim[2]
        }),
        repeat: 0
      });
    });
  }

  move(up, down, left, right) {
    if (up) {
      this.scene.physics.moveTo(this, this.x, this.y - myGame.w_shape, this.speed);
      this.anims.play("up", 30);
    } else if (down) {
      this.scene.physics.moveTo(this, this.x, this.y + myGame.w_shape, this.speed);
      this.anims.play("down", 30);
    } else if (left) {
      this.scene.physics.moveTo(this, this.x - myGame.w_shape, this.y, this.speed);
      this.anims.play("left", 30);
    } else if (right) {
      this.scene.physics.moveTo(this, this.x + myGame.w_shape, this.y, this.speed);
      this.anims.play("right", 30);
    }
  }
}

class s_Pacman extends Pacman {
  constructor(scene, id, x, y) {
    super(scene, x, y);
    this.id = id;
  }

  updateAttr(x, y, score) {
    this.x = x;
    this.y = y;
    this.score = score;
  }

  updateGroup(enemy, food, neutral, score) {
    if (this.score > score && !enemy.contains(this)) {
      ((neutral.contains(this)) ? neutral : food).remove(this);
      this.setTexture("pacman_red");
      enemy.add(this);
    } else if (this.score < score && !food.contains(this)) {
      ((neutral.contains(this)) ? neutral : enemy).remove(this);
      this.setTexture("pacman_green");
      food.add(this);
    } else if (this.score == score && !neutral.contains(this)) {
      ((enemy.contains(this)) ? enemy : food).remove(this);
      this.setTexture("pacman");
      neutral.add(this);
    }
  }
}