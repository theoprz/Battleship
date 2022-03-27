/************************************* Require dependencies **********************************************/

var express = require('express');
var gameServer = require('../server.js').gameServer;
var router = express.Router(); //Create router object

/************************************* Join routes *********************************************************/
router.get('/', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/') {
		// Attribute a username to the user
		req.session.username = req.sessionID;
		req.session.save();

		var UserID = req.sessionID;


		// Create new player object
		gameServer.newPlayer(UserID);

		// Create solo game with an AI
		gameServer.createSoloGame(gameServer.players[UserID]);
		// Redirect to set boats afterwards
		res.redirect('/setBoats');
	} else {
		res.redirect(correctRoute);
	}
});

module.exports = router;