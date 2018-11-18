/**
 *
 *
 *
 */

function random(n) {
  return Math.floor((Math.random() * n) + 1);
}

function modulo(num, mod) {
  return ((num % mod) + mod) % mod;
}

/**
 * Permet de creer dans un groupe un element physique, avec le sprite
 * correspondant et de le redimensionner (image et masque de collision)
 * en fonction de la valeur global w_shape
 * Utilise pour la creation du terrain (boules et murs)
 *
 * @method myCreate
 * @param {number}
 * @param {number}
 * @param {Object}
 * @param {string}
 */

function myCreate(x, y, group, sprite) {
  elem = group.create(x, y, sprite);
  elem.setDisplaySize(w_shape, w_shape);
  elem.setSize(w_shape, w_shape);
}