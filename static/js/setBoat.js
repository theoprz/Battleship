Vue.http.options.emulateJSON = true;

let socket = io.connect();

let boats = new Vue({

    el: "#boats",

    data: {
        battleship: {grid: []},
        errors: [],
    },

    created: function () {
        this.$http.get('/setBoats/getBoats').then(function (response) {
            console.log(response);
            this.battleship = response.body.battleship;
        }), function (response) {
            console.log(response);
        };
        $(document).ready(function () {
            window.setTimeout(boats.initializeDragAndDrop, 500);
        });

        socket.on('logout', function (response) {
            window.location.href = '/logout';
        });
    },

    methods: {
        rotate: function (boat_name) {
            if (this.battleship.boats[boat_name].isSet) {
                this.reset(boat_name);
                this.errors.push('Vous ne pouvez pas faire de rotations si le bateau est deja posé !');
            } else {

                $('#' + boat_name).toggleClass(' a été tourné');

                let direction = this.battleship.boats[boat_name].direction;

                if (direction == 'down') {
                    this.battleship.boats[boat_name].direction = 'right';
                } else {
                    this.battleship.boats[boat_name].direction = 'down';
                }
            }
        },

        reset: function (boat_name) {
            let boat = $('#' + boat_name);
            boat.animate({
                "left": 0,
                "top": 0,
            });
            this.setBoatOffGrid(boat_name);
        },

        makeDraggable: function () {
            $('.draggable').draggable({
                containment: 'document',
                snap: '.case',
                snapMode: 'inner',
                revert: 'invalid',
            });
        },

        makeDroppable: function () {
            $('body').droppable({
                drop: function (event, ui) {
                    let pos_left = ui.offset.left;
                    let pos_top = ui.offset.top;

                    let boat_name = ui.draggable.attr('id');

                    let direction = boats.battleship.boats[boat_name].direction;

                    if (boats.battleship.boats[boat_name].isSet) {

                        boats.setBoatOffGrid(boat_name);
                    }

                    let errors = boats.isBoatPositionNotValid(boat_name, pos_left, pos_top, direction);


                    if (errors) {
                        ui.draggable.draggable('option', 'revert', function (event, ui) {
                            $(this).data("uiDraggable").originalPosition = {
                                top: 0,
                                left: 0,
                            };
                            return true;
                        });
                        boats.errors = errors;
                    } else {
                        ui.draggable.draggable('option', 'revert', 'invalid');

                        boats.errors = [];

                        boats.setBoatOnGrid(boat_name);
                    }
                }
            });
        },

        initializeDragAndDrop: function () {
            this.makeDraggable();
            this.makeDroppable();
        },

        findCase: function (left, top) {
            for (let i = 1; i <= this.battleship.grid.length; i++) {
                let pos_top = $("#myGrid > .divTableBody > .divTableRow[value='" + i + "']").offset().top;
                if (pos_top === top) {
                    break;
                }
            }
            let k = Math.min(i, 10);
            for (let j = 1; j <= this.battleship.grid.length; j++) {
                let pos_left = $("#myGrid > .divTableBody > .divTableRow[value='" + k + "'] > .divTableCell[value='" + j + "']").offset().left;
                if (pos_left === left) {
                    break;
                }
            }
            return [i - 1, j - 1];
        },

        /**
         * @param  {String}  boat_name
         * @param  {Float}  left
         * @param  {Float}  top
         * @param  {String}  direction
         * @return {Boolean}
         */
        isBoatPositionNotValid: function (boat_name, left, top, direction) {
            let errors = [];

            let coordinates = this.findCase(left, top);

            let boat = this.battleship.boats[boat_name];

            this.setBoatPosition(boat_name, coordinates, direction);

            this.setBoatCoordinatesList(boat_name);



            for (let i = 0; i < boat.coordinatesList.length; i++) {
                if (!this.isInGrid(boat.coordinatesList[i])) {
                    errors.push(boat.name + ' n\'est pas totalement dans la grille !');
                    break;
                }
                if (!this.isZoneAvailable(boat.coordinatesList[i])) {
                    errors.push('Problème dans la zone, le ' + boat.name + ' sera trop proche d\'un autre bateau !');
                    break;
                }
            }
            if (errors.length === 0) {
                return false;
            }
            return errors;
        },

        /**
         * @param {String} boat_name
         * @param {tuple} initial_coordinates
         * @param {string} direction
         */
        setBoatPosition: function (boat_name, initial_coordinates, direction) {
            this.battleship.boats[boat_name].coordinates = initial_coordinates;
            this.battleship.boats[boat_name].direction = direction;
        },

        /**
         * @param {String} boat_name
         */
        setBoatCoordinatesList: function (boat_name) {
            let boat = this.battleship.boats[boat_name];
            boat.coordinatesList[0] = boat.coordinates;
            switch (boat.direction) {
                case 'down':
                    for (let i = 0; i < boat.size; i++) {
                        boat.coordinatesList[i] = [boat.coordinates[0] + i, boat.coordinates[1]];
                    }
                    break;
                case 'right':
                    for (let i = 0; i < boat.size; i++) {
                        boat.coordinatesList[i] = [boat.coordinates[0], boat.coordinates[1] + i];
                    }
                    break;
            }
        },

        /**
         * @param  {tuple}  coordinates
         * @return {Boolean}
         */
        isInGrid: function (coordinates) {
            if (Math.min(9, Math.max(coordinates[0], 0)) != coordinates[0]) {
                return false;
            }
            if (Math.min(9, Math.max(coordinates[1], 0)) != coordinates[1]) {
                return false;
            }
            return true;
        },

        /**
         * @param  {tuple}  coordinates
         * @param  {Array}  currentGrid
         * @return {Boolean}
         */
        isZoneAvailable: function (coordinates) {
            let x = coordinates[0];
            let y = coordinates[1];

            for (let i = x - 1; i <= x + 1; i++) {
                for (let j = y - 1; j <= y + 1; j++) {
                    if (i >= 0 && i <= 9 && j >= 0 && j <= 9) {
                        if (this.battleship.grid[i][j] !== 0) {
                            return false;
                        }
                    }
                }
            }
            return true;
        },

        /**
         * @param {String} boat_name
         */
        setBoatOnGrid: function (boat_name) {
            let boat = this.battleship.boats[boat_name];
            for (let i = 0; i < boat.size; i++) {
                this.battleship.grid[boat.coordinatesList[i][0]][boat.coordinatesList[i][1]] = 1;
            }
            boat.isSet = true;
        },

        setBoatOffGrid: function (boat_name) {
            let boat = this.battleship.boats[boat_name];
            for (let i = 0; i < boat.size; i++) {
                this.battleship.grid[boat.coordinatesList[i][0]][boat.coordinatesList[i][1]] = 0;
            }
            boat.isSet = false;
        },

        areBoatsSet: function () {
            for (let boat in this.battleship.boats) {
                if (!this.battleship.boats[boat].isSet) {
                    return false;
                }
            }
            return true;
        },

        submitBoats: function (event) {
            if (!this.areBoatsSet()) {
                this.errors.push("Veuillez placer tous les bateaux avant d\'envoyer !");
            }else{
                console.log(this.battleship);
                this.$http.post('/setBoats/sendBoats', {boats: this.battleship.boats}).then(function (response) {
                    window.location.href = response.data.redirect;
                }), function (response) {
                    console.log(response);
                };
            }
        },

        randomSetAndSubmitBoats: function (event) {
            this.$http.post('/setBoats/sendBoats', {randomSet: true}).then(function (response) {
                window.location.href = response.data.redirect;
            }), function (response) {
                console.log(response);
            };
        },
    },
});
