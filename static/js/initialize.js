let socket = io.connect();

Vue.http.options.emulateJSON = true;
let gameStatus = new Vue({
    el: '#gameStatus',

    data: {
        status: '',
        message: '',
        game: '',
    },

    created: function() {
        socket.on('status', function(status) {
            this.message = status.message;
            this.status = status.status;
            this.game = status.gameRoom;

            if (status.status == 'connected') {
                $('button').removeClass('hidden');
            }
        }.bind(this));

        socket.on('logout', function(response) {
            window.location.href = '/logout';
        });
    },
    methods: {
        startGame: function(event) {
            socket.emit('startGame');
        }
    },
});

socket.on('setBoats', function(response) {
    window.location.href = response.redirect;
});
