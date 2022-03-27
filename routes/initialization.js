/************************************* Require dependencies **********************************************/

var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;
var router = express.Router(); //Create router object

/************************************* Join routes *********************************************************/

router.get('/', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/initialization' || correctRoute == '/setBoats') {
	 	res.render('initialize');
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});


module.exports = router;