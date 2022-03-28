// Connect client to socket.io
var socket = io();

Vue.http.options.emulateJSON = true;

// Create a vue holding the list of all available games
var listGames = new Vue({

	// We want to target the div with an id of 'events'
	el: '#listGames',

	// Here we can register any values or collections that hold data
	// for the application
	data: {
		gamesList : {},
		picked : '',
		message: '', // Message to be sent to the user if there are any errors
	},

	// This function is called only when the vue instance is created
	created: function() {
		// Demand available games when the available games list is updated
		socket.on('listGames', function(availableGames) {
			this.gamesList  = availableGames;
		}.bind(this));

		// Logout socket
		socket.on('logout', function(response) {
			window.location.href = '/logout'; // Redirect to logout when the logout message is received
		});
	},

	// Methods we want to use in our application are registered here
	methods: {
		Choose: function(event) {
			// If the user has not picked a game, send error message !
			if (this.picked === '') {
				this.message = 'Veuillez choisir un salon dans la liste';
			}
			else {
				// If the user has picked an available game, join the game
				this.$http.post('/join/game', {picked: this.picked})
					.then(function(response) {
						window.location.href = response.data.redirect;
					});
				}
			}
		}
	});
