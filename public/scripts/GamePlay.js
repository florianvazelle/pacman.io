var gamePlayState = new Phaser.Class({
    // Define scene
    Extends: Phaser.Scene,
    initialize:
    function GamePlay(){
	Phaser.Scene.call(this, {key: 'GamePlay'});
    },

    preload: function() {
	// Preload images for this state
	this.load.spritesheet(
	    "pacman",
	    "./img/pacman_sprite.png",
	    {
		frameWidth: 14,
		frameHeight: 15
	    }
	);
    },

    create: function() {
	// Create objects
	console.log("GamePlay");

	// Create player
	pacman = this.physics.add.sprite(w_shape, w_shape, "pacman");
	pacman.x = random(cols) * 10;
	pacman.y = random(rows) * 10;
	pacman.score = 0;
	
	// Create animations for player
	this.anims.create({
	    key: "left",
	    frames: this.anims.generateFrameNumbers("pacman", { start: 2, end: 3 }),
	    repeat: 0
	});
	this.anims.create({
	    key: "down",
	    frames: this.anims.generateFrameNumbers("pacman", { start: 6, end: 7 }),
	    repeat: 0
	});
	this.anims.create({
	    key: "right",
	    frames: this.anims.generateFrameNumbers("pacman", { start: 0, end: 1 }),
	    repeat: 0
	});
	this.anims.create({
	    key: "up",
	    frames: this.anims.generateFrameNumbers("pacman", { start: 4, end: 5 }),
	    repeat: 0
	});

	// Create Keyboard controls
	upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
	downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
	leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);	
	rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
	
	//create_ground();

	enemy = this.add.graphics({ lineStyle: { color: 0xff0000 } });
	food = this.add.graphics({ lineStyle: { color: 0x00ff00 } });
	neutral = this.add.graphics({ lineStyle: { color: 0xffff00 } });
	ellipse = new Phaser.Geom.Ellipse(0, 0, 10, 10);
	
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
	    pacmans = data;
	});
    },

    update: function() {
	//effacer ellipse

	//Afficher les autres joueurs
	pacmans.forEach((pac) => {
	    if(pac.id.localeCompare(socket.id) != 0){
		if(pac.score > pacman.score){
		    ellipse.setPosition(pac.x, pac.y);
		    enemy.strokeEllipseShape(ellipse);
		    //draw ennemy (pacman rouge)
		}
		if(pac.score < pacman.score){
		    ellipse.setPosition(pac.x, pac.y);
		    food.strokeEllipseShape(ellipse);
		    //draw pacman vert (que l'on peut manger)
		}
		else {
		    ellipse.setPosition(pac.x, pac.y);
		    neutral.strokeEllipseShape(ellipse);
		    //draw pacman jaune, neutre
		}
		liste_ellipse.push(ellipse);
	    }
	});
    	
	if (upKey.isDown){
	    pacman.y -= w_shape;
	    pacman.anims.play("up", 30);
	}
	else if (downKey.isDown){
	    pacman.y += w_shape;
	    pacman.anims.play("down", 30);
	}

	if (leftKey.isDown){
	    pacman.x -= w_shape;
	    pacman.anims.play("left", 30);
	}
	else if (rightKey.isDown){
	    pacman.x += w_shape;
	    pacman.anims.play("right", 30);
	}

	var data = {
	    x: pacman.x,
	    y: pacman.y,
	    score: pacman.score
	};
	socket.emit('update', data);
    }
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

function calc(n){
    return 3 * n + 1;
}

function create_ground(){    
    // Create walls
    walls = this.physics.add.staticGroup();
    // Create balls
    balls = this.physics.add.staticGroup();
    
    map.forEach((cell) => {
	var x = calc(cell.x) * w_shape;
	var y = calc(cell.y) * w_shape;
	balls.create(x, y, 'ball').setScale(0.1);;
	cell.walls.forEach((wall, idx) => {
	    if(!wall){
		if(idx == 0) walls.create(x + w_shape, y, 'wall_right').setScale(0.1);
		if(idx == 1) walls.create(x - w_shape, y, 'wall_left').setScale(0.1);
		if(idx == 2) walls.create(x, y + w_shape, 'wall_down').setScale(0.1);
		if(idx == 3) walls.create(x, y - w_shape, 'wall_up').setScale(0.1);
	    } else {
		if(idx == 0) balls.create(x + w_shape, y, 'ball').setScale(0.1);
		if(idx == 1) balls.create(x - w_shape, y, 'ball').setScale(0.1);
		if(idx == 2) balls.create(x, y + w_shape, 'ball').setScale(0.1);
		if(idx == 3) balls.create(x, y - w_shape, 'ball').setScale(0.1);
	    }
	});
    });
    
    // Add collider between player and walls
    this.physics.add.collider(pacman, walls);
    
    // Add overlap between player and balls
    this.physics.add.overlap(pacman, balls,
			     (pacman, ball) => {
				 ball.disableBody(true, true);
				 pacman.score++;
			     }, null, this);
}