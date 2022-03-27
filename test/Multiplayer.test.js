"use strict"

let chai = require('chai');
let expect = require('chai').expect;
let chaiHttp = require('chai-http');
let server = require('../server.js').server;
let gameServer = require('../server.js').gameServer;
chai.use(chaiHttp);


let io = require('socket.io-client');

let ioOptions = {
	transports: ['websocket'],
	forceNew: true,
	reconnection: true
};

let player_oneSocket = io('http://localhost:2001', ioOptions);
let player_twoSocket = io('http://localhost:2001', ioOptions);

// Player one
let player_one = chai.request.agent(server);
let boatsPlayerOne = require('./testObjects.js').boatsPlayerOne;

// Player two
let player_two = chai.request.agent(server);
let boatsPlayerTwo = require('./testObjects.js').boatsPlayerTwo;

let player_three = chai.request.agent(server);



describe('Multiplayer game between player_one and player_two', function() {
	describe('Initialize multiplayer game', function() {
		it('it should return the Main page', function(done) {
			chai.request(server)
				.get('/')
				.end(function(err, res) {
					expect(res).to.have.status(200);
				done();
				});
		});

		it('Player one should create a game on the createGame page', function(done) {
			player_one
				.post('/createGame')
				.send({username: 'Francois', gameName: 'MyGame'})
				.end(function(err, res) {
					expect(res.statusCode).to.equal(200);
					expect(gameServer.players).to.include.any.keys('Francois');
					expect(gameServer.games).to.include.any.keys('MyGame');
					expect(gameServer.availableGames).to.include.any.keys('MyGame');
				done();
				});
		});

		it('Player two should get the join page', function(done) {
			player_two
				.get('/join')
				.end(function(err, res) {
					expect(res.statusCode).to.equal(200);
				done();
			});
		});

		it('Player two should post a username to login', function(done) {
			player_two
				.post('/join/login')
				.send({username: 'Nicolas'})
				.end(function(err, res) {
					expect(res.statusCode).to.equal(200);
					expect(gameServer.players).to.include.any.keys('Nicolas');
				done();
			});
		});

		it('Player two should join a game', function(done) {
			player_two
				.post('/join/game')
				.send({username: 'Nicolas', picked: 'MyGame'})
				.end(function(err, res) {
					expect(res.statusCode).to.equal(200);
					expect(gameServer.availableGames).to.not.include.any.keys('MyGame');
					expect(gameServer.players['Nicolas'].game).to.have.property('name', 'MyGame');
					expect(gameServer.games['MyGame']).to.have.property('player_one', gameServer.players['Francois']);
					expect(gameServer.games['MyGame']).to.have.property('player_two', gameServer.players['Nicolas']);
				done();
			});
		});

		it('Player three should not login with the same username as player_two', function(done) {
			player_two
				.post('/join/login')
				.send({username: 'Nicolas'})
				.end(function(err, res) {
					expect(res.statusCode).to.equal(406);
				done();
			});
		});

		it('Player three should not create a game with the same name as MyGame', function(done) {
			player_two
				.post('/createGame')
				.send({username: 'player_three', gameName: 'MyGame'})
				.end(function(err, res) {
					expect(res.statusCode).to.equal(406);
				done();
			});
		});

		it('Player one should get the setBoats page', function(done) {
			player_one
				.get('/setBoats')
				.end(function(err, res) {
					expect(res.statusCode).to.equal(200);
				done();
			});
		});

		it('Player one should get the setBoats content', function(done) {
			player_one
				.get('/setBoats/getBoats')
				.end(function(err, res) {
					expect(res.statusCode).to.equal(200);
					expect(res.body).to.have.property('battleship');
					expect(res.body.battleship).to.have.property('grid');
					expect(res.body.battleship.grid).to.be.an('array');
					expect(res.body.battleship).to.have.property('boats');
					expect(res.body.battleship.boats).to.be.an('Object');
				done();
			});
		});

		it('Player two should get the setBoats content', function(done) {
			player_two
				.get('/setBoats/getBoats')
				.end(function(err, res) {
					expect(res.statusCode).to.equal(200);
					expect(res.body).to.have.property('battleship');
					expect(res.body.battleship).to.have.property('grid');
					expect(res.body.battleship.grid).to.be.an('array');
					expect(res.body.battleship).to.have.property('boats');
					expect(res.body.battleship.boats).to.be.an('Object');
				done();
			});
		});

		it('Player one should set his boats', function(done) {
			player_one
				.post('/setBoats/sendBoats')
				.send({boats: boatsPlayerOne})
				.end(function(err, res) {
					expect(res.statusCode).to.equal(200);
					expect(res.body.redirect).to.equal('/game');
				done();
			});
		});

		it('Player two should set his boats', function(done) {
			player_two
				.post('/setBoats/sendBoats')
				.send({boats: boatsPlayerTwo})
				.end(function(err, res) {
					expect(res.statusCode).to.equal(200);
					expect(res.body.redirect).to.equal('/game');
				done();
			});
		});
	});

	describe('Multiplayer disconnect', function() {
		it('Player two should be disconnected', function(done) {
			player_two
				.get('/logout')
				.end(function(err, res) {
					expect(res.statusCode).to.equal(200);
					expect(res).to.redirectTo('http://127.0.0.1:2001/');
					expect(gameServer.players).to.not.have.any.key('Nicolas');
				done();
			});
		});

		it('should remove the created game', function(done) {
			expect(gameServer.games).to.not.have.any.key('MyGame');
			done();
		});

		it('should disconnect the first player', function(done) {
			player_one
				.get('/logout')
				.end(function(err, res) {
					expect(res.statusCode).to.equal(200);
					expect(res).to.redirectTo('http://127.0.0.1:2001/');
					expect(gameServer.players).to.not.have.any.key('Francois');
				done();
			});
		});
	});
});


module.exports = {player_one: player_one, player_two: player_two};
