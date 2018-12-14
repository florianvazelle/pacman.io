var gamePlayState = new Phaser.Class({
  // Define scene
  Extends: Phaser.Scene,
  initialize: function GamePlay() {
    Phaser.Scene.call(this, {
      key: 'GamePlay'
    });
  },

  preload: function() {
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

    this.cache.tilemap.events.on('add', function(cache, key) {
      this.displayChunk(key);
    }, this);

    this.load.image("ball", "./assets/sprites/map/ball.png");
    this.load.json("master", './assets/tilemaps/maps/chunks/master.json');
    this.load.image("tiles", "./assets/tilemaps/tiles/pacman-tiles-32x32.png");

    var os = this.sys.game.device.os;
    myGame.isMobile = (os.android || os.iPhone || os.windowsPhone);

    if (myGame.isMobile) {
      this.load.image('vjoy_base', './assets/sprites/joystick/base.png');
      this.load.image('vjoy_body', './assets/sprites/joystick/body.png');
      this.load.image('vjoy_cap', './assets/sprites/joystick/cap.png');
    }
  },

  create: function() {
    console.log("GamePlay");

    /* Create our pacman */
    let x = random(myGame.cols()) * myGame.w_shape;
    let y = random(myGame.rows()) * myGame.w_shape;
    myGame.pacman = new MyPacman(this, x, y, myGame.name);

    /* Variable for chunks */
    this.maps = {};
    this.listCollider = {};
    this.displayedChunks = [];

    var masterData = this.cache.json.get('master');
    this.chunkWidth = masterData.chunkWidth;
    this.chunkHeight = masterData.chunkHeight;
    this.nbChunksHorizontal = masterData.nbChunksHorizontal;
    this.nbChunksVertical = masterData.nbChunksVertical;
    this.lastChunkID = (this.nbChunksHorizontal * this.nbChunksVertical) - 1;

    /* Score */
    scoreText = this.add.text(16, 16, '', {
      fontSize: '32px',
      fill: '#fff'
    });
    scoreText.setStroke('#000', 16).setScrollFactor(0).setDepth(5);

    /* Mobile configuration */
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

    /* Different group of pacman */
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
    var worldWidth = masterData.nbChunksHorizontal * masterData.chunkWidth; // width of the world in tiles
    var worldHeight = masterData.nbChunksVertical * masterData.chunkHeight; // height of the world in tiles
    this.cameras.main.setBounds(0, 0, worldWidth * myGame.w_shape, worldHeight * myGame.w_shape);
    // Attach camera to player
    cam.startFollow(myGame.pacman);

    this.websocket();

    this.updateEnvironment();
  },

  /**
   * Définit notament la fonction heartbeat qui va permettre de mettre
   * à jour les données des autres joueurs
   *
   * @method websocket
   */
  websocket: function() {
    //Websocket
    var data = {
      x: myGame.pacman.x,
      y: myGame.pacman.y,
      score: myGame.pacman.score,
      name: myGame.pacman.name
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
            var new_pacman = new s_Pacman(this, pac.id, pac.x, pac.y, pac.name);
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
      this.updateHightScore();
    });
  },

  /**
   * Met à jour le tableau des score
   *
   * @method updateHightScore
   */
  updateHightScore: function() {
    var tmp_pacmans = myGame.pacmans.concat(myGame.pacman);
    tmp_pacmans.sort((a, b) => {
      if (a.score < b.score) {
        return 1;
      }
      if (a.score > b.score) {
        return -1;
      }
      return 0;
    });

    let new_scoreText = 'Leaderboard';
    let inTop = false;
    let length = (tmp_pacmans.length <= 5) ? tmp_pacmans.length : 5;
    for (var idx = 1; idx < length; idx++) {
      let pac = tmp_pacmans[idx - 1];
      if (pac.id == myGame.pacman.id) inTop = true;
      new_scoreText += '\n' + idx + '. ' + pac.getName() + ' ' + pac.score;
    }
    if (!inTop) {
      new_scoreText += '\n' + (tmp_pacmans.indexOf(myGame.pacman) + 1) + '. ' + myGame.pacman.getName() + ' ' + myGame.pacman.score;
    }
    scoreText.setText(new_scoreText);
  },

  update: function() {
    _x = Math.floor(myGame.pacman.x);
    _y = Math.floor(myGame.pacman.y);
    myGame.pacman.body.setVelocity(0);

    var chunkID = this.computeChunkID(_x, _y);
    if (this.maps.hasOwnProperty(chunkID)) {
      var map = this.maps[chunkID];
      var tile = map.getTileAtWorldXY(_x, _y);
      var pointerTileX = map.worldToTileX(_x);
      var pointerTileY = map.worldToTileY(_y);
      if (tile != null) {
        if (tile.index == 1) {
          this.maps[chunkID].putTileAt(0, pointerTileX, pointerTileY);
          myGame.pacman.score += 1;
        }
      }
    }

    if (myGame.isMobile) {
      var souris = this.input.manager.pointers[1].position;
      plugin.setDirection(souris);
      var cursors = plugin.getCursors();

      myGame.pacman.move(cursors.up, cursors.down, cursors.left, cursors.right);
      if (cursors.up || cursors.down || cursors.left || cursors.right) {
        this.updateEnvironment();
      }
    } else {
      myGame.pacman.move(upKey.isDown, downKey.isDown, leftKey.isDown, rightKey.isDown);
      if (upKey.isDown || downKey.isDown || leftKey.isDow || rightKey.isDown) {
        this.updateEnvironment();
      }
    }

    var data = {
      x: myGame.pacman.x,
      y: myGame.pacman.y,
      score: myGame.pacman.score
    };
    socket.emit('update', data);
  },

  /**
   * On détermine l'id du chunk sur
   * lequelle se trouve le joueur
   *
   * @method computeChunkID
   * @param  {int} x - la coordonnée x du pacman
   * @param  {int} y - la coordonnée y du pacman
   * @return {int} - l'id du chunk
   */
  computeChunkID: function(x, y) {
    var tileX = Math.floor(x / myGame.w_shape);
    var tileY = Math.floor(y / myGame.w_shape);
    var chunkX = Math.floor(tileX / this.chunkWidth);
    var chunkY = Math.floor(tileY / this.chunkHeight);
    return (chunkY * this.nbChunksHorizontal) + chunkX;
  },

  /**
   * On filtre une première liste de chunk avec une deuxième
   * pour obtenir une troisieme liste de chunk qui correspond
   * au chunk qui ne sont pas encore affichés et qui doivent l'être
   *
   * @method findDiffArrayElements
   * @param  {array} firstArray - liste des chunks qui doivent être affichés
   * @param  {array} secondArray - liste des chunks qui sont déja affichés
   * @return {array} - liste des chunk qui ne sont pas encore affichés et qui doivent l'être
   */
  findDiffArrayElements: function(firstArray, secondArray) {
    return firstArray.filter(function(i) {
      return secondArray.indexOf(i) < 0;
    });
  },

  /**
   * Actualise la vue du joueur, c'est à dire,
   * permettre la mise à jour des chunks
   *
   * @method updateEnvironment
   */
  updateEnvironment: function() {
    var chunkID = this.computeChunkID(myGame.pacman.x, myGame.pacman.y);
    var chunks = this.listAdjacentChunks(chunkID);
    var newChunks = this.findDiffArrayElements(chunks, this.displayedChunks);
    var oldChunks = this.findDiffArrayElements(this.displayedChunks, chunks);

    newChunks.forEach(function(nb) {
      console.log('loading chunk' + nb);
      this.load.tilemapTiledJSON('chunk' + nb, './assets/tilemaps/maps/chunks/chunk' + nb + '.json');
    }, this);
    if (newChunks.length > 0) this.load.start();

    oldChunks.forEach(function(nb) {
      console.log('destroying chunk' + nb);
      this.removeChunk(nb);
    }, this);
  },

  /**
   * Affiche les chunks qui ont été chargé
   *
   * @method displayChunk
   * @param  {string} key - correspond à l'id du fichier json précedement chargé
   */
  displayChunk: function(key) {
    var map = this.make.tilemap({
      key: key
    });

    var tileset = map.addTilesetImage("tilesheet", "tiles");

    var chunkID = parseInt(key.match(/\d+/)[0]);
    var chunkX = (chunkID % this.nbChunksHorizontal) * this.chunkWidth;
    var chunkY = Math.floor(chunkID / this.nbChunksHorizontal) * this.chunkHeight;

    var wallLayer = map.createStaticLayer("Wall Layer", tileset, chunkX * myGame.w_shape, chunkY * myGame.w_shape);
    map.setCollisionBetween(2, 5, true, true, wallLayer);
    var collider = this.physics.add.collider(myGame.pacman, wallLayer);
    this.listCollider[chunkID] = collider;

    var ballLayer = map.createDynamicLayer("Ball Layer", tileset, chunkX * myGame.w_shape, chunkY * myGame.w_shape);

    this.maps[chunkID] = map;
    this.displayedChunks.push(chunkID);
  },

  /**
   * Supprime le chunk n'ont essentiel à la vue,
   * on supprime aussi le fichier en cache et la collision, précédement
   * ajouté (sinon phaser va essayer d'afficher le chunk mais les donnée
   * du layer auront été supprimée)
   *
   * @method removeChunk
   * @param  {int} chunkID - correspond à l'id du chunk que l'on veut supprimer
   */
  removeChunk: function(chunkID) {
    this.maps[chunkID].destroy();
    this.physics.world.removeCollider(this.listCollider[chunkID]);
    delete this.cache['tilemap'].entries.entries['chunk' + chunkID]
    var idx = this.displayedChunks.indexOf(chunkID);
    if (idx > -1) this.displayedChunks.splice(idx, 1);
  },

  /**
   * Depuis l'id du chunk sur lequelle se trouve
   * le joueur, nous récupérons tout les chunks autour
   * du chunk courant
   *
   * @method listAdjacentChunks
   * @param  {int} chunkID - id du chunk courant
   * @return {array} - l'ensemble des chunk qui doivent etre affichée
   */
  listAdjacentChunks: function(chunkID) {
    var chunks = [];
    var isAtTop = (chunkID < this.nbChunksHorizontal);
    var isAtBottom = (chunkID > this.lastChunkID - this.nbChunksHorizontal);
    var isAtLeft = (chunkID % this.nbChunksHorizontal == 0);
    var isAtRight = (chunkID % this.nbChunksHorizontal == this.nbChunksHorizontal - 1);
    chunks.push(chunkID);
    if (!isAtTop) chunks.push(chunkID - this.nbChunksHorizontal);
    if (!isAtBottom) chunks.push(chunkID + this.nbChunksHorizontal);
    if (!isAtLeft) chunks.push(chunkID - 1);
    if (!isAtRight) chunks.push(chunkID + 1);
    if (!isAtTop && !isAtLeft) chunks.push(chunkID - 1 - this.nbChunksHorizontal);
    if (!isAtTop && !isAtRight) chunks.push(chunkID + 1 - this.nbChunksHorizontal);
    if (!isAtBottom && !isAtLeft) chunks.push(chunkID - 1 + this.nbChunksHorizontal);
    if (!isAtBottom && !isAtRight) chunks.push(chunkID + 1 + this.nbChunksHorizontal);
    return chunks;
  },
});

// Add scene to list of scenes
myGame.scenes.push(gamePlayState);

function random(n) {
  return Math.floor((Math.random() * n) + 1);
}