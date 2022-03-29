var battleship = require('./battleship.js');


function AI(game) {

	/**
	 * Game in which the AI is
	 * @type {game}
	 * @this {AI}
	 */
	this.game = game;

	/**
	 * AI Battleship object
	 * @type {battleship}
	 * @this {AI}
	 */
	this.battleship = new battleship();

	/**
	 * Array of all possible attack coordinates for the AI. The AI will generate random coordinates in that array which will then be reevaluated.
	 * The array will decrease in size as the number of possibilities for the AI will go down.
	 * @type {battleship}
	 * @this {AI}
	 */
	this.possibleCoordinatesArray = createArray(10);

	/**
	 * Array that will be populated if there is a hit. If there is a hit, the AI will randomly choose coordinates within that new array
	 * because it will hold the possible coordinates of the boat which is being attacked. Once the boat is sunk, the array
	 * will be empty again and the Ai will choose coordinates in the possibleCoordinatesArray.
	 * @type {Array}
	 * @this {AI}
	 */
	this.possibleCoordinatesSubArray = [];

	/**
	 * Once a boat is hit by the AI, the hit coordinates has to be filled with the enemy boat coordinates tthat has been hit
	 * @type {Array}
	 */
	this.hitCoordinates = [];

	/**
	 * Guess randomly some coordinates that are within the possibleCoordinatesArray if no boats have been previously hit or that
	 * are within the possibleCoordinatesSubArray if an enemy boat has been previously hit
	 * @return {array} attack coordinates
	 */
	this.guessCoordinates = function() {
		var array = this.possibleCoordinatesArray;
		var subArray = this.possibleCoordinatesSubArray;

		// If the possibleCoordinatesArray is empty
		if (subArray.length == 0) {
			// Choose a random value for the coordinates
			var coordinates = array[Math.floor(Math.random() * array.length)];

		}

		//If the possibleCoordinatesArray is not empty
		else {
			// Choose a random value for the coordinates in the sub array
			var coordinates = subArray[Math.floor(Math.random() * subArray.length)];

		}
		
		return coordinates;
	};

	/**
	 * Evaluate the possibleCoordinatesArray once the AI has tested some coordinates (these coordinates have to be removed from the
	 * possibleCoordinatesArray)
	 * @param  {array} coordinatesList  All the coordinates where no enemy boat can be !
	 */
	this.evaluateArray = function(coordinatesList, enemyPlayer) {
		for (coordinates of coordinatesList) {
			var index = this.findIndexOf(coordinates);
			if (index) {
				this.possibleCoordinatesArray.splice(index, 1);
			}
		}

		// Update all possibilities

		var minLength = this.findSmallestEnemyBoatSize(enemyPlayer);
		console.log('minLength');
		console.log(minLength);
		for (var i = 0; i < this.possibleCoordinatesArray.length; i++) {

			// Check horizontal direction and vertical direction
			var horizontal = this.checkBoatPossibilityHorizontal(this.possibleCoordinatesArray[i], minLength);
			var vertical = this.checkBoatPossibilityVertical(this.possibleCoordinatesArray[i], minLength);
			var counter = Math.max(horizontal, vertical);
			if (counter < minLength) {
				console.log(vertical);
				console.log(horizontal);
				console.log(this.possibleCoordinatesArray[i]);
				this.possibleCoordinatesArray.splice(i, 1);
				console.log(counter);
			}
		}
	};

	/**
	 * Sends the size of the boat that can be set on those coordinates horizontally
	 * @param  {array} coordinates coordinates
	 * @return {integer} maximum size of the booat that can be set
	 */
	this.checkBoatPossibilityHorizontal = function(coordinates) {
		var col = 1;
		var plus = 1;
		while (this.battleship.isInGrid([coordinates[0], coordinates[1]+col]) && this.battleship.attack_grid[coordinates[0]][coordinates[1] + col] == 0) {
			plus++;
			col++;
		}
		col = 1;
		var minus = 0;
		while (this.battleship.isInGrid([coordinates[0], coordinates[1]-col]) && this.battleship.attack_grid[coordinates[0]][coordinates[1] - col] == 0) {
			minus++;
			col++;
		}
		var result = plus + minus;
		return result;
	}

	/**
	 * Sends the size of the boat that can be set on those coordinates vertically
	 * @param  {array} coordinates coordinates
	 * @return {integer} maximum size of the booat that can be set
	 */
	this.checkBoatPossibilityVertical = function(coordinates) {
		var x = coordinates[0];
		var y = coordinates[1];
		var plus = 1;
		var row = 1;
		while (this.battleship.isInGrid([coordinates[0]+row, coordinates[1]]) && this.battleship.attack_grid[coordinates[0] + row][coordinates[1]] == 0) {
			plus++;
			row++;
		}
		row = 1;
		var minus = 0;
		while (this.battleship.isInGrid([coordinates[0]-row, coordinates[1]]) && this.battleship.attack_grid[coordinates[0] - row][coordinates[1]] == 0) {
			minus++;
			row++;
		}
		var result =  plus + minus;
		return result;
	}

	/**
	 * Evaluate Sub Array: Evaluates the possibleCoordinatesSubArray according to the hitCoordinates ... If the hitCoordinates
	 * array is not empty, populate the sub array with all the possibilities where the rest of enemy boat can be
	 */
	this.evaluateSubArray = function() {
		// Reset the sub array first
		this.possibleCoordinatesSubArray = [];
		// If there is only one element, we need to check (attack) all the cells around the coordinates !
		if (this.hitCoordinates.length == 1) {
			var coordinates = this.hitCoordinates[0];
			var row = coordinates[0];
			var col = coordinates[1];
			for (i = row-1; i <= row+1; i++) {
				if (this.battleship.isInGrid([i, col])) {
					if (this.battleship.attack_grid[i][col] == 0 && [i, col] != [row, col]) {
						this.possibleCoordinatesSubArray.push([i,col]);
					}
				}
			}
			for (j=col-1; j<=col+1; j++) {
				var array = [];
				if (this.battleship.isInGrid([row, j])) {
					if (this.battleship.attack_grid[row][j] == 0 && [row, j] != [row, col]) {
						this.possibleCoordinatesSubArray.push([row,j]);
					}
				}
			}
		}

		// If there is more than one element, there are at maximum two possibilities because we have a direction !
		else if (this.hitCoordinates.length > 1 ) {
			// Get the direction of the boat
			var row = this.hitCoordinates[0][0];
			if (this.hitCoordinates[1][0] == row) {
				// The direction of the enemy boat is horizontal
				// Order the hitCoordinates by row
				this.hitCoordinates.sort(function(a,b) {return a[1] - b[1]});
				var x = this.hitCoordinates[0][0];
				var y = this.hitCoordinates[0][1];
				if (this.battleship.isInGrid([x, y-1]) && this.battleship.attack_grid[x][y-1] == 0) {
					this.possibleCoordinatesSubArray.push([x, y-1]);
				}
				// The direction of the enemy boat is vertical
				var length = this.hitCoordinates.length;
				x = this.hitCoordinates[length-1][0];
				y = this.hitCoordinates[length-1][1];
				if (this.battleship.isInGrid([x, y+1]) && this.battleship.attack_grid[x][y+1] == 0) {
					this.possibleCoordinatesSubArray.push([x, y+1]);
				}
			}
			else {
				// The direction of the enemy boat is vertical
				// Order the hitCoordinates by row
				this.hitCoordinates.sort(function(a,b) {return a[0] - b[0]});
				var x = this.hitCoordinates[0][0];
				var y = this.hitCoordinates[0][1];
				if (this.battleship.isInGrid([x-1, y]) && this.battleship.attack_grid[x-1][y] == 0) {
					this.possibleCoordinatesSubArray.push([x-1, y]);
				}
				// The direction of the enemy boat is vertical
				var length = this.hitCoordinates.length;
				x = this.hitCoordinates[length-1][0];
				y = this.hitCoordinates[length-1][1];
				if (this.battleship.isInGrid([x+1, y]) && this.battleship.attack_grid[x+1][y] == 0) {
					this.possibleCoordinatesSubArray.push([x+1, y]);
				}
			}
		}
	};

	/**
	 * Attacks the enemy player battleship while reevalutaing the hitCoordinates, the possibleCoordinatesArray and possibleCoordinatesSubArray
	 * @param  {array} attack_coordinates coordinates that were guessed bu the AI
	 * @param  {player} enemyPlayer        enemy player object
	 */
	this.attackEnemy = function(attack_coordinates, enemyPlayer) {
		var x = attack_coordinates[0];
		var y = attack_coordinates[1];

		

		// Check if there is a hit
		if (enemyPlayer.battleship.checkPosition(x,y)) {
			this.hitCoordinates.push([x,y]);

			// Send attack to the player
			this.battleship.attackEnemy(attack_coordinates, enemyPlayer);

			var hitBoat = enemyPlayer.battleship.findHitBoat(x,y);
			if(hitBoat.isSunk) {
				var first = hitBoat.coordinatesList[0];
				var last = hitBoat.coordinatesList[hitBoat.coordinatesList.length-1];
				if (hitBoat.direction == 'right') {

					if (this.battleship.isInGrid([first[0], first[1] - 1])) {
						this.hitCoordinates.push([first[0], first[1] - 1]);
					}
					if (this.battleship.isInGrid([last[0], last[1] + 1])) {
						this.hitCoordinates.push([last[0], last[1] + 1]);
					}
					for (coordinates of hitBoat.coordinatesList) {
						if (this.battleship.isInGrid([coordinates[0] + 1, coordinates[1]])) {
							this.hitCoordinates.push([coordinates[0] + 1, coordinates[1]]);
						}
						if (this.battleship.isInGrid([coordinates[0] - 1, coordinates[1]])) {
							this.hitCoordinates.push([coordinates[0] - 1, coordinates[1]]);
						}
					}
				}
				if (hitBoat.direction == 'down') {
					if (this.battleship.isInGrid([first[0] - 1, first[1]])) {
						this.hitCoordinates.push([first[0] - 1, first[1]]);
					}
					if (this.battleship.isInGrid([last[0] + 1, last[1]])) {
						this.hitCoordinates.push([last[0] + 1, last[1]]);
					}
					for (coordinates of hitBoat.coordinatesList) {
						if (this.battleship.isInGrid([coordinates[0], coordinates[1] + 1])) {
							this.hitCoordinates.push([coordinates[0], coordinates[1] + 1]);
						}
						if (this.battleship.isInGrid([coordinates[0], coordinates[1] - 1])) {
							this.hitCoordinates.push([coordinates[0], coordinates[1] - 1]);
						}
					}
				}
				this.evaluateArray(this.hitCoordinates, enemyPlayer);

				// Reinitialize hit coordinates
				this.hitCoordinates = [];
			}
		}

		// If no boats hit, evaluate the new array 
		else {
			// Send attack to the player
			this.battleship.attackEnemy(attack_coordinates, enemyPlayer);
			this.evaluateArray([[x,y]], enemyPlayer);
		}

		this.evaluateSubArray();
	};

	/**
	 * Finds the index of some coordinates within the possibleCoordinatesArray
	 * @param  {array} coordinates 
	 * @return {integer}             index of the entered coordinates
	 */
	this.findIndexOf = function(coordinates) {
		for (var i = 0; i < this.possibleCoordinatesArray.length; i++) {
			if (coordinates[0] == this.possibleCoordinatesArray[i][0] &&  coordinates[1] == this.possibleCoordinatesArray[i][1]) {
				return i;
			}
		}
	}


	/**
	 * Returns the smallest size of the enemy boats which is not yet destroyed
	 * @param  {[type]} enemyPlayer [description]
	 * @return {[type]}             [description]
	 */
	this.findSmallestEnemyBoatSize = function(enemyPlayer) {
		var minLength = 5;
		for (boat in enemyPlayer.battleship.boats) {
			// If the boat size is smaller than minLength and boat is not sunk
			if (enemyPlayer.battleship.boats[boat].size < minLength && !enemyPlayer.battleship.boats[boat].isSunk) {
				minLength = enemyPlayer.battleship.boats[boat].size;
			}
		}
		return minLength;
	}
}

module.exports = AI;

/**
 * Simple array creation with array values corresponding to the position of the value within the array
 * @param  {integer} n size of the matrix
 * @return {array}  
 */
function createArray(n) {
	var array = [];
	for (i=0; i < n; i++) {
		for (j=0; j < n; j++) {
			array.push([i,j]);
		}
	}
	return array;
};