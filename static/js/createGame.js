Vue.http.options.emulateJSON = true;

let createGame = new Vue({
	el: '#createGame',

	data: {
		messages: [],
		username: '',
		gameName: '',
	},

	methods: {
		uploadForm: function(event) {
			this.messages = [];
			if (this.username == '') {
				this.messages.push('Veuillez ajouter un nom d\'utilisateur');
			}
			if (this.gameName == '') {
				this.messages.push('Veuillez préciser le nom du salon')
			} else {
				this.$http.post('/createGame', {
						username: this.username,
						gameName: this.gameName
					})
					.then(function(response) {
						window.location.href = response.data.redirect;
					}, function(response) {
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
