let socket = io();

Vue.http.options.emulateJSON = true;
let listGames = new Vue({
	el: '#listGames',

	data: {
		gamesList : {},
		picked : '',
		message: '',
	},

	created: function() {
		socket.on('listGames', function(availableGames) {
			this.gamesList  = availableGames;
		}.bind(this));

		socket.on('logout', function(response) {
			window.location.href = '/logout';
		});
	},

	methods: {
		Choose: function(event) {
			if (this.picked === '') {
				this.message = 'Veuillez choisir un salon dans la liste';
			}
			else {
				this.$http.post('/join/game', {picked: this.picked})
					.then(function(response) {
						window.location.href = response.data.redirect;
					});
				}
			}
		}
	});
