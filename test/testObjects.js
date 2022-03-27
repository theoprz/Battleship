var battleship = require('../gamejs/battleship.js')

// Create two battleship classes
var battleshipOne = new battleship();
var battleshipTwo = new battleship();

/************************************ Test objects for the battleship game *****************************/

// Player one
var carrier = {
	coordinates: [0,0],
	direction: 'right',
	isSet: true,
};

var battleship = {
	coordinates: [2,0],
	direction: 'right',
	isSet: true,
};

var cruiser = {
	coordinates: [4,0],
	direction: 'right',
	isSet: true,
};

var submarine = {
	coordinates: [6,0],
	direction: 'down',
	isSet: true,
};

var destroyer = {
	coordinates: [6,2],
	direction: 'down',
	isSet: true,
}

var boatsPlayerOne = {
	carrier: carrier,
	battleship: battleship,
	cruiser: cruiser,
	submarine: submarine,
	destroyer: destroyer,
}

//Player two
var carrier = {
	coordinates: [0,5],
	direction: 'right',
	isSet: true,
};

var battleship = {
	coordinates: [2,6],
	direction: 'right',
	isSet: true,
};

var cruiser = {
	coordinates: [4,7],
	direction: 'right',
	isSet: true,
};

var submarine = {
	coordinates: [6,9],
	direction: 'down',
	isSet: true,
};

var destroyer = {
	coordinates: [6,7],
	direction: 'down',
	isSet: true,
}

var boatsPlayerTwo = {
	carrier: carrier,
	battleship: battleship,
	cruiser: cruiser,
	submarine: submarine,
	destroyer: destroyer,
}

// Register the boats in the battleships
for (boat in boatsPlayerOne) {
	battleshipOne.boats[boat].setPosition(boatsPlayerOne[boat].coordinates, boatsPlayerOne[boat].direction);
	battleshipOne.boats[boat].setCoordinatesList();
}
for (boat in boatsPlayerTwo) {
	battleshipTwo.boats[boat].setPosition(boatsPlayerOne[boat].coordinates, boatsPlayerOne[boat].direction);
	battleshipTwo.boats[boat].setCoordinatesList();
}

module.exports = {boatsPlayerOne: boatsPlayerOne, boatsPlayerTwo: boatsPlayerTwo, battleshipOne: battleshipOne, battleshipTwo: battleshipTwo};
