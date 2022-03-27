"use strict"

var chai = require('chai');
var expect = require('chai').expect;
var gameServer = require('../server.js').gameServer;


describe('GameServer tests', function() {
	describe('player and game creation', function() {
		it('should create a new user', function(done) {
			gameServer.newPlayer('player_one');
			expect(gameServer.players).to.have.any.key('player_one');
			done();
		});

		it('should create a new multiplayer game', function(done) {
			gameServer.createMultiplayerGame('MyGame', gameServer.players['player_one']);
			expect(gameServer.games).to.have.any.key('MyGame');
			expect(gameServer.games['MyGame']).to.have.property('gameType', 'multi');
			expect(gameServer.players['player_one']).to.have.property('game', gameServer.games['MyGame']);
			done();
		});	

		it('should remove the created multiplayer game', function(done) {
			gameServer.removeGame('MyGame');
			expect(gameServer.players).to.not.have.key('MyGame');
			done();
		});

		it('should create a new singleplayer game', function(done) {
			gameServer.createSoloGame(gameServer.players['player_one']);
			expect(gameServer.games).to.have.any.key('player_one');
			expect(gameServer.games['player_one']).to.have.property('gameType', 'solo');
			expect(gameServer.players['player_one']).to.have.property('game', gameServer.games['player_one']);
			done();
		});

		it('should remove the created singleplayer game', function(done) {
			gameServer.removeGame('player_one');
			expect(gameServer.games).to.not.have.key('player_one');
			done();
		});
	});

	describe('Other functions', function() {
		it('should get all the available games and update them once a game is created', function(done) {
			gameServer.createMultiplayerGame('MyGame', gameServer.players['player_one']);
			expect(gameServer.availableGames).to.have.property('MyGame');
			done();
		});
	})
});


