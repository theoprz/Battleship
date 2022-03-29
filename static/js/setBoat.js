Vue.http.options.emulateJSON = true;

// Connect user with server using socket io
var socket = io.connect();

// Vue that holds the battleship grid and all the boats of our page
var boats = new Vue({

    // We want to target the div with an id of 'events'
    el: "#boats",

    data: {
        // Player battleship object (see battleship.js for more information)
        battleship: {grid: []},
        // String Array containing all the errors that have to be sent to the user
        errors: [],
    },

    // These functions are called only when the vue instance is created
    created: function() {
        // Get battleship data with grid and boats
        this.$http.get('/setBoats/getBoats').then(function(response) {
            console.log(response);
            this.battleship = response.body.battleship;
        }), function(response) {
            console.log(response);
        };

        // Initialize drag and drop 500 ms after page load (IMPORTANT for Firefox compatibility)
        $(document).ready(function() {
            window.setTimeout(boats.initializeDragAndDrop, 500);
        });

        socket.on('logout', function(response) {
            window.location.href = '/logout';
        });
    },

    methods: {
        // Rotate the boat on click
        rotate: function(boat_name) {
            // Check if boat is already set, if not the boat will reset to its original position
            if (this.battleship.boats[boat_name].isSet) {
                this.reset(boat_name);
                this.errors.push('Vous ne pouvez pas faire de rotation, le bateau est deja pose !');
            }
            else {

                $('#' + boat_name).toggleClass('rotated');

                var direction = this.battleship.boats[boat_name].direction;

                // Update direction according to the rotation
                if (direction == 'down') {
                    this.battleship.boats[boat_name].direction = 'right';
                }
                else {
                    this.battleship.boats[boat_name].direction = 'down';
                }
            }
        },

        // Reset the boat on its original position on click
        reset: function(boat_name) {
            var boat = $('#' + boat_name);
            boat.animate({
                "left": 0,
                "top": 0,
            });
            this.setBoatOffGrid(boat_name);
        },

        //Make the boats draggable
        makeDraggable: function() {
            $('.draggable').draggable({
                containment : 'document',
                snap: '.case',
                snapMode: 'inner',
                revert : 'invalid',
            });
        },

        //Make grid in body droppable
        makeDroppable: function() {
            $('body').droppable({

                // What to do after drop (on drop)
                drop: function(event, ui) {

                    // Get the draggable element (boat) position on the window (in pixels)
                    var pos_left = ui.offset.left;
                    // console.log(pos_left); // FOR DEBUG
                    var pos_top = ui.offset.top;
                    // console.log(pos_top); // FOR DEBUG

                    // Get the name of the boat that is being dragged
                    var boat_name = ui.draggable.attr('id');

                    // Set the direction of the boat
                    var direction = boats.battleship.boats[boat_name].direction;
                    // console.log(direction); // FOR DEBUG

                    // Check if boat was already set
                    if (boats.battleship.boats[boat_name].isSet) {
                        // Reset the boat coordinates on grid
                        boats.setBoatOffGrid(boat_name);
                    }

                    // Execute function to see if there are errors in boat position
                    var errors = boats.isBoatPositionNotValid(boat_name, pos_left, pos_top, direction);


                    if (errors) {
                        // Revert boat (move the boat back to its original position)
                        ui.draggable.draggable('option','revert', function(event, ui) {
                            $(this).data("uiDraggable").originalPosition = {
                                top: 0,
                                left: 0,
                            };
                            return true;
                        });
                        // Send specific errors to the user
                        boats.errors = errors;
                    }
                    else {
                        // Set the boat on the droppable element
                        ui.draggable.draggable('option','revert','invalid');

                        //Reset error messages
                        boats.errors = [];

                        // Set the boat on the grid
                        boats.setBoatOnGrid(boat_name);
                    }
                }
            });
        },

        //Initialize drag and drop
        initializeDragAndDrop: function() {
            this.makeDraggable();
            this.makeDroppable();
        },

        // match boat cell with grid cell and return grid coordinates
        findCase: function(left, top) {
            for (var i = 1; i <= this.battleship.grid.length; i++) { // IMPORTANT We need 11 values here ! If we reach the last value, it would mean that no cells matched coordinates
                var pos_top = $("#myGrid > .divTableBody > .divTableRow[value='" + i + "']").offset().top;
                if (pos_top == top) {
                    break;
                }
            }
            var k = Math.min(i, 10); // If there are no matches within the rows, set i back to 10 so that the rows don't return UNDEFINED
            for (var j = 1; j <= this.battleship.grid.length; j++) { // IMPORTANT We need 11 values here ! If we reach the last value, it would mean that no cells matched coordinates
                var pos_left = $("#myGrid > .divTableBody > .divTableRow[value='" + k + "'] > .divTableCell[value='" + j + "']").offset().left;
                //console.log(left, pos_left, top, pos_top); // FOR DEBUG ONLY
                if (pos_left == left) {
                    break;
                }
            }

            //console.log(String.fromCharCode(64 + j), i); // For DEBUG
            return [i-1, j-1]; // If j-1

        },

        /**
         * Check whether the boat's position is valid or not according to the rules of the game
         * @param  {String}  boat_name Name of the boat to be checked
         * @param  {Float}  left      Left coordinates
         * @param  {Float}  top       Top coordinates
         * @param  {String}  direction Direction of the boat: can be 'right' or 'down'
         * @return {Boolean}           Return errors array containing all error messages or false if there are no errors
         */
        isBoatPositionNotValid: function(boat_name, left, top, direction) {
            var errors = [];

            // Get our initial coordinates of the boat on the grid
            var coordinates = this.findCase(left, top);

            // Get the boat object in question
            var boat = this.battleship.boats[boat_name];
            //console.log('Boat coordinatesList: ' + this.battleship.boats[boat_name].coordinatesList); //FOR DEBUG

            // Set these coordinates in boat object
            this.setBoatPosition(boat_name, coordinates, direction);

            //Set all boat coordinates in the boat object
            this.setBoatCoordinatesList(boat_name);


            // console.log('Boat position: ' + boat.coordinates + ' ' + boat.direction); // FOR DEBUG
            // console.log('Boat coordinatesList: ' + boat.coordinatesList); // FOR DEBUG
            // Check if the boat is not in the grid and follows game rules
            for (var i = 0; i < boat.coordinatesList.length; i++) {
                // Check if the boat is not in the grid
                if (!this.isInGrid(boat.coordinatesList[i])) {
                    errors.push(boat.name + ' n\'est pas sur la grille !');
                    break;
                }
                // Check if the boat is following game rules (not boats must touch each other)
                if (!this.isZoneAvailable(boat.coordinatesList[i])) {
                    errors.push('Zone error, ' + boat.name + ' sera trop proche d\'un autre bateau !');
                    break;
                }
            }
            if (errors.length == 0) {
                return false;
            }
            return errors;
        },

        /**
         * Set position of the boat
         * @param {String} boat_name Boat name that has to be placed
         * @param {tuple} initial_coordinates Coordinates of the position of the first case
         * @param {string} direction can be 'right', 'down'
         */
        setBoatPosition: function(boat_name, initial_coordinates, direction) {
            this.battleship.boats[boat_name].coordinates = initial_coordinates;
            this.battleship.boats[boat_name].direction = direction;
        },

        /**
         * Set the coordinatesList equal to the position of the boat when a initial position and direction have been chosen
         * @param {String} boat_name Name of the boat whose coordinates have to be set
         */
        setBoatCoordinatesList: function(boat_name) {
            var boat = this.battleship.boats[boat_name];
            boat.coordinatesList[0] = boat.coordinates;
            switch (boat.direction) {
                case 'down':
                    for (var i = 0; i < boat.size; i++) {
                        boat.coordinatesList[i] = [boat.coordinates[0] + i, boat.coordinates[1]];
                    }
                    break;
                case 'right':
                    for (var i = 0; i < boat.size; i++) {
                        boat.coordinatesList[i] = [boat.coordinates[0], boat.coordinates[1] + i];
                    }
                    break;
            }
        },

        /**
         * Test to check wether these coordinates can be placed on the grid
         * @param  {tuple}  coordinates coordinates of the zone
         * @return {Boolean}
         */
        isInGrid: function(coordinates) {
            if (Math.min(9, Math.max(coordinates[0],0)) != coordinates[0] ) {
                return false;
            }
            if (Math.min(9, Math.max(coordinates[1],0)) != coordinates[1] ) {
                return false;
            }
            return true;
        },

        /**
         * Checks wether the zone is availbale in and around the zone
         * @param  {tuple}  coordinates Coordinates of the zone
         * @param  {Array}  currentGrid Player gris
         * @return {Boolean}             false or true
         */
        isZoneAvailable: function(coordinates) {
            var x = coordinates[0];
            var y = coordinates[1];

            for (var i = x-1; i <= x+1; i++) {
                for (var j = y-1; j <= y+1; j++) {
                    if (i>=0 && i<=9 && j>=0 && j<=9) {
                        if (this.battleship.grid[i][j] != 0) {
                            return false;
                        }
                    }
                }
            }
            return true;
        },

        /**
         * Set the boat on the battleship grid ... This will set the isSet variable of the boat to true !
         * @param {String} boat_name The name of the boat that will be set on the grid
         */
        setBoatOnGrid: function(boat_name) {
            var boat = this.battleship.boats[boat_name];
            for (var i = 0; i < boat.size; i++) {
                this.battleship.grid[boat.coordinatesList[i][0]][boat.coordinatesList[i][1]] = 1;
            }
            boat.isSet = true;
        },

        setBoatOffGrid: function(boat_name) {
            var boat = this.battleship.boats[boat_name];
            for (var i = 0; i < boat.size; i++) {
                this.battleship.grid[boat.coordinatesList[i][0]][boat.coordinatesList[i][1]] = 0;
            }
            boat.isSet = false;
        },

        areBoatsSet: function() {
            for (var boat in this.battleship.boats) {
                if (!this.battleship.boats[boat].isSet) {
                    return false;
                }
            }
            return true;
        },

        submitBoats: function(event) {
            // Check if all boats have been set before submitting
            if (!this.areBoatsSet()) {
                this.errors.push("Veuillez mettre tous les bateaux !");
            }

            // All boats habe been checked ! Submit to server
            else {
                console.log(this.battleship);
                this.$http.post('/setBoats/sendBoats', {boats: this.battleship.boats}).then(function(response) {
                    window.location.href = response.data.redirect;
                }), function(response) {
                    //If there is an error put it in the console
                    console.log(response);
                };
            }
        },

        randomSetAndSubmitBoats: function(event) {
            this.$http.post('/setBoats/sendBoats', {randomSet: true}).then(function(response) {
                window.location.href = response.data.redirect;
            }), function(response) {
                //If there is an error put it in the console
                console.log(response);
            };
        },
    },
});
