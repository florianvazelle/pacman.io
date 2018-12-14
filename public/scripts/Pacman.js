class Pacman extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, name) {
    super(scene, x, y, 'pacman');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(myGame.w_shape, myGame.w_shape);
    this.score = 0;
    this.name = name;
  }

  /**
   * Retourne le nom du joueur avec un maximun de 10 caractères
   *
   * @method getName
   * @return {string} - correspond au nom donnée par le joueur
   */
  getName() {
    let length = this.name.length;
    if (length > 10) {
      return this.name.substr(0, 10);
    } else {
      return this.name.concat(" ".repeat(10 - length));
    }
  }
}

class MyPacman extends Pacman {
  constructor(scene, x, y, name) {
    super(scene, x, y, name);
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


  /**
   * Appeler pour faire bouger le pacman du joueur
   *
   * @method move
   * @param  {boolean} up - oui ou non le joueur appuie veut aller en haut
   * @param  {boolean} down - oui ou non le joueur appuie veut aller en bas
   * @param  {boolean} left - oui ou non le joueur appuie veut aller à gauche
   * @param  {boolean} right - oui ou non le joueur appuie veut aller à droite
   */
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
  constructor(scene, id, x, y, name) {
    super(scene, x, y, name);
    this.id = id;
  }

  /**
   * Appeler pour mettre à jour les données du
   * pacman d'un autre joueur
   *
   * @method updateAttr
   * @param  {int} x - correspond à la nouvelle coordonnées en x d'un autre joueur
   * @param  {int} y - correspond à la nouvelle coordonnées en y d'un autre joueur
   * @param  {int} score - correspond au nouveau score d'un autre joueur
   */
  updateAttr(x, y, score) {
    this.x = x;
    this.y = y;
    this.score = score;
  }

  /**
   * Appeler pour mettre à jour le groupe du
   * pacman d'un autre joueur
   *
   * @method updateGroup
   * @param  {type} enemy   description
   * @param  {type} food    description
   * @param  {type} neutral description
   * @param  {type} score   description
   * @return {type}         description
   */
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