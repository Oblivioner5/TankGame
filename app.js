var SSCD = require('sscd').sscd;
var express = require('express');
var app = express();
var serv = require('http').Server(app);

//SSCD
var world = new SSCD.World();

//Express
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

//Socket IO
serv.listen(2000);
console.log("Server started.");
var io = require('socket.io')(serv,{});

//Main Code
var Tank = require('./server/Tank');
var Bullet = require('./server/Bullet');
var Player = require('./server/Player');

var clients = [];
var players = [];

//***Need to load logins
//***Need to prevent login into already logged in user
var logins = {
	"danko":"test",
	"brent":"dankmemes"
}

var games = [{
		name: 'Danko\'s Game',
		type: 'ranked',
		teams: 'RVB',
		currentPlayers: 3,
		maxPlayers: 4,
		redPlayers: ['bot1','bot2'],
		bluePlayers: ['bot3'],
		tanks: [],
		projectiles: []
	},
	{
		name: 'Brent\'s Game',
		type: 'casual',
		teams: 'FFA',
		currentPlayers: 2,
		maxPlayers: 6,
		redPlayers: ['bot1'],
		bluePlayers: ['bot2'],
		tanks: [],
		projectiles: []
	}
];

//Main Server Code
io.sockets.on('connection', function(socket){
	console.log('socket connection');
	clients.push(socket.id);
	players[socket.id] = new Player(socket, socket.id);
	
	socket.on('registerRequest',function(data, callback){
		if(data.username.length == 0){
			callback(false, 'Username cannot be blank!');
		}
		if(logins[data.username]){
			callback(false, 'Username already exists!');
		}
		else{
			logins[data.username] = data.password;
			callback(true, 'Registration Successful!');
		}
	});
	
	socket.on('loginRequest',function(data, callback){
		if(logins[data.username] == data.password){
			//***Update this particular client to show their username
			players[socket.id].setUsername(data.username);
			callback(true);
		}
		else{
			callback(false);
		}
	});
	
	socket.on('refreshGames',function(callback){
		callback(games);
	});
	
	socket.on('newGameRequest',function(request,callback){
		for(i = 0;i<games.length;i++){
			if(games[i].name==request.newGameName){
				callback(false,[''],[''],'Game name already exists');
				return
			}
		}
		games.push({
			name: request.newGameName,
			type: request.newGameType,
			teams: request.newGameTeams,
			currentPlayers: 1,
			maxPlayers: request.newGamePlayers,
			redPlayers: [''],
			bluePlayers: [''],
			tanks: []
		});
		players[socket.id].game = games[games.length-1];
		callback(true,[''],[''],'');
	});
	
	socket.on('joinGameRequest',function(request,callback){
		for(i = 0;i<games.length;i++){
			if(games[i].name==request){
				if(games[i].currentPlayers<games[i].maxPlayers){
					games[i].currentPlayers++;
					players[socket.id].setGame(games[i]);
					callback(true,games[i].redPlayers,games[i].bluePlayers,'');
				}
				else{
					callback(false,[''],[''],'Game is full!');
				}
			}
		}
		callback(false,[''],[''],'Game not Found!');
	});
	
	socket.on('joinTeam',function(request, callback){
		if(players[socket.id].game.bluePlayers == null){
			players[socket.id].game.bluePlayers = [''];
		}
		if(players[socket.id].game.redPlayers == null){
			players[socket.id].game.redPlayers = [''];
		}
		//Update redplayers or blueplayers with the name of the player
		if(request == 'blue'){
			if(players[socket.id].game.bluePlayers[0].length == 0){
				players[socket.id].game.bluePlayers[0] = players[socket.id].username;
			}
			else{
				players[socket.id].game.bluePlayers.push(players[socket.id].username);
			}
		}
		else{
			if(players[socket.id].game.redPlayers[0].length == 0){
				players[socket.id].game.redPlayers[0] = players[socket.id].username;
			}
			else{
				players[socket.id].game.redPlayers.push(players[socket.id].username);
			}
		}
		//Is there an empty tank?
		for(i=0;i<players[socket.id].game.tanks.length;i++){
			if(players[socket.id].game.tanks[i].getTeam()==request & players[socket.id].game.tanks[i].emptyGunner()){
				//Join this tank
				players[socket.id].game.tanks[i].gunnerJoin(socket.id);
				players[socket.id].joinTank(players[socket.id].game.tanks[i],'gunner');
				callback(true,'');
				return
			}
		}
		//New Tank
		var tmp = new Tank('blue', 50, 50, 0, 0, socket.id);
		players[socket.id].game.tanks.push(tmp);
		players[socket.id].joinTank(tmp,'driver');
		callback(true,'');
	});
	
	socket.on('keyUpdate',function(data){
		for(i=0;i<games.length;i++){
			for(j=0;j<games[i].tanks.length;j++){
				if(games[i].tanks[j].driver == socket.id){
					games[i].tanks[j].driverKeys = data.keys;
					break;
				}
				else if(games[i].tanks[j].gunner == socket.id){
					games[i].tanks[j].gunnerKeys = data.keys;
					break;
				}
			}
		}
	});

	socket.on('quitGame',function(){
		//Update Game
		players[socket.id].game.currentPlayers--;
		if(players[socket.id].team == 'blue'){
			var tmp = players[socket.id].game.bluePlayers.indexOf(players[socket.id].username);
			players[socket.id].game.bluePlayers.splice(tmp,1);
		}
		else{
			var tmp = players[socket.id].game.redPlayers.indexOf(players[socket.id].username);
			players[socket.id].game.redPlayers.splice(tmp,1);
		}
		//Delete game is no one is left in it
		if(players[socket.id].game.currentPlayers ==0){
			for(i=0;i<games.length;i++){
				if(games[i]==players[socket.id].game){
					games.splice(i,1);
				}
			}
		}
		//Update Tank
		if(players[socket.id].tank!=null){
			if(players[socket.id].getSeat() == 'driver'){
				players[socket.id].tank.driverLeave();
				if(players[socket.id].tank.emptyDriver()){
					//Delete empty tank
					var tmp = players[socket.id].game.tanks.indexOf(players[socket.id].tank);
					players[socket.id].game.tanks.splice(tmp,1);
				}
			}
			else{
				players[socket.id].tank.gunnerLeave();
			}
		}
		//Update Player
		players[socket.id].quitGame();
	});
	
	socket.on('disconnect', function(){
		console.log('socket disconnect');
		var tmp = clients.indexOf(socket.id);
		clients.slice(tmp,1);
		//Update Game
		if(players[socket.id].game!=null){
			players[socket.id].game.currentPlayers--;
			if(players[socket.id].team == 'blue'){
				var tmp = players[socket.id].game.bluePlayers.indexOf(players[socket.id].username);
				players[socket.id].game.bluePlayers.splice(tmp,1);
			}
			else{
				var tmp = players[socket.id].game.redPlayers.indexOf(players[socket.id].username);
				players[socket.id].game.redPlayers.splice(tmp,1);
			}
			//Delete game is no one is left in it
			if(players[socket.id].game.currentPlayers ==0){
				for(i=0;i<games.length;i++){
					if(games[i]==players[socket.id].game){
						games.splice(i,1);
					}
				}
			}
			//Update Tank
			if(players[socket.id].tank!=null){
				if(players[socket.id].getSeat() == 'driver'){
					players[socket.id].tank.driverLeave();
					if(players[socket.id].tank.emptyDriver()){
						//Delete empty tank
						var tmp = players[socket.id].game.tanks.indexOf(players[socket.id].tank);
						players[socket.id].game.tanks.splice(tmp,1);
					}
				}
				else{
					players[socket.id].tank.gunnerLeave();
				}
			}
		}
		//Update Player
		players.splice(socket.id, 1);
	});
	
});

//Server Interval Code
setInterval(update, 20);
function update(){
	for(i = 0; i<games.length; i++){
		for (j = 0; j < games[i].tanks.length; j++){
			games[i].tanks[j].update();
		}
	}
	sendState();
}

function sendState(){
	for (i = 0; i<clients.length; i++){
		if(players[clients[i]].game != null && players[clients[i]].game.tanks != null){
			var idx = players[clients[i]].game.tanks.indexOf(players[clients[i]].game.tank);
			var tmp = players[clients[i]].game.tanks;
			tmp = tmp.slice(idx,1);
			players[clients[i]].socket.emit('send-state',{
				player: players[clients[i]].tank,
				seat: players[clients[i]].seat,
				tanks: tmp,
				projectiles: players[clients[i]].game.projectiles
			});
		}
	}
}

/*
var lastUpdateTime = (new Date()).getTime();
setInterval(function() {
  // code ...
  var currentTime = (new Date()).getTime();
  var timeDifference = currentTime - lastUpdateTime;
  player.x += 5 * timeDifference;
  lastUpdateTime = currentTime;
}, 1000 / 60);
*/