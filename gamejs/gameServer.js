var player = require('./player.js'); // Require player object
var game = require('./game.js'); // Require game object
var AI = require('./AI.js'); // require AI object

/**
 * Main server object: Responsible for all game and player management.
 * @class gameServer class
 */
function gameServer() {

	/**
	 * List of all the games
	 * @type {Object}
	 * @this {gameServer}
	 */
	this.games = {};

	/**
	 * Create multiplayer game
	 * @param  {String} gameName   Name of the game
	 * @param  {player} player_one Player who created the game
	 * @this {gameServer}
	 */
	this.createMultiplayerGame = function(gameName, player_one) {
		this.games[gameName] = new game(gameName, player_one);
		player_one.game = this.games[gameName];
		this.updateAvailableGames();
	};

	/**
	 * Player two joins a multiplayer game
	 * @param  {String} gameName   Name of thee game be joined	
	 * @param  {player} player_two Player who wishes to join the game
	 * @this {gameServer}
	 */
	this.joinMultiplayerGame = function(gameName, player_two) {
		player_two.game = this.games[gameName];
		this.games[gameName].player_two = player_two; 
		// Update available games
		this.updateAvailableGames();
	};

	/**
	 * Create a solo player game
	 * @param  {player} player_one Player object who will play the game
	 * @this {gameServer}
	 */
	this.createSoloGame = function(player) {
		var Game = new game(player.username, player);
		this.games[player.username] = Game;
		Game.gameType = 'solo'; // Set gameType to solo
		Game.player_two = new AI(Game);
		this.players[player.username].game = Game;
	};

	/**
	 * Remove all reference to that game
	 * @param  {String} gameName Name of the game to be removed
	 * @this {gameServer}
	 */
	this.removeGame = function(gameName) {
		delete this.games[gameName];
	};

	this.availableGames = {}

	/**
	 * Updates all available games by filtering the games object
	 * Be careful it returns a new type of dictionary with the name of the game and the player_one username
	 * @this {gameServer}
	 */
	this.updateAvailableGames = function() {
		newDict = {};
		for (var element in this.games) {
			if (this.games[element].isAvailable()) {
				newDict[element] = {
					'name': this.games[element].name,
					'player_one': this.games[element].player_one.username
				};
			}
		}
		this.availableGames = newDict;
	};

	/**
	 * Dictionary of all the active players of the game
	 * @type {Object}
	 * @this {gameServer}
	 */
	this.players = {};

	/**
	 * Add new player to players dictionary
	 * @param  {String} username Username of the player
	 * @this {gameServer}
	 */
	this.newPlayer = function(username) {
		this.players[username] = new player(username);
	};

	/**
	 * Remove player from players dictionary
	 * @param  {String} username Name of the player to be removed
	 * @this {gameServer}
	 */
	this.removePlayer = function(username) {
		delete this.players[username];
	};

	/**
	 * Checks if username already exists
	 * @param  {String} username username of the new player
	 * @return {Boolean}          true if already exists, false otherwise
	 */	
	this.usernameAlreadyExists = function(username) {
		if (this.players[username]) {
			return true;
		}
		return false;
	};

	/**
	 * checks if game name already exists
	 * @param  {String} gameName name of the new game
	 * @return {Boolean}          true if already exists, false otherwise
	 */
	this.gameNameAlreadyExists = function(gameName) {
		if (this.games[gameName]) {
			return true;
		}
		return false;
	}

	/**
	 * Send the correct route depending on the status of the user
	 * @param  {String} username username of the user
	 * @return {String}          correct route to be sent
	 */
	this.sendRoute = function(username) {
		// Check if player already has a username
		if (username) {
			// check if player is registered to a game
			if (this.players[username].game) {
				// If the player is connected to another user or is playing solo:
				if (!this.players[username].game.isAvailable() || this.players[username].game.gameType == 'solo') {
					// Check if boats are set
					if (this.players[username].battleship.areBoatsSet) {
						return '/game';
					}
					// If boats are not set
					else {
						return '/setBoats';
					}
				}
				// If the player has created a multiplayer game, but no one has joined
				else {
					return '/initialization'; 
				}
			}
			// If user already has a username
			else {
				return '/join'; 
			}
		}
		else {
			// If player does not yet have a username redirect to homepage
			return '/';
		}
	}
}

module.exports = gameServer;