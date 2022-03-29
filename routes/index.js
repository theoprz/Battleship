let express = require('express');
let gameServer = require('../server.js').gameServer;
let io = require('../server.js').io;
let router = express.Router(); //Create router object
let User = require('../models/user');

router.get('/', function(req, res) {
    let correctRoute = gameServer.sendRoute(req.session.username);
    if (correctRoute === '/') {
        res.render('index');
    }
    else {
        res.redirect(correctRoute);
    }
});

router.post('/', function (req, res, next) {
    User.findOne({username:req.body.uname},function(err,data){
        if(data){

            if(data.password===req.body.psw){
                req.session.userId = data.unique_id;
                res.render('searchGame');
            }else{
                res.render('/');
            }
        }else{
            res.render('wrongPass')
        }
    });
});

module.exports = router;
