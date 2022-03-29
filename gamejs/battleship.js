var Boat = require('./boat.js'); // Require boat object

/** @type {Object} Battleship class
* @class battleship class with one per player with all the grids and methods
* Contains all the different methods and variables for the battleship game
* @param {string} player Player name
*/
function battleship() {

	/** This is the main grid for the game
	* @this {battleship}
	* @return {array} [The array representing the grid]
	*/
	this.grid =  [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	];

	/**
	 * Second grid for attack management
	 * It will be entirely based on the second player or AI
	 * @type {Array}
	 */
	this.attack_grid = [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		];

	/** Function to determine wether a boat is on the desired coordinates
	* @this {battleship}
	* @param {integers} (x,y) Position coordinates
	* @return {boolean} true if the value is 1, or false
	*/
	this.checkPosition = function (x, y) {
		if (this.grid[x][y] == 1) {
			return true;
		}
		else {
			return false;
		}
	};

	/**
	 * Test wether the attack coordinates have been tested
	 * @param  {Integer} x x Axis coordinate
	 * @param  {Integer} y y Axis coordinate
	 * @return {Boolean}   true if were tested, false otherwise
	 * @this {battleship}
	 */
	this.areAttackCoordinatesTested = function(x,y) {
		if(this.attack_grid[x][y] == 0 || this.attack_grid[x][y] == 1) {
			return false;
		}
		return true;
	};

	/** Attack Enemy function: Will either hit or miss target. Changes the value of the enemy grid: 0 is water, 1 is boat, 2 is test but miss, 3 is test with a hit, 4 is sunk ...
	* @this {battleship}
	* @param {object} enemyPlayer player object of the opponent
	* @param {tuple} coordinates Attack coordinates
	*/
	this.attackEnemy = function(coordinates, enemyPlayer) {
		var x = coordinates[0];
		var y = coordinates[1];
		if (this.areAttackCoordinatesTested(x,y)) {
			console.log('Cette zone a deja ete touchee !!');
			return false;
		}
		if (enemyPlayer.battleship.checkPosition(x,y)) {
			enemyPlayer.battleship.grid[x][y] = 3;
			this.attack_grid[x][y] = 3;

			// Find the boat that has been hit
			var hitBoat = enemyPlayer.battleship.findHitBoat(x, y);
			// Sink the boat if it was completely destroyed
			enemyPlayer.battleship.sinkBoatIfDestroyed(hitBoat.name);
			this.sinkEnemyBoatIfDestroyed(hitBoat.name, enemyPlayer);
		}
		else {
			enemyPlayer.battleship.grid[x][y] = 2;
			this.attack_grid[x][y] = 2;
		}
	};

	/**
	 * Dictionnary with all the boats on this battleship player game
	 * @this {battleship}
	 * @type {dictionnary}
	 */
	this.boats = {
		'Contre-torpilleur': new Boat('contre-torpilleur', 5),
		'Porte-Avions': new Boat('Porte-Avions', 4),
		'Croiseur': new Boat('Croiseur', 3),
		'Sous-marin': new Boat('Sous-marin', 3),
		'Torpilleur': new Boat('Torpilleur', 2),
	};

	/**
	 * Check if all boats are destroyed
	 * @return {Boolean} true if destroyed, false otherwise
	 */
	this.isFleetDestroyed = function() {
		flag = true;
		for (boat in this.boats) {
			if (!this.boats[boat].isSunk) {
				flag = false;
			}
		}
		return flag;
	}

	/**
	 * Are boats set or not on the grid
	 * @type {Boolean}
	 * @this {battleshîp}
	 * @default false
	 */
	this.areBoatsSet = false;

	/**
	 * Checks wether it is the player's turn
	 * @type {Boolean}
	 * @default false
	 */
	this.isTurn = false;

	/**
	 * Checks if boat position is valid before setting the boat
	 * @param {String} boat_name name of the boat
	 * @return {errors} false if no errors, errors if errors
	 */
	this.positionIsNotValid = function(boat_name) {
		var boat = this.boats[boat_name];
		var errors = [];
		for (var i = 0; i < boat.coordinatesList.length; i++) {
			if (!this.isInGrid(boat.coordinatesList[i])) {
				errors.push(boat.name + ' n est pas parfaitement sur la grille !')
			}
			if (!isZoneAvailable(boat.coordinatesList[i], this.grid)) {
				errors.push('Zone error, ' + boat.name + ' sera trop proche d un autre bateau!')
			}
		}
		if (errors.length == 0) {
			return false;
		}
		return errors;
	};

	/**
	 * Sets boat on grid
	 * @param {String} boat Boat name
	 * @this {battleship}
	 */
	this.setBoat = function (boat_name) {
		// This function should not be called if no tests have been made before !
		if (this.positionIsNotValid(boat_name)) {
			throw new Error({message: 'Position is not valid'});
		}

        var boat = this.boats[boat_name];
        for (var i = 0; i < boat.size; i++) {
            this.grid[boat.coordinatesList[i][0]][boat.coordinatesList[i][1]] = 1;
        }
        boat.isSet = true;
	};


	/**
	 * Random position generator for boats
	 */
	this.randomSetBoats = function () {
		for (var boat in this.boats) {
			while (!this.boats[boat].isSet) {
				var i = Math.floor(Math.random() * 10); // random int [0..9]
				var j = Math.floor(Math.random() * 10); // random int [0..9]
				var rnd = Math.floor(Math.random() + 0.5); // random boolean
				var dir = "down".repeat(rnd) + "right".repeat(1-rnd);
				this.boats[boat].setPosition([i, j], dir);
				this.boats[boat].setCoordinatesList();
				if (!this.positionIsNotValid(boat)) {
					this.setBoat(boat);
				}
			}
		}
	}

	/**
	 * Find the boat that has been hit
	 * @param  {x} x x axis coordiantes
	 * @param  {y} y y axis coordinate
	 * @return {boat}   boat that has been hit
	 */
	this.findHitBoat = function(x, y) {
		for (boat in this.boats) {
			for (coordinates of this.boats[boat].coordinatesList) {
				if (coordinates[0] == x && coordinates[1] == y) {
					return this.boats[boat];
				}
			}
		}
	};

	/**
	 * Sink the boat if it has been completely destroyed (on last hit)
	 * @param  {String} boat_name name of the boat to be sunk
	 * @this {battleship}
	 */
	this.sinkBoatIfDestroyed = function(boat_name) {
		var flag = true;
		for (coordinates of this.boats[boat_name].coordinatesList) {
			var x = coordinates[0];
			var y = coordinates[1];
			if (this.grid[x][y] != 3) {
				flag = false;
				break;
			}
		}
		if (flag) {
			// Sink the boat !!
			this.boats[boat_name].sink();
			for (coordinates of this.boats[boat_name].coordinatesList) {
				var x = coordinates[0];
				var y = coordinates[1];
				this.grid[x][y] = 4;
			}
		}
	};

	/**
	 * Updates the battleship object attack_grid if the enemy boat has been destroyed
	 * @param  {string} boat_name   name of the enemy boat
	 * @param  {player} enemyPlayer player objetc
	 */
	this.sinkEnemyBoatIfDestroyed = function(boat_name, enemyPlayer) {
		if (enemyPlayer.battleship.boats[boat_name].isSunk) {
			for (coordinates of enemyPlayer.battleship.boats[boat_name].coordinatesList) {
				var x = coordinates[0];
				var y = coordinates[1];
				this.attack_grid[x][y] = 4;
			}
		}
	}

	/**
	 * Test to check wether these coordinates can be placed on the grid
	 * @param  {tuple}  coordinates coordinates of the zone
	 * @return {Boolean}
	 */
	this.isInGrid = function(coordinates) {
		if (Math.min(9, Math.max(coordinates[0],0)) != coordinates[0] ) {
	        return false;
	    }
	    if (Math.min(9, Math.max(coordinates[1],0)) != coordinates[1] ) {
	        return false;
	    }
	    return true;
	};
};

/**
 * Checks wether the zone is availbale in and around the zone
 * @param  {tuple}  coordinates Coordinates of the zone
 * @param  {Array}  currentGrid Player gris
 * @return {Boolean}             false or true
 */
function isZoneAvailable(coordinates, currentGrid) {
	var x = coordinates[0];
	var y = coordinates[1];

	for (var i = x-1; i <= x+1; i++) {
		for (var j = y-1; j <= y+1; j++) {
			if (i>=0 && i<=9 && j>=0 && j<=9) {
				if (currentGrid[i][j] != 0) {
					return false;
				}
			}
		}
	}
	return true;
};



module.exports = battleship;
