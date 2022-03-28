var clientServer = function(gameServer, io) {

	// To avoid conflicts with socket iom rename this to self
	var self = this;

	self.io = io;

	// Get the game server object
	self.gameServer = gameServer;

	// Initialize socket io
	self.init = function() {
		// Fired upon a connection
		self.io.on('connection', function(socket) {

			// If the player is registered
			if (self.getUsername(socket)) {

				// Check if the player has already joined a game
				if (self.getUserGame(socket)) {
						self.handleMultiplayerInitialization(socket);
						self.handleMultiplayerGameConnection(socket);
					// If the player is joining a game, send him available games
				} else {
					self.sendAvailableGames(socket);
				}

				// The user is not registered (could happen if server restarts ...) ! Send him back to the first page
			} else {
				self.handleDisconnect(socket);
			}
		});
	};


/******************************** Socket io handlers *************************************/
	/**
	 * Socket io handler for th initialization page (registers the user id and puts him within a game with another user
	 * before setting the boats)
	 * @param  {socket} socket socket of the connected user
	 * @this {clientServer}
	 */
	self.handleMultiplayerInitialization = function(socket) {
		let username = self.getUsername(socket);
		let game = self.getUserGame(socket);
		let player_one = game.player_one;
		let player_two = game.player_two;

		// If the user has created or joined a game, put them in the game room
		self.joinGameRoom(socket);

		//Save player socket ID
		self.gameServer.players[username].saveSocketId(socket.id);

		// If the user is the player who created the game, send wait status (he has to wait for a player to join)
		if (username === player_one.username) {
			self.sendWaitStatus(socket);
		}

		// If the user is the player who joined the game, send connect status the other player in the game telling him a player has joined
		else {
			self.sendConnectStatus(socket);
		}

		// When the user sends a startGame, redirect both users to the setBoats page
		socket.on('startGame', function() {
			self.sendSetBoatStatus(socket);
		});
	}

	/**
	 * Socket io handler for the game page (main page for the game)
	 * @param  {socket} socket socket of the connected user
	 * @this {clientServer}
	 */
	self.handleMultiplayerGameConnection = function(socket) {
		var username = self.getUsername(socket);

		let game = self.getUserGame(socket);

		// If both users are connected and user boats have been set
		if (!game.isAvailable()) {
			// Get enemy player
			let enemyPlayer = self.getEnemyPlayer(socket);

			// If the other player has not set the boats yet, send the message to the user
			if (!enemyPlayer.battleship.areBoatsSet) {
				self.sendWaitForBoatStatus(socket);
				// Since our user is the first to have his boats set, give him the first turn !
				self.gameServer.players[self.getUsername(socket)].isTurn = true;
			}

			// If both players have boats set start game !
			else {
				self.sendStartGameStatus(socket);
			}

			// Set the attack event (if it is the turn of the user, he may make attack events)
			socket.on('attack', function(attackCoordinates) {
				// Check if boats are set and it is the user's turn to play
				if (enemyPlayer.battleship.areBoatsSet && gameServer.players[username].isTurn) {
					// Get attack coordinates
					var coordinates = [attackCoordinates.row, attackCoordinates.col];

					// Execute attack function
					self.getUserBattleship(socket).attackEnemy(coordinates, enemyPlayer);

					// Check if the user has won
					if (enemyPlayer.battleship.isFleetDestroyed()) {
						self.sendGameOverStatus(socket);
						//Disconnect players
						self.disconnectAllPlayersInGame(socket);
					}

					//  If there is no victory ...
					else {
						// Change user's turn:
						self.gameServer.players[username].isTurn = false;
						enemyPlayer.isTurn = true;

						// Send the response to both users
						self.sendNextTurnStatus(socket);
					}
				}
			});
		}
	}


	/******************************** Methods *************************************/

	/**
	 * Get the game in which the user is in
	 * @param  {socket} socket
	 * @return {game} game object of the player
	 */
	self.getUserGame = function(socket) {
		return self.gameServer.players[self.getUsername(socket)].game;
	}

	/**
	 * Get the username of the connected user
	 * @param  {socket} socket
	 * @return {String}        username of the user
	 */
	self.getUsername = function(socket) {
		return socket.handshake.session.username;
	}

	/**
	 * Get the battleship object of the connected user
	 * @param  {socket} socket
	 * @return {battleship} user battleship object
	 */
	self.getUserBattleship = function(socket) {
		return self.gameServer.players[self.getUsername(socket)].battleship;
	}


	/**
	 * Send wait status to the player when no other user has joined the game
	 * @param  {socket} socket
	 */
	self.sendWaitStatus = function(socket) {
		var status = {
			status: 'waiting',
			message: 'Attente de joueurs pour rejoindre...',
		}
		socket.emit('status', status);
	}

	/**
	 * When a user connects to the game, send connect status to all players in the game
	 * @param  {socket} socket
	 */
	self.sendConnectStatus = function(socket) {
		var game = self.getUserGame(socket);
		var player_one = game.player_one;
		var player_two = game.player_two;

		// Send message to player one !
		var status = {
			status: 'connected',
			message: "Le joueur " + player_two.username + " est connecté ! Vous êtes prêts à lancer la partie !",
		}
		socket.broadcast.to(player_one.socketId).emit('status', status);

		// Send a messsage to player_two
		status.message = "Vous êtes connectés à " + player_one.username + " !";
		socket.emit('status', status);
	}

	/**
	 * Puts a user in a game room when he joins or creates a game
	 * @param  {socket} socket
	 */
	self.joinGameRoom = function(socket) {
		let game = self.getUserGame(socket);
		socket.join(game.name);
	}

	/**
	 * When a user wants to join a game on the join page, send him the available games
	 * @param  {socket} socket
	 */
	self.sendAvailableGames = function(socket) {
		socket.emit('listGames', self.gameServer.availableGames);
	}

	/**
	 * Send status that all the boats of the user have been set
	 * @param  {socket} socket
	 */
	self.sendSetBoatStatus = function(socket) {
		let game = self.getUserGame(socket);
		let response = {
			redirect: '/setBoats'
		};
		// Send the redirect url to everyone inside the created game room
		self.io.sockets.in(game.name).emit('setBoats', response)
	}

	/**
	 * Get the enemy player of the user
	 * @param  {socket} socket
	 * @return {player} player object of the enemy player
	 */
	self.getEnemyPlayer = function(socket) {
		let game = self.getUserGame(socket);
		let username = self.getUsername(socket);
		if (game.player_one.username === username) {
			return game.player_two;
		} else {
			return game.player_one;
		}
	}

	/**
	 * Send the wait for enemy boat status, the enemy player has not yet set all his boats
	 * @param  {socket} socket
	 */
	self.sendWaitForBoatStatus = function(socket) {
		var username = self.getUsername(socket);
		var enemyPlayer = self.getEnemyPlayer(socket);
		var response = {
			status : 'waiting',
			message: 'En attente de ' + enemyPlayer.username + " pour le placement de ses bateaux",
		}
		socket.emit('wait', response);
	}

	/**
	 * Send start game status when all users have set the boats
	 * @param  {socket} socket
	 */
	self.sendStartGameStatus = function(socket) {
		var response = {
				message: 'C\'est à vous de jouer',
			}
			// Send message to both players according to whose turn it is to play
		socket.broadcast.to(self.getEnemyPlayer(socket).socketId).emit('wait', response);
		response.message = "C\'est au tour de " + self.getEnemyPlayer(socket).username + " de jouer";
		socket.emit('wait', response);
	}

	/**
	 * Send game over status when a user has won
	 * @param  {socket} socket
	 */
	self.sendGameOverStatus = function(socket) {
		let response = {
			message: 'Vous avez perdu ! Vous aurez plus de chance la prochaine fois !',
			battleship: self.getEnemyPlayer(socket).battleship
		};
		socket.broadcast.to(self.getEnemyPlayer(socket).socketId).emit('finish', response);
		response = {
			message: 'Vous avez gagné !',
			battleship: self.getUserBattleship(socket)
		};
		socket.emit('finish', response);
	}

	/**
	 * Send the other player the go ahead to play
	 * @param  {socket} socket
	*/
	self.sendNextTurnStatus = function(socket) {
		response = {
			message: 'C\'est à vous de jouer',
			battleship: self.getEnemyPlayer(socket).battleship
		};
		socket.broadcast.to(self.getEnemyPlayer(socket).socketId).emit('attack', response);

		response = {
			message: "C\'est au tour de " + self.getEnemyPlayer(socket).username + " de jouer",
			battleship: self.getUserBattleship(socket)
		};
		socket.emit('attack', response);
	}

	/**
	 * Disconnect a user
	 * @param  {socket} socket
	 */
	self.handleDisconnect = function(socket) {
		let response = {
			message: 'Vous n\'êtes pas connecté',
			redirect: '/'
		}
		socket.emit('logout', response);
		socket.disconnect();
	}

	/**
	 * Disconnect all players after  seconds
	 * @param  {socket} socket
	 */
	self.disconnectAllPlayersInGame = function(socket) {
		setTimeout(function() {
			// Disconnect enemy player
			self.handleDisconnect(self.io.sockets.connected[self.getEnemyPlayer(socket).socketId]);
			// Disconnect the player
			self.handleDisconnect(socket);
		}, 300000);
	}
};

module.exports = clientServer;
