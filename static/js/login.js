Vue.http.options.emulateJSON = true;

// Create a vue holding the information about the user
var login = new Vue({
	el: '#login',

	// Here we can register any values or collections that hold data
	// for the application
	data: {
		messages: [], // Message to be sent to the user if there are any errors
		username: '',
	},

	// Methods we want to use in our application are registered here
	methods: {
		login: function(event) {
			// Reinitialze messages
			this.messages = [];
			// If the user has not picked a game, send error message !
			if (this.username == '') {
				this.messages.push('Please add an username');

			// If there are no errors
			} else {
				// If the user has correctly added all the information, submit the form
				this.$http.post('/join/login', {
						username: this.username,
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
