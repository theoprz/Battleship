Vue.http.options.emulateJSON = true;

let login = new Vue({
	el: '#login',

	data: {
		messages: [],
		username: '',
	},
	methods: {
		login: function(event) {
			this.messages = [];
			if (this.username == '') {
				this.messages.push('Veuillez ajouter un nom d\'utilisateur');
			} else {
				this.$http.post('/join/login', {
						username: this.username,
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
