var toolbox = require("../toolbox");

/** Classe representant une cellule */

class Cell {

  /**
   * Creer une cellule
   *
   * @param {number} x - La valeur de x.
   * @param {number} y - La valeur de y.
   */

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.walls = [false, false, false, false]; //droite, gauche, bas, haut
    this.visited = false;
  }
}

const DEBUG = true;

const width = 60 //640;
const height = 40 //480;
const w = 1;

const cols = width / w;
const rows = height / w;

function maze() {
  var l_map = initialize_map()
  l_map = generate_maze(l_map);
  console.log("Fin maze");
  return generate_data(l_map);
}

/**
 * Initialise un tableau avec un objet Cellule
 * par coordonnees
 * (cf au commentaire de la class Cell)
 *
 * @method
 * @name initialize_map
 * @return {array} - La map initialise.
 */

function initialize_map() {
  var map = [];
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      map.push(new Cell(j, i));
    }
  }
  return map;
}

/**
 * Recursive backtracker (wikipedia)
 *
 * @method generate_maze
 * @param {array} - La map.
 * @return {array} - Une nouvelle map,
 * ou seul les murs des cellule on change (labyrinthe)
 */

function generate_maze(map) {
  var stack = []
  var current_idx = 0;
  while (1) {
    map[current_idx].visited = true;
    var neighbours = check_neighbours(current_idx, map);
    if (neighbours.length != 0) {
      //Choix au hasard d'un voisin non visite
      var rdm = toolbox.random(neighbours.length) - 1;
      var neighbour = neighbours[rdm];
      //Push l'index courant dans la pile
      stack.push(current_idx);
      //Suppression des murs entre la cellule courante et le voisin choisis
      map[current_idx].walls[neighbour.idx_wall] = true;
      var n = (neighbour.idx_wall == 1 || neighbour.idx_wall == 3) ? -1 : 1;
      map[neighbour.idx_map].walls[neighbour.idx_wall + n] = true;
      //On fait de l'index du voisin choisis, l'index courant
      current_idx = neighbour.idx_map;
    } else if (stack.length != 0) {
      current_idx = stack.pop();
    } else {
      break;
    }
  }
  return map;
}

/**
 * Regarde l'etat des voisins de la cellule courante
 * pour construire un tableau des voisins exploitable
 * (pas visite)
 *
 * @method check_neighbours
 * @param {number} - L'index de la cellule courante.
 * @param {array} - La map.
 * @return {array} - Les voisins non visite.
 */

function check_neighbours(idx, map) {
  var neighbours = [];
  var cell = map[idx];
  if (idx % cols < toolbox.modulo(idx + 1, cols)) {
    if (!map[idx + 1].visited) {
      neighbours.push({
        idx_map: idx + 1,
        idx_wall: 0
      });
    }
  }
  if (idx % cols > toolbox.modulo(idx - 1, cols)) {
    if (!map[idx - 1].visited) {
      neighbours.push({
        idx_map: idx - 1,
        idx_wall: 1
      });
    }
  }
  if (idx + cols < rows * cols) {
    if (!map[idx + cols].visited) {
      rows
      neighbours.push({
        idx_map: idx + cols,
        idx_wall: 2
      });
    }
  }
  if (idx - cols >= 0) {
    if (!map[idx - cols].visited) {
      neighbours.push({
        idx_map: idx - cols,
        idx_wall: 3
      });
    }
  }
  return neighbours;
}

function generate_data(map) {
  var value_sprite = {
    ball: 1,
    d_wall: 2,
    u_wall: 3,
    r_wall: 4,
    l_wall: 5
  }

  var new_maze = [];
  for (var i = 0; i < toolbox.calc(cols); i++) {
    new_maze[i] = [];
    for (var j = 0; j < toolbox.calc(rows); j++) {
      new_maze[i][j] = null;
    }
  }

  map.forEach((cell) => {
    var x = toolbox.calc(cell.x);
    var y = toolbox.calc(cell.y);

    new_maze[x][y] = value_sprite.ball;
    cell.walls.forEach((wall, idx) => {
      if (!wall) {
        if (idx == 0) new_maze[x + 1][y] = value_sprite.r_wall;
        if (idx == 1) new_maze[x - 1][y] = value_sprite.l_wall;
        if (idx == 2) new_maze[x][y + 1] = value_sprite.d_wall;
        if (idx == 3) new_maze[x][y - 1] = value_sprite.u_wall;
      } else {
        if (idx == 0) {
          new_maze[x + 1][y] = value_sprite.ball;
          new_maze[x + 1][y + 1] = value_sprite.d_wall;
          new_maze[x + 1][y - 1] = value_sprite.u_wall;
        }
        if (idx == 1) {
          new_maze[x - 1][y] = value_sprite.ball;
          new_maze[x - 1][y + 1] = value_sprite.d_wall;
          new_maze[x - 1][y - 1] = value_sprite.u_wall;
        }
        if (idx == 2) {
          new_maze[x][y + 1] = value_sprite.ball;
          new_maze[x + 1][y + 1] = value_sprite.r_wall;
          new_maze[x - 1][y + 1] = value_sprite.l_wall;
        }
        if (idx == 3) {
          new_maze[x][y - 1] = value_sprite.ball;
          new_maze[x + 1][y - 1] = value_sprite.r_wall;
          new_maze[x - 1][y - 1] = value_sprite.l_wall;
        }
      }
    });
  });

  var maze_final = [];
  new_maze.forEach((colonne) => {
    colonne.forEach((cell) => {
      if (cell == null) {
        maze_final.push(0);
      } else {
        maze_final.push(cell);
      }
    });
  });

  return maze_final;
}


function getWalls(maze) {
  var new_maze = [];
  maze.forEach((cell, idx) => {
    if (cell == 1) {
      new_maze.push(0);
    } else {
      new_maze.push(cell);
    }
  });
  return new_maze;
}

function getBalls(maze) {
  var new_maze = [];
  maze.forEach((cell, idx) => {
    if (cell != 1) {
      new_maze.push(0);
    } else {
      new_maze.push(cell);
    }
  });
  return new_maze;
}

var map = maze();
var export_maze = {
  height: toolbox.calc(cols),
  width: toolbox.calc(rows),
  get: [
    getWalls(map),
    getBalls(map)
  ]
};
module.exports = export_maze;