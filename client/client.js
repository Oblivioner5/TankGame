var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
//HTML Variables
	//Login Variables
	var loginDiv = document.getElementById("loginDiv");

	//Server Variables
	var serverDiv = document.getElementById("serverDiv");
	var serverList = document.getElementById("serverList");
	//NewGame Variables
	var newServerDiv = document.getElementById("newServerDiv");


	//Game Variables
	var gameDiv = document.getElementById('gameDiv');
	
//Client Variables
var username = '';
var game = '';
var team = '';

//***Callbacks and timeout to deal with latency of server
//***What are callbacks and timeout functions

//Function called when register button is pressed
var registerRequest = function(){
	username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	socket.emit('registerRequest',{
		username: username,
		password: password
		},
		function(success,reason){
			alert(reason);
		}
	);
		//***Need to save names
		/* Require node.js
		const fs = require('fs');

		let lyrics = 'But still I\'m having memories of high speeds when the cops crashed\n' +  
					 'As I laugh, pushin the gas while my Glocks blast\n' + 
					 'We was young and we was dumb but we had heart';

		// write to a new file named 2pac.txt
		fs.writeFile('2pac.txt', lyrics, (err) => {  
			// throws an error, you could also catch it here
			if (err) throw err;

			// success case, the file was saved
			console.log('Lyric saved!');
		});
		*/
	
}

var loginRequest = function(){
	username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	socket.emit('loginRequest',{
		username: username,
		password: password
		},
		function(success){
			if(success){
				switchServerList();
			}
			else{
				alert('Login Failed!');
			}
		});
}

//Server Room Code
/*
var servercanvas = document.createElement('canvas');
servercanvas.id = "serverCanvas";
servercanvas.width = 500;
servercanvas.height = 500;
servercanvas.style.zIndex = 8;
servercanvas.style.position = "absolute";
servercanvas.style.border = "1px solid";
serverDiv.appendChild(servercanvas);
var serverctx = servercanvas.getContext("2d");
serverctx.fillStyle = "rgba(255, 0, 0, 0.2)";
serverctx.fillRect(100, 100, 200, 200);
serverctx.fillStyle = "rgba(0, 255, 0, 0.2)";
serverctx.fillRect(150, 150, 200, 200);
serverctx.fillStyle = "rgba(0, 0, 255, 0.2)";
serverctx.fillRect(200, 50, 200, 200);
*/

var refreshGames = function(){
	socket.emit('refreshGames',function(games){
		serverList.innerHTML = '';
		for(i = 0;i<games.length;i++){
			var tmp = document.createElement('input');
			tmp.type = 'radio';
			tmp.name = 'servers';
			tmp.value = games[i].name;
			serverList.appendChild(tmp);
			serverList.innerHTML += games[i].name + ' '+ games[i].type+ ' ' + games[i].teams + ' ' + '[' + games[i].currentPlayers + '/' + games[i].maxPlayers + ']';
			linebreak = document.createElement("br");
			serverList.appendChild(linebreak);
		}
	});
}
var switchServerList = function(){
	//Request parameters
	loginDiv.style.display = 'none';
	gameDiv.style.display = 'none';
	newGameDiv.style.display = 'none';
	teamDiv.style.display = 'none';
	serverDiv.style.display = 'inline-block';
	refreshGames();
}
var switchNewGame = function(){
	//Request parameters
	serverDiv.style.display = 'none';
	newGameDiv.style.display = 'inline-block';
	var tmp = document.getElementById('newGameName');
	tmp.value = [username + '\'s game!'];
}
var switchTeam = function(redPlayers, bluePlayers){
	serverDiv.style.display = 'none';
	newGameDiv.style.display = 'none';
	gameDiv.style.display = 'none';
	teamDiv.style.display = 'inline-block';
	
	redTeam = document.getElementById('redTeam');
	if(redPlayers[0].length == 0){
		redTeam.innerHTML = ['Red Team<br>Empty!<br>'];
	}
	else{
		redTeam.innerHTML = ['Red Team<br>' + redPlayers + '<br>'];
	}
	blueTeam = document.getElementById('blueTeam');
	if(bluePlayers[0].length == 0){
		blueTeam.innerHTML = ['Blue Team<br>Empty!<br>'];
	}
	else{
		blueTeam.innerHTML = ['Blue Team<br>' + bluePlayers + '<br>'];
	}
}

var switchGame = function(){
	//Request parameters
	serverDiv.style.display = 'none';
	newGameDiv.style.display = 'none';
	teamDiv.style.display = 'none';
	gameDiv.style.display = 'inline-block';
}
//Game Code
var newGameRequest = function(){
	var newGameName = document.getElementById("newGameName").value;
	var newGameType = document.getElementById("newGameType").value;
	var newGameTeams = document.getElementById('newGameTeams').value;
	var newGamePlayers = document.getElementById('newGamePlayers').value;
	socket.emit('newGameRequest',{
		newGameName: newGameName,
		newGameType: newGameType,
		newGameTeams: newGameTeams,
		newGamePlayers: newGamePlayers
	},
	function(success, redTeam, blueTeam, reason){
		if(success){		
			game = newGameName;
			//Join game
			switchTeam(redTeam, blueTeam);
		}
		else{
			alert(['Failed to create game: '+reason]);
		}
	});
}


var joinGameRequest = function(){
	var tmp = document.getElementsByName('servers')
	for(i=0;i<tmp.length;i++){
		if (tmp[i].checked){
			//Send request to join game (ensure open space in game on server)
			//Notify user that you are currently joining the game
			socket.emit('joinGameRequest',tmp[i].value,
			function(success, redTeam, blueTeam, reason){
				if(success){
					switchTeam(redTeam,blueTeam);
				}
				else{
					alert(reason);
				}
			});
			return
		}
	}
	alert('No game selected!');
}
var joinTeam = function(teamColor){
	socket.emit('joinTeam', teamColor, function(success, reason){
		if(success){
			switchGame();
		}
		else{
			alert(reason);
		}
	});
}

var quitGame = function(){
	socket.emit('quitGame');
	switchServerList();
}

//Function called on game join
//serverDiv.style.display = 'none';
//gameDiv.style.display = 'inline-block';

//Actual Connection to Server
var socket = io();
var canvas = document.createElement('canvas');
canvas.id = "CursorLayer";
canvas.width = 1224;
canvas.height = 768;
canvas.style.zIndex = 8;
canvas.style.position = "absolute";
canvas.style.border = "1px solid";
gameDiv.appendChild(canvas);

var ctx = canvas.getContext("2d");
drawing = new Drawing(ctx);

window.addEventListener('keydown', function (e) {
			myGameArea.keys = (myGameArea.keys || []);
			myGameArea.keys[e.keyCode] = (e.type == "keydown");
			socket.emit('keyUpdate',{keys:myGameArea.keys});
		})
		window.addEventListener('keyup', function (e) {
			myGameArea.keys[e.keyCode] = (e.type == "keydown");
			socket.emit('keyUpdate',{keys: myGameArea.keys});
		})
var myGameArea = {
	start : function() {
		
	}, 
}	
	
socket.on('send-state',function(state){
	var player = state.player;
	tanks = state.tanks; //Excludes player
	drawing.clear();
	drawing.drawTank(player.x, player.y, player.angle, player.turret, player.color);
	for (i = 0; i < tanks.length; i++){
		drawing.drawTank(tanks[i].x, tanks[i].y, tanks[i].angle, tanks[i].turret, tanks[i].color);
	}
	//drawing.drawBullet();
	if(state.seat == "driver"){
		drawing.drawVision(player.x,player.y,player.angle);
	}
	else{
		drawing.drawVision(player.x,player.y,player.turret);
	}
	drawing.drawTank(player.x,player.y,player.angle,player.turret,player.color);
});
			
		