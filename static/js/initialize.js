// Connect user with server using socket io
var socket = io.connect();

// Send all data in JSON
Vue.http.options.emulateJSON = true;

// Vue that will hold the status information for the user
var gameStatus = new Vue({

    // Element on the webpage to bind to
    el: '#gameStatus',

    // Necessary data on the webpage
    data: {
        status: '',
        message: '',
        game: '',
    },

    // This function is called only when the vue instance is created
    created: function() {
        socket.on('status', function(status) {
            this.message = status.message;
            this.status = status.status;
            this.game = status.gameRoom;

            // If the user is connected to a game with another user connected !
            if (status.status == 'connected') {
                $('button').removeClass('hidden');
            }
        }.bind(this));

        socket.on('logout', function(response) {
            window.location.href = '/logout';
        });
    },

    // All functions to be used with the vue
    methods: {
        // Function to be executed on button click
        startGame: function(event) {
            socket.emit('startGame');
        }
    },
});

// Once a user clicks on the startgame button, all the users are sent to a new webpage to set the boats on the grid
socket.on('setBoats', function(response) {
    window.location.href = response.redirect;
});