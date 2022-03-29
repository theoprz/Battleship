let socket = io();

Vue.http.options.emulateJSON = true;

let game = new Vue({
	el: '#game',
	data: {
		battleship : {grid: [], attack_grid: []},
		errors: [],
		serverMessage: '',
	},

	created: function() {
		socket.on('attack', function(response) {
			this.battleship  = response.battleship;
			this.serverMessage = response.message;
		}.bind(this));

		socket.on('wait', function(response) {
			this.serverMessage = response.message;
		}.bind(this));

		socket.on('finish', function(response) {
			this.serverMessage = response.message;
			$('#myModal').modal('show');
		}.bind(this));

		socket.on('logout', function(response) {
			window.location.href = '/logout';
		});

	    this.$http.get('/game/getBattleship').then(function(response) {
	        this.battleship = response.body.battleship;
	    });
	},

	methods: {
		attack: function(row, col, event) {
			console.log('attack done');
			socket.emit('attack', attackCoordinates = {row: row - 1, col: col - 1});

		},

		attackCellClass: function(row, col) {
			let result = {};
			if (this.battleship.attack_grid[row-1]) {
				switch (this.battleship.attack_grid[row-1][col-1]) {
					case 0:
						result = {'btn-default': true};
						break;
					case 1:
						result = {'btn-primary': true};
						break;
					case 2:
						result = {'btn-success': true, 'bounceIn': true};
						break;
					case 3:
						result = {'btn-warning': true, 'bounceIn': true};
						break;
					case 4:
						result = {'btn-danger': true, 'bounceIn': true};
						break;
					default:
						result = {};
						break;
				}
				return result;
			}
			else {
				return result;
			}
		},

		myCellClass: function(row, col) {
			let result = {};
			if (this.battleship.grid[row-1]) {
				switch (this.battleship.grid[row-1][col-1]) {
					case 0:
						result = {'btn-default': true};
						break;
					case 1:
						result = {'btn-primary': true};
						break;
					case 2:
						result = {'btn-success': true, 'bounceIn': true};
						break;
					case 3:
						result = {'btn-warning': true, 'bounceIn': true};
						break;
					case 4:
						result = {'btn-danger': true, 'bounceIn': true};
						break;
					default:
						result = {};
						break;
				}
				return result;
			}
			else {
				return result;
			}
		},

	},
});
