/****************************   Require Dependencies ************************************/

let express = require('express');
let ejs = require('ejs');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let path = require('path');
let http = require('http');
let socket = require('socket.io');
let sharedsession = require("express-socket.io-session");
let session = require("express-session")({
  secret: "ISENLILLE2022",
  resave: true,
  saveUninitialized: true
}); // Session that follows client IMPORTANT do not set secure to true
var gameServer = require('./gamejs/gameServer.js');
/********************* Initialize express, session, bodyparser and template engine *********************/

let app = express();

let server = http.createServer(app);

app.use(session);
app.use(cookieParser());

let port = 2001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('static'));
app.use('/node_modules', express.static(__dirname + '/node_modules')); // animate css
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');


/******************************************** Initialize gameServer ******************************************/

var gameServer = new gameServer();

/************************************************* Socket.io *************************************************/

let io = socket(server);

// Use shared session middleware for socket.io
io.use(sharedsession(session, {
    autoSave:true  // setting autoSave:true
}));

// Initialize a client server
let ClientServer = require('./gamejs/clientServer.js');
let clientServer = new ClientServer(gameServer, io);
clientServer.init();

/******************************************** Export relevant objects ***************************************/

module.exports = {
	server: server,
	io: io,
	gameServer: gameServer,
	clientServer: clientServer,
};

/*************************************** include routes *****************************************************/

let initialization = require('./routes/initialization');
app.use('/initialization', initialization);
let join = require('./routes/join');
app.use('/join', join);
let createGame = require('./routes/createGame');
app.use('/createGame', createGame);
let game = require('./routes/game');
app.use('/game', game);
let setBoats = require('./routes/setBoats');
app.use('/setBoats', setBoats);
let solo = require('./routes/solo');
app.use('/solo', solo);
let logout = require('./routes/logout');
app.use('/logout', logout);
let login = require('./routes/login')


// Main route
app.get('/', function(req, res) {
	let correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute === '/') {
	 	res.render('welcome');
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});


/**************************************** Listen server *******************************************************/
server.listen(port);