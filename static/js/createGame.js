Vue.http.options.emulateJSON = true;

// Create a vue holding the information about the user
var createGame = new Vue({

	// We want to target the div with an id of 'createGame'
	el: '#createGame',

	// Here we can register any values or collections that hold data
	// for the application
	data: {
		messages: [], // Message to be sent to the user if there are any errors
		username: '',
		gameName: '',
	},

	// Methods we want to use in our application are registered here
	methods: {
		uploadForm: function(event) {
			// Reinitialze messages
			this.messages = [];
			// If the user has not picked a game, send error message !
			if (this.username == '') {
				this.messages.push('Please add an username');
			}
			if (this.gameName == '') {
				this.messages.push('Please add a game name')
			} else {
				// If the user has correctly added all the information, submit the form
				this.$http.post('/createGame', {
						username: this.username,
						gameName: this.gameName
					})
					.then(function(response) {
						// Success
						window.location.href = response.data.redirect;
					}, function(response) {
						// Failure
						// If the username or game name already exist, send it to the user
						if (response.status == 406) {
							this.messages.push(response.data.message);
						} else {
							console.log(response);
						}
					});
			}
		}
	}
});
