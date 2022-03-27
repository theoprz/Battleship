/************************************* Require dependencies **********************************************/

var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;
var router = express.Router(); //Create router object

/************************************* Join routes *********************************************************/

// Get the join page
router.get('/', function(req, res) {
	// Check if the user is using the correct route
	var correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/join') {
		res.render('join');
	}

	else if (correctRoute == '/') {
		res.render('login');
	} 

	// If the user is not using the correct route, send him to the correct route
	else {
		res.redirect(correctRoute);
	}
});

// Retrieve login information when the user whises to join a game
router.post('/login', function(req, res) {
	// Get all the form elements
	var username = req.body.username;

	// check if the username already exists
	if (gameServer.players[username]) {
		res.status(406).send({message: "Username " + username + " already exists"})
	}

	// If the username does not exist, add it to the server object
	else {
		// Add new player
		req.session.username = username; //Save player username in his session
		req.session.save();
		gameServer.newPlayer(username);

		res.send({redirect: '/join'});
	}
});

router.post('/game', function(req, res, callback) {
	// Get the game element
	var gameName = req.body.picked;

	//Find the game matching gameName
	var game = gameServer.games[gameName];

	// Get the username of the player
	var username = req.session.username;

	//Find the player matching username
	var player = gameServer.players[username];

	//Join game if possible
	if (game.isAvailable()) {
		gameServer.joinMultiplayerGame(gameName, player);
		res.send({redirect: '/initialization'});
	} else {
		isGameFull = true;
		res.send({redirect: '/join'});
	}
});

module.exports = router;