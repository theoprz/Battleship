let express = require('express');
let gameServer = require('../server.js').gameServer;
let io = require('../server.js').io;
let router = express.Router();

router.get('/', function(req, res) {
	let correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/') {
	 	res.render('createGame');
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});

router.post('/', function(req, res) {
	let username = req.body.username;
	let gameName = req.body.gameName;

	if (gameServer.usernameAlreadyExists(username)) {
		res.status(406).send({message: "L\'Utilisateur " + username + " existe déja"});
	}

	else if (gameServer.gameNameAlreadyExists(gameName)) {
		res.status(406).send({message: "Le salon " + gameName + " existe déja"});
	}else{
		req.session.username = username;
		req.session.save();

		gameServer.newPlayer(username);

		gameServer.createMultiplayerGame(gameName, gameServer.players[username]);
		io.emit('listGames', gameServer.availableGames);

		res.send({redirect: '/initialization'});
	}
});


module.exports = router;
