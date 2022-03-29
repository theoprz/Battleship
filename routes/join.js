let express = require('express');
let gameServer = require('../server.js').gameServer;
let io = require('../server.js').io;
let router = express.Router();

router.get('/', function(req, res) {
	let correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/join') {
		res.render('join');
	}

	else if (correctRoute == '/') {
		res.render('login');
	}else{
		res.redirect(correctRoute);
	}
});

router.post('/login', function(req, res) {
	let username = req.body.username;

	if (gameServer.players[username]) {
		res.status(406).send({message: "Username " + username + " already exists"})
	}else{
		req.session.username = username;
		req.session.save();
		gameServer.newPlayer(username);

		res.send({redirect: '/join'});
	}
});

router.post('/game', function(req, res, callback) {
	let gameName = req.body.picked;

	let game = gameServer.games[gameName];

	let username = req.session.username;

	let player = gameServer.players[username];

	if (game.isAvailable()) {
		gameServer.joinMultiplayerGame(gameName, player);
		res.send({redirect: '/initialization'});
	} else {
		isGameFull = true;
		res.send({redirect: '/join'});
	}
});

module.exports = router;
