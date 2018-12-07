var maze = require("./maze");

var wallLayer = maze.getWalls;
var ballLayer = maze.getBalls;

var jsonMaze = {
  height: maze.height,
  layers: [{
    data: wallLayer,
    height: maze.height,
    name: "Wall Layer",
    opacity: 1,
    type: "tilelayer",
    visible: true,
    width: maze.width,
    x: 0,
    y: 0
  }, {
    data: ballLayer,
    height: maze.height,
    name: "Ball Layer",
    opacity: 1,
    type: "tilelayer",
    visible: true,
    width: maze.width,
    x: 0,
    y: 0
  }],
  nextobjectid: 1,
  orientation: "orthogonal",
  properties: {},
  renderorder: "right-down",
  tileheight: 100,
  tilesets: [{
    firstgid: 1,
    image: "../tile/pacman_map.png",
    imageheight: 400,
    imagewidth: 300,
    margin: 0,
    name: "tiles",
    properties: {},
    spacing: 0,
    tileheight: 100,
    tilewidth: 100,
  }],
  tilewidth: 100,
  version: 1,
  width: maze.width,
}

module.exports = jsonMaze;