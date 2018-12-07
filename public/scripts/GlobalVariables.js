// Declare myGame, the object that contains our game's states
var myGame = {
  //Define our game states
  scenes: [],

  width: 6, //640;
  height: 4, //480;
  w: 1,

  cols: function() {
    return this.width / this.w
  },

  rows: function() {
    return this.height / this.w
  },

  w_shape: 30,

  isMobile: 0, //(window.innerWidth < 700)

  pacmans: [],
  pacman: null,

  map: null,
  ballLayer: null,

  // Define common framerate to be referenced in animations
  frameRate: 10
};