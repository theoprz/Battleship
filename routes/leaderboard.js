let express = require('express');
let gameServer = require('../server.js').gameServer;
let io = require('../server.js').io;
let router = express.Router(); //Create router object

router.get('/', function(req, res) {
    let correctRoute = gameServer.sendRoute(req.session.username);
    if (correctRoute === '/') {
        res.render('leaderboard');
    }
    else {
        res.redirect(correctRoute);
    }
});

module.exports = router;
