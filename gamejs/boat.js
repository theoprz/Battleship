/**
 * Boat Object
 * @class Boat class
 * @param  {string} name  Name of the boat category
 * @param  {integer} size Number of spaces occupied (size of the boat)
 */
function boat (name, size) {
	/**
	 * Name of the boat
	 * @type {string}
	 * @this {boat}
	 */
	this.name = name;

	/**
	 * Size of the boat
	 * @this {boat}
	 * @type {Integer}
	 */
	this.size = size;

	/**
	 * Tells wether the boat is sunk or not
	 * @type {Boolean}
	 * @default false
	 * @this {boat}
	 */
	this.isSunk = false;

	/**
	 * Sinks a ship
	 * @this {boat}
	 */
	this.sink = function() {
		this.isSunk = true;
	}

	/**
	 * Placement direction on the grid ('right', 'down')
	 * @type {String}
	 * @default 'right'
	 * @this {boat}
	 */
	this.direction = 'right';

	/**
	 * Coordinates of the first case
	 * @type {tuple}
	 * @default (0,0)
	 * @this {boat}
	 */
	this.coordinates = [0,0];

	/**
	 * Checks wether a boat has been set on the grid or not
	 * @type {Boolean}
	 * @this {boat}
	 * @default false
	 */
	this.isSet = false;

	/**
	 * Set position of the boat
	 * @param {tuple} initial_coordinates Coordinates of the position of the first case
	 * @param {string} direction can be 'right', 'down'
	 * @this {boat}
	 */
	this.setPosition = function (initial_coordinates, direction) {
		this.coordinates = initial_coordinates;
		this.direction = direction;
	};

	/**
	 * List of the grid coordiantes of the boat
	 * @type {Array}
	 * @default (0,0, ... 0)
	 * @this {boat}
	 */
	this.coordinatesList = new Array(this.size).fill([0,0]);

	/**
	 * Set the coordinatesList equal to the position of the boat when a initial positio and direction have been chosen
	 * @this {boat}
	 */
	this.setCoordinatesList = function() {
        this.coordinatesList[0] = this.coordinates;
        switch (this.direction) {
            case 'down':
                for (var i = 0; i < this.size; i++) {
                    this.coordinatesList[i] = [this.coordinates[0] + i, this.coordinates[1]];
                }
                break;
            case 'right':
                for (var i = 0; i < this.size; i++) {
                    this.coordinatesList[i] = [this.coordinates[0], this.coordinates[1] + i];
                }
                break;
        }
	};

};

module.exports = boat;