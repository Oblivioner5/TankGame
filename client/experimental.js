var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

//Login Variables
var loginDiv = document.getElementById("loginDiv");

//Server Variables
var serverDiv = document.getElementById("serverDiv");
var serverList = document.getElementById("serverList");
var username = '';
//NewGame Variables
var newServerDiv = document.getElementById("newServerDiv");


//Game Variables
var gameDiv = document.getElementById('gameDiv');
var game = '';
var team = '';

//***Callbacks and timeout to deal with latency of server
//***What are callbacks and timeout functions

//***Need to load logins
/*
var fs = require('fs');
fs.readFile( __dirname + '/test.txt', function (err, data) {
  if (err) {
    throw err; 
  }
  console.log(data.toString());
});
*/
var logins = {
	"danko":"test",
	"brent":"dankmemes"
}

var registerRequest = function(){
	username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	if(logins[username])
		alert('Username: '+username+' already exists!');
	else{
		logins[username] = password;
		alert('Registration Successful!')
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
	
}

var loginRequest = function(){
	username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	if(logins[username] == password)
	{
		switchServerList();
		return
	}
	if(logins[username])
		alert('Incorrect Password!');
	else
		alert('Username not found!');
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
var games = [{
		name: 'Danko\'s Game',
		type: 'ranked',
		currentPlayers: 3,
		maxPlayers: 4,
		redPlayers: ['bot1','bot2'],
		bluePlayers: ['bot3']
	},
	{
		name: 'Brent\'s Game',
		type: 'casual',
		currentPlayers: 2,
		maxPlayers: 6,
		redPlayers: ['bot1'],
		bluePlayers: ['bot2']
	}
]
var refreshGames = function(){
	serverList.innerHTML = '';
	for(i = 0;i<games.length;i++){
		var tmp = document.createElement('input');
		tmp.type = 'radio';
		tmp.name = 'servers';
		tmp.value = games[i].name;
		serverList.appendChild(tmp);
		serverList.innerHTML += games[i].name + ' '+ games[i].type+ ' ' + '[' + games[i].currentPlayers + '/' + games[i].maxPlayers + ']';
		linebreak = document.createElement("br");
		serverList.appendChild(linebreak);
	}
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
var switchTeam = function(){
	serverDiv.style.display = 'none';
	newGameDiv.style.display = 'none';
	gameDiv.style.display = 'none';
	teamDiv.style.display = 'inline-block';
	
	//Find game
	for(i = 0; i < games.length; i ++){
		if(games[i].name == game){
			break;
		}
	}
	
	redTeam = document.getElementById('redTeam');
	if(games[i].redPlayers[0] == ['']){
		redTeam.innerHTML = ['Red Team<br>Empty!<br>'];
	}
	else{
		redTeam.innerHTML = ['Red Team<br>' + games[i].redPlayers + '<br>'];
	}
	blueTeam = document.getElementById('blueTeam');
	if(games[i].bluePlayers[0] == ['']){
		blueTeam.innerHTML = ['Blue Team<br>Empty!<br>'];
	}
	else{
		blueTeam.innerHTML = ['Blue Team<br>' + games[i].bluePlayers + '<br>'];
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
var joinNewGameRequest = function(){
	var newGameName = document.getElementById("newGameName").value;
	var newGameType = document.getElementById("newGameType").value;
	var newGamePlayers = document.getElementById('newGamePlayers').value;
	for(i = 0;i<games.length;i++){
		if(games[i].name==newGameName){
			alert('Game name already exists');
			return
		}
	}
	game = newGameName;
	games.push({
	name: newGameName,
	type: newGameType,
	currentPlayers: 1,
	maxPlayers: newGamePlayers,
	redPlayers: [''],
	bluePlayers: ['']
	});
	//Join game
	switchTeam();
}
var joinGameRequest = function(){
	var tmp = document.getElementsByName('servers')
	for(i=0;i<tmp.length;i++){
		if (tmp[i].checked){
			//Send request to join game (ensure open space in game on server)
			//Notify user that you are currently joining the game
			console.log('Joining game!');
			games[i].currentPlayers++;
			game = games[i].name;
			switchTeam();
			return
		}
	}
	alert('No game selected!');
}
var joinRedTeam = function(){
	for(i = 0;i<games.length;i++){
		if(games[i].name == game){
			games[i].redPlayers.push(username);
			team = 'red';
			break
		}
	}
	switchGame();
}
var joinBlueTeam = function(){
	for(i = 0;i<games.length;i++){
		if(games[i].name == game){
			games[i].bluePlayers.push(username);
			team = 'blue';
			break
		}
	}
	switchGame();
}
var quitGame = function(){
	//Remove player from game, player list, decrement player count
	for(i = 0;i<games.length;i++){
		if(games[i].name == game){
			games[i].currentPlayers--;
			if(team == 'blue'){
				var tmp = games[i].bluePlayers.indexOf(username);
				games[i].bluePlayers.splice(tmp,1);
			}
			else{
				var tmp = games[i].redPlayers.indexOf(username);
				games[i].redPlayers.splice(tmp,1);
			}
			if(games[i].currentPlayers == 0){
				games.splice(i,1);
			}
		}
	}
	team = '';
	game = '';
	switchServerList();
}

var canvas = document.createElement('canvas');
canvas.id = "CursorLayer";
canvas.width = 1224;
canvas.height = 768;
canvas.style.zIndex = 8;
canvas.style.position = "absolute";
canvas.style.border = "1px solid";
gameDiv.appendChild(canvas);

var ctx = canvas.getContext("2d");
ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
ctx.fillRect(100, 100, 200, 200);
ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
ctx.fillRect(150, 150, 200, 200);
ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
ctx.fillRect(200, 50, 200, 200);

//Function called on game join
//serverDiv.style.display = 'none';
//gameDiv.style.display = 'inline-block';