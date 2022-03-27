"use strict"

var chai = require('chai');
var expect = require('chai').expect;
var Boat = require('../gamejs/boat.js');

var boatsPlayerOne = require('./testObjects.js').boatsPlayerOne;
var boatsPlayerTwo = require('./testObjects.js').boatsPlayerTwo;

var carrier = new Boat('carrier', 5);

describe('Boat object tests', function() {
	it('should create the carrier boat', function(done) {
		carrier.setPosition(boatsPlayerOne['carrier'].coordinates, boatsPlayerOne['carrier'].direction);
		expect(carrier).to.have.property('coordinates', boatsPlayerOne['carrier'].coordinates);
		expect(carrier).to.have.property('direction', boatsPlayerOne['carrier'].direction);
		done();
	});

	it('should set the coordinates list of the carrier boat', function(done) {
		carrier.setCoordinatesList();
		expect(carrier.coordinates).to.be.an('array');
		expect(carrier.coordinatesList[0]).to.eql([0,0]);
		expect(carrier.coordinatesList[1]).to.eql([0,1]);
		expect(carrier.coordinatesList[1]).to.eql([0,1]);
		expect(carrier.coordinatesList[2]).to.eql([0,2]);
		expect(carrier.coordinatesList[3]).to.eql([0,3]);
		expect(carrier.coordinatesList[4]).to.eql([0,4]);
		done();
	});
});