var toolbox = {

  /**
   *
   *
   *
   */

  random: function(n) {
    return Math.floor((Math.random() * n) + 1);
  },

  modulo: function(num, mod) {
    return ((num % mod) + mod) % mod;
  },

  /**
   *
   *
   * @method calc
   * @param {number} - Le n-ieme index
   * @return {number} - Le chiffre correspondante a la suite pour le n
   */

  calc: function(n) {
    return 3 * n + 1;
  },

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

  myCreate: function(x, y, group, sprite) {
    elem = group.create(x, y, sprite);
    elem.setDisplaySize(w_shape, w_shape);
    elem.setSize(w_shape, w_shape);
    return elem;
  }
}

module.exports = toolbox;