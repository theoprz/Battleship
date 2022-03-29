let express = require('express');
let gameServer = require('../server.js').gameServer;
let io = require('../server.js').io;
let router = express.Router();

router.get('/', function(req, res) {
	let username = req.session.username;
	if (username) {
		if (gameServer.players[username].game) {
			io.sockets.to(gameServer.players[username].game.name).emit('logout', {});
			gameServer.removeGame(gameServer.players[username].game.name);

			gameServer.updateAvailableGames();
		}
		gameServer.removePlayer(username);
	}

	req.session.destroy();

	res.redirect('/');
});

module.exports = router;
