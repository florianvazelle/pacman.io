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
      x: 84,
      y: 84
    };

    this.imageGroup = [];
  }

  init() {
    console.log('Plugin is alive');
  }

  getCursors() {
    return this.cursors;
  }

  setSprite(imageGroup) {
    this.imageGroup = imageGroup;
  }

  setDirection(souris) {

    var deltaX = souris.x - this.initialPoint.x;
    var deltaY = souris.y - this.initialPoint.y;

    var dist = Math.hypot(deltaX, deltaY);
    var maxDistanceInPixels = 200;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      deltaY = 0;
      souris.y = this.initialPoint.y;
    } else {
      deltaX = 0;
      souris.x = this.initialPoint.x;
    }

    var angle = Math.atan2(deltaY, deltaX);

    if (dist > maxDistanceInPixels) {
      deltaX = Math.cos(angle) * maxDistanceInPixels;
      deltaY = Math.sin(angle) * maxDistanceInPixels;
    }

    this.cursors.up = (deltaY < 0);
    this.cursors.down = (deltaY > 0);
    this.cursors.left = (deltaX < 0);
    this.cursors.right = (deltaX > 0);

    this.imageGroup.forEach(function(sprite, index) {
      sprite.x = this.initialPoint.x + (deltaX) * index / 3;
      sprite.y = this.initialPoint.y + (deltaY) * index / 3;
    }, this);
  }
}