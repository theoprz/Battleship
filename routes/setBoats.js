let express = require('express');
let gameServer = require('../server.js').gameServer;
let io = require('../server.js').io;
let router = express.Router();

router.get('/', function(req, res) {
	let correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/setBoats') {
	 	res.render('setBoats');
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});

router.get('/getBoats', function(req, res) {
	if (req.session.username) {
		let username = req.session.username;
		if (gameServer.players[username].game) {
			if (!gameServer.players[username].game.isAvailable()) {
				let battleship = gameServer.players[username].battleship;
				res.send({battleship: battleship});
			}
		}
	}
	else {
		res.status(400).send({errors: 'Il y a eu une erreur'});
	}
});


router.post('/sendBoats', function(req, res) {
	let username = req.session.username;
	let battleship = gameServer.players[username].battleship;

	let errors = [];

	if (req.body.randomSet) {
		battleship.randomSetBoats();
	}else{

		let sentBoats = req.body.boats;

		let boats = battleship.boats;

		for (sentBoat in sentBoats) {
			sentBoats[sentBoat].coordinates = sentBoats[sentBoat].coordinates.map(Number);

			boats[sentBoat].setPosition(sentBoats[sentBoat].coordinates, sentBoats[sentBoat].direction);

			if (!sentBoats[sentBoat].isSet) {
				errors.push(sentBoat + ' n\'a pas été posé !');
			}

			boats[sentBoat].setCoordinatesList();

			let error = battleship.positionIsNotValid(sentBoat);
			if (error) {
				errors.push(error);
			}else{
				battleship.setBoat(sentBoat);
			}
		}
	}

	if (errors.length != 0) {
		res.status(400).send({errors: errors});
	}else{
		battleship.areBoatsSet = true;
		res.send({
			redirect:'/game',
		});
	}
});



module.exports = router;
