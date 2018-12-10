const fs = require('fs');
const path = require('path');
const maze = require('./maze')

function createMaze() {

  var root = path.dirname(path.dirname(__dirname));
  var mapsPath = "/public/assets/tilemaps/maps/";
  var outputDirectory = path.join(root, mapsPath);

  fs.readFile("./lib/creator/template-map.json", 'UTF-8', (err, data) => {
    if (err) throw err;
    var map = JSON.parse(data);
    map.width = maze.width;
    map.height = maze.height;
    map.layers.forEach((layer, idx) => {
      map.layers[idx].data = maze.get[idx];
      map.layers[idx].width = maze.width;
      map.layers[idx].height = maze.height;
    });

    fs.writeFile(path.join(outputDirectory, 'fullmap.json'), JSON.stringify(map), function(err) {
      if (err) throw err;
      console.log('Fullmap file written');
    });
  });
}

createMaze();