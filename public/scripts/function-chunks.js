var computeChunkID = function(x, y) {
  var tileX = Math.floor(x / myGame.w_shape);
  var tileY = Math.floor(y / myGame.w_shape);
  var chunkX = Math.floor(tileX / myGame.chunkWidth);
  var chunkY = Math.floor(tileY / myGame.chunkHeight);
  return (chunkY * myGame.nbChunksHorizontal) + chunkX;
};

var findDiffArrayElements = function(firstArray, secondArray) {
  return firstArray.filter(function(i) {
    return secondArray.indexOf(i) < 0;
  });
};

var updateEnvironment = function() {
  var chunkID = scene.computeChunkID(myGame.pacman.x, myGame.pacman.y);
  var chunks = scene.listAdjacentChunks(chunkID); // List the id's of the chunks surrounding the one we are in
  var newChunks = scene.findDiffArrayElements(chunks, myGame.displayedChunks); // Lists the surrounding chunks that are not displayed yet (and have to be)
  var oldChunks = scene.findDiffArrayElements(myGame.displayedChunks, chunks); // Lists the surrounding chunks that are still displayed (and shouldn't anymore)

  newChunks.forEach(function(c) {
    console.log('loading chunk' + c);
    console.log(scene);
    scene.game.load.tilemapTiledJSON('chunk' + c, './assets/tilemaps/maps/chunks/chunk' + c + '.json');
  });
  if (newChunks.length > 0) scene.load.start(); // Needed to trigger loads from outside of preload()

  oldChunks.forEach(function(c) {
    console.log('destroying chunk' + c);
    myGame.removeChunk(c);
  });
};

var displayChunk = function(key) {
  var map = scene.make.tilemap({
    key: key
  });

  // The first parameter is the name of the tileset in Tiled and the second parameter is the key
  // of the tileset image used when loading the file in preload.
  var tiles = map.addTilesetImage('tilesheet', 'tiles');

  // We need to compute the position of the chunk in the world
  var chunkID = parseInt(key.match(/\d+/)[0]); // Extracts the chunk number from file name
  var chunkX = (chunkID % myGame.nbChunksHorizontal) * myGame.chunkWidth;
  var chunkY = Math.floor(chunkID / myGame.nbChunksHorizontal) * myGame.chunkHeight;

  for (var i = 0; i < map.layers.length; i++) {
    // You can load a layer from the map using the layer name from Tiled, or by using the layer
    // index
    var layer = map.createStaticLayer(i, tiles, chunkX * myGame.w_shape, chunkY * myGame.w_shape);
    // Trick to automatically give different depths to each layer while avoid having a layer at depth 1 (because depth 1 is for our player character)
    layer.setDepth(2 * i);
  }

  myGame.maps[chunkID] = map;
  myGame.displayedChunks.push(chunkID);
};

var removeChunk = function(chunkID) {
  myGame.maps[chunkID].destroy();
  var idx = myGame.displayedChunks.indexOf(chunkID);
  if (idx > -1) myGame.displayedChunks.splice(idx, 1);
};

var listAdjacentChunks = function(chunkID) {
  var chunks = [];
  var isAtTop = (chunkID < myGame.nbChunksHorizontal);
  var isAtBottom = (chunkID > myGame.lastChunkID - myGame.nbChunksHorizontal);
  var isAtLeft = (chunkID % myGame.nbChunksHorizontal == 0);
  var isAtRight = (chunkID % myGame.nbChunksHorizontal == myGame.nbChunksHorizontal - 1);
  chunks.push(chunkID);
  if (!isAtTop) chunks.push(chunkID - myGame.nbChunksHorizontal);
  if (!isAtBottom) chunks.push(chunkID + myGame.nbChunksHorizontal);
  if (!isAtLeft) chunks.push(chunkID - 1);
  if (!isAtRight) chunks.push(chunkID + 1);
  if (!isAtTop && !isAtLeft) chunks.push(chunkID - 1 - myGame.nbChunksHorizontal);
  if (!isAtTop && !isAtRight) chunks.push(chunkID + 1 - myGame.nbChunksHorizontal);
  if (!isAtBottom && !isAtLeft) chunks.push(chunkID - 1 + myGame.nbChunksHorizontal);
  if (!isAtBottom && !isAtRight) chunks.push(chunkID + 1 + myGame.nbChunksHorizontal);
  return chunks;
};