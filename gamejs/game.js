/**
 * Game object
 * @class Game class
 * @param  {string} name       Name of the game
 * @param  {player object} player_one Player who created the game
 */
function game(name, player_one) {

	/**
	 * Name of the game
	 * @type {string}
	 * @this {game}
	 */
	this.name = name;

	/**
	 * First player object
	 * @type {player}
	 * @this {game}
	 */
	this.player_one = player_one;

	/**
	 * Second player object
	 * @this {game}
	 * @type {player}
	 */
	this.player_two = null;

	/**
	 * Checks whether a game is available to join (for multiplayer ONLY)
	 * @return {Boolean} True if available, false otherwise
	 * @this {game}
	 */
	this.isAvailable = function() {
		return this.player_two == null && this.gameType == 'multi';
	};

	/**
	 * Typer of the game can be 'multi' or 'solo'
	 * @type {String}
	 */
	this.gameType  = 'multi'; 

};

module.exports = game;