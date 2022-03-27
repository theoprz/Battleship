var battleship = require('./battleship.js');

/**
 * Player object
 * @param  {string} username username
 * @class player object
 */
function player(username) {

	/**
	 * username
	 * @type {String}
	 * @this {player}
	 */
	this.username = username;

	/**
	 * Battleship object for the player
	 * @type {battleship}
	 */
	this.battleship = new battleship();

	/**
	 * Game object that the user is playing 
	 * @type {game}
	 * @this {player}
	 */
	this.game = null;

	/**
	 * Is it the turn of the user ?
	 * @type {Boolean}
	 * @this {player}
	 */
	this.isTurn = false;

	/**
	 * Socket ID of the user (necessary for socket communication)
	 * @type {ObjectID}
	 * @this {player}
	 */
	this.socketId = null;

	/**
	 * Save socket Id in the player object
	 * @param  {ObjectID} socketId Socket ID of the connected player
	 * @this {player}
	 */
	this.saveSocketId = function(socketId) {
		this.socketId = socketId;
	};

	/**
	 * Join game function (a user who did not create a game must join)
	 * @param  {game} game game that has already been created
	 * @this {player}
	 */	
	this.joinGame = function(game) {
		this.game = game;
		this.game.player_two = this.username;
	};

};

module.exports = player; 