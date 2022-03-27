"use strict"

var chai = require('chai');
var expect = require('chai').expect;
var battleship = require('../gamejs/battleship.js');

// Import battleshîp object
var battleshipOne = require('./testObjects.js').battleshipOne;
var battleshipTwo = require('./testObjects.js').battleshipTwo;

// Modelize two players
var playerOne = {
	battleship: battleshipOne,
}
var playerTwo = {
	battleship: battleshipTwo,
}


describe('Battleship tests', function() {
	describe('Set boats tests', function() {
		it('should set the carrier on battleship one', function(done) {
			expect(battleshipOne.boats['carrier']).to.have.property('isSet', false);
			battleshipOne.setBoat('carrier');
			expect(battleshipOne.grid[0][0]).to.equal(1);
			expect(battleshipOne.grid[0][1]).to.equal(1);
			expect(battleshipOne.grid[0][2]).to.equal(1);
			expect(battleshipOne.grid[0][3]).to.equal(1);
			expect(battleshipOne.grid[0][4]).to.equal(1);
			expect(battleshipOne.boats['carrier']).to.have.property('isSet', true);
			done();
		});

		it('should set the battleship on battleship one', function(done) {
			expect(battleshipOne.boats['battleship']).to.have.property('isSet', false);
			battleshipOne.setBoat('battleship');
			expect(battleshipOne.grid[2][0]).to.equal(1);
			expect(battleshipOne.grid[2][1]).to.equal(1);
			expect(battleshipOne.grid[2][2]).to.equal(1);
			expect(battleshipOne.grid[2][3]).to.equal(1);
			expect(battleshipOne.boats['battleship']).to.have.property('isSet', true);
			done();
		});

		it('should set the destroyer on battleship one', function(done) {
			expect(battleshipOne.boats['destroyer']).to.have.property('isSet', false);
			battleshipOne.setBoat('destroyer');
			expect(battleshipOne.grid[6][2]).to.equal(1);
			expect(battleshipOne.grid[7][2]).to.equal(1);
			expect(battleshipOne.boats['destroyer']).to.have.property('isSet', true);
			done();
		});	
		// Set the remaining boats
		battleshipOne.setBoat('submarine');
		battleshipOne.setBoat('cruiser');

		for (boat in battleshipTwo.boats) {
			battleshipTwo.boats[boat].setCoordinatesList();
		}

	});

	describe('Attack tests', function() {
		it('should attack player one carrier', function(done) {
			expect(battleshipOne.grid[0][0]).to.equal(1);
			expect(battleshipTwo.attack_grid[0][0]).to.equal(0);
			expect(battleshipTwo.grid[0][0]).to.equal(0);
			playerTwo.battleship.attackEnemy([0,0], playerOne);
			expect(battleshipOne.grid[0][0]).to.equal(3);
			expect(battleshipTwo.attack_grid[0][0]).to.equal(3);
			done();
		});	

		it('should attack player two with a miss', function(done) {
			expect(battleshipTwo.grid[5][5]).to.equal(0);
			expect(battleshipOne.attack_grid[5][5]).to.equal(0);
			expect(battleshipTwo.grid[5][5]).to.equal(0);
			playerOne.battleship.attackEnemy([5,5], playerTwo);
			expect(battleshipTwo.grid[5][5]).to.equal(2);
			expect(battleshipOne.attack_grid[5][5]).to.equal(2);
			done();
		});	

		it('should sink player one carrier', function(done) {
			expect(battleshipOne.grid[0][1]).to.equal(1);
			expect(battleshipTwo.attack_grid[0][1]).to.equal(0);
			expect(battleshipTwo.grid[0][1]).to.equal(0);
			playerTwo.battleship.attackEnemy([0,1], playerOne);
			playerTwo.battleship.attackEnemy([0,2], playerOne);
			playerTwo.battleship.attackEnemy([0,3], playerOne);
			playerTwo.battleship.attackEnemy([0,4], playerOne);
			expect(battleshipOne.grid[0][0]).to.equal(4);
			expect(battleshipTwo.attack_grid[0][0]).to.equal(4);
			expect(battleshipOne.grid[0][4]).to.equal(4);
			expect(battleshipTwo.attack_grid[0][4]).to.equal(4);
			done();
		});	
	});
});