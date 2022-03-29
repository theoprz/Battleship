let express = require('express');
let gameServer = require('../server.js').gameServer;
let io = require('../server.js').io;
let router = express.Router(); //Create router object
let User = require('../models/user');

router.get('/', function (req, res, next) {
    return res.render('register');
});

router.post('/', function(req, res, next) {
    let personInfo = req.body;


    if(!personInfo || !personInfo.psw || !personInfo.pswConf){
        res.send();
    } else {
        if (personInfo.psw === personInfo.pswConf) {
            User.findOne({username:personInfo.uname},function(err,data){
                if(!data){
                    User.findOne({},function(err,data){
                        let newPerson = new User({
                            username: personInfo.uname,
                            password: personInfo.psw,
                            passwordConf: personInfo.pswConf,
                            score: 0
                        });

                        newPerson.save(function(err, Person){
                            if(err)
                                console.log(err);
                            else
                                console.log('Success');
                        });

                    }).sort({_id: -1}).limit(1);
                    res.render('index');
                }else{
                    res.render("register")
                }

            });
        }else{
            res.render("register")
        }
    }
});

module.exports = router;
