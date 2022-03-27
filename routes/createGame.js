/************************************* Require dependencies **********************************************/

var express = require('express');

var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;

var router = express.Router(); //Create router object

/************************************* createGame routes *********************************************************/

router.get('/', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/') {
	 	res.render('createGame');
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});


// Post the information about the user and the game that the user wants to create
router.post('/', function(req, res) {
	// Get all the form elements
	var username = req.body.username;
	var gameName = req.body.gameName;

	// Check if username aleady exists
	if (gameServer.usernameAlreadyExists(username)) {
		res.status(406).send({message: "Username " + username + " already exists"});
	}

	// Check if game name already exists
	else if (gameServer.gameNameAlreadyExists(gameName)) {
		res.status(406).send({message: "Game name " + gameName + " already exists"});
	}

	// Add new player
	else { 

		req.session.username = username; //Save player username in his session
		req.session.save();

		// Create new player object
		gameServer.newPlayer(username);

		//Create Game
		gameServer.createMultiplayerGame(gameName, gameServer.players[username]);
		//Send the updated version of all available games to the other users
		io.emit('listGames', gameServer.availableGames);

		res.send({redirect: '/initialization'}); //Redirect to waiting area for another player to join the game !
	}
});


module.exports = router;