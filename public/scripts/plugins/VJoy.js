class VJoy extends Phaser.Plugins.BasePlugin {

  constructor(pluginManager) {
    super('VJoy', pluginManager);

    this.cursors = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    this.initialPoint = {
      x: 0,
      y: 0
    };

    this.settings = {
      singleDirection: true,
      maxDistanceInPixels: 200
    };

    this.imageGroup = [];

    this.active = false;
  }

  /**
   * First function call
   * @method init
   */
  init() {
    console.log('Plugin is alive');
  }

  /**
   * To get the cursors attribute
   * @method getCursors
   * @return {Object}
   */
  getCursors() {
    return this.cursors;
  }

  /**
   * For set sprite
   * @method setSprite
   * @param {array} - Array of multiple sprite
   */
  setSprite(imageGroup) {
    this.imageGroup = imageGroup;
    this.removeJoystick();
  }

  /**
   * To define cursors
   * @method setDirection
   * @param {Object} - Coordinates of pointer (A Pointer object encapsulates both mouse and touch input within Phaser.)
   */
  setDirection(mouse) {
    if (!this.active) {
      return;
    }

    var deltaX = mouse.x - this.initialPoint.x;
    var deltaY = mouse.y - this.initialPoint.y;

    var dist = Math.hypot(deltaX, deltaY);
    var maxDistanceInPixels = this.settings.maxDistanceInPixels;

    if (this.settings.singleDirection) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        deltaY = 0;
        mouse.y = this.initialPoint.y;
      } else {
        deltaX = 0;
        mouse.x = this.initialPoint.x;
      }
    }

    var angle = Math.atan2(deltaY, deltaX);

    if (dist > maxDistanceInPixels) {
      deltaX = Math.cos(angle) * maxDistanceInPixels;
      deltaY = Math.sin(angle) * maxDistanceInPixels;
    }

    if (deltaY > 0 && deltaX < 0) deltaY = 0; //Petit ajustement
    this.cursors = {
      up: (deltaY < 0),
      down: (deltaY > 0),
      left: (deltaX < 0),
      right: (deltaX > 0)
    }

    this.imageGroup.forEach(function(sprite, index) {
      sprite.x = this.initialPoint.x + (deltaX) * index / 3;
      sprite.y = this.initialPoint.y + (deltaY) * index / 3;
    }, this);
  }

  /**
   * For create the Joystick
   * @method createJoystick
   * @param {Object} - Coordinates of pointer.
   */
  createJoystick(mouse) {
    this.active = true;

    this.imageGroup.forEach((sprite, idx) => {
      sprite.visible = true;
      sprite.setScrollFactor(0);
      sprite.setDepth(idx + 5)

      sprite.x = mouse.x;
      sprite.y = mouse.y;

    });

    this.initialPoint = {
      x: mouse.x,
      y: mouse.y
    };
  }

  /**
   * For remove the Joystick
   * @method removeJoystick
   */
  removeJoystick() {
    this.active = false;

    this.imageGroup.forEach((sprite) => {
      sprite.visible = false;
    });

    this.cursors = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }
}