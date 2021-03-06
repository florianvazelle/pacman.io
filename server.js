var liste_pacman = [];

/** Classe representant un joueur */

class Pacman {

  /**
   * Creer un joueur
   *
   * @param {string} id - L'identifiant de la socket et donc du joueur.
   * @param {number} x - La valeur de x.
   * @param {number} y - La valeur de y.
   * @param {number} score - Le score du joueur.
   */

  constructor(id, x, y, score, name) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.score = score;
    this.name = name;
  }
}

/* Variable pour la création du serveur */
const http = require('http');
const serve = require('koa-static');

const hostname = '127.0.0.1';
const port = 55555;

const Koa = require('koa');
const app = new Koa();

/* Chaînage des promesses */
require('./lib/creator/createmaze')
  .then(result => {
    return require('./lib/splitter/splitmap')
  })
  .then(result => {
    http.createServer(app.callback());
    app.use(serve('./public'));

    var server = app.listen(port, hostname, listen);

    function listen() {
      var host = server.address().address;
      var port = server.address().port;
      console.log("App listening at http://" + host + ":" + port);
    }

    var io = require('socket.io').listen(server);

    setInterval(heartbeat, 33);

    function heartbeat() {
      io.sockets.emit('heartbeat', liste_pacman);
    }

    io.sockets.on('connection', connection);
  });


/**
 * Fonction appele lors d'une nouvelle
 * connection au serveur
 *
 * @method connection
 * @param {Object} socket -
 */

function connection(socket) {

  console.log("Nouveau client: " + socket.id);

  socket.on('start', (data) => {
    var new_pacman = new Pacman(socket.id, data.x, data.y, data.score, data.name);
    liste_pacman.push(new_pacman);
  });

  socket.on('update', (data) => {
    var pacman;
    for (var i = 0; i < liste_pacman.length; i++) {
      if (socket.id == liste_pacman[i].id) {
        pacman = liste_pacman[i];
      }
    }
    pacman.x = data.x;
    pacman.y = data.y;
    pacman.score = data.score;
  });

  socket.on('disconnect', () => {
    console.log("un client s'est deconnecté");
    liste_pacman.forEach((pacman, idx) => {
      if (pacman.id == socket.id) {
        liste_pacman.splice(idx, 1);
      }
    });
  });
}