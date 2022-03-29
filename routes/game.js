let express = require('express');
let gameServer = require('../server.js').gameServer;
let io = require('../server.js').io;
let router = express.Router();

router.get('/', function(req, res) {
	let correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/game') {
	 	res.render('game');
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});

router.get('/getBattleship', function(req, res) {
	if (req.session.username) {
		let username = req.session.username;
		if (gameServer.players[username].game) {
			if (!gameServer.players[username].game.isAvailable()) {
				let battleship = gameServer.players[username].battleship;
				res.send({battleship: battleship})
			}
		}
	}
	else {
		res.status(400).send({errors: 'Vous n\'êtes pas connecté !!'});
	}
});


module.exports = router;
