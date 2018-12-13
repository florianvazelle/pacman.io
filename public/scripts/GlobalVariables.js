// Declare myGame, the object that contains our game's states
var myGame = {
  //Define our game states
  scenes: [],

  width: 60, //640;
  height: 40, //480;
  w: 1,

  cols: function() {
    return this.width / this.w
  },

  rows: function() {
    return this.height / this.w
  },

  w_shape: 32,

  isMobile: 0, //(window.innerWidth < 700)

  pacmans: [],
  pacman: null,

  name: '',

  // Define common framerate to be referenced in animations
  frameRate: 10
};