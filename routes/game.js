/************************************* Require dependencies **********************************************/

var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;
var router = express.Router(); //Create router object

/************************************* Join routes *********************************************************/
router.get('/', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/game') {
	 	res.render('game');
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});

// Get request to give the client the battleship object with all the boats inside
router.get('/getBattleship', function(req, res) {
	// Check if player has a username and is in a valid game
	if (req.session.username) {  
		var username = req.session.username;
		if (gameServer.players[username].game) {
			if (!gameServer.players[username].game.isAvailable()) {
				// Retrieve the battleship object of the player
				var battleship = gameServer.players[username].battleship;
				res.send({battleship: battleship})
			}
		}
	}
	else {
		res.status(400).send({errors: 'You are not connected !!'});
	}
});


module.exports = router;
