var pacmans = [];
var pacman;

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

const width = 6 //640;
const height = 4 //480;
const w = 1;

const cols = width / w;
const rows = height / w;

const w_shape = 10;

function maze() {
  map = initialize_map()
  map = generate_maze(map);
  map = check_contour(map);
  if (DEBUG) console.log("Fin maze");
  return map;
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
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      map.push(new Cell(i, j));
    }
  }
  return map;
}

/**
 * Recursive backtracker
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
    neighbours = check_neighbours(current_idx, map);
    if (neighbours.length != 0) {
      var index = Math.floor(Math.random() * neighbours.length);
      stack.push(current_idx);

      map[current_idx].walls[index] = true;
      map[neighbours[index]].walls[((index == 3 || index == 1) ? index - 1 : index + 1)] = true;

      current_idx = neighbours[index];
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
  if (idx + 1 < rows * cols) {
    if (!map[idx + 1].visited) {
      neighbours.push(idx + 1);
    }
  }
  if (idx - 1 >= 0) {
    if (!map[idx - 1].visited) {
      neighbours.push(idx - 1);
    }
  }
  if (idx + rows < rows * cols) {
    if (!map[idx + rows].visited) {
      neighbours.push(idx + rows);
    }
  }
  if (idx - rows >= 0) {
    if (!map[idx - rows].visited) {
      neighbours.push(idx - rows);
    }
  }
  return neighbours;
}

function check_contour(map) {
  map.forEach((cell, idx) => {
    if (cell.x == 0) map[idx].walls[3] = false;
    if (cell.x == cols - 1) map[idx].walls[2] = false;
    if (cell.y == 0) map[idx].walls[1] = false;
    if (cell.y == rows - 1) map[idx].walls[0] = false;
  });
  return map;
}

var map = maze();