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

var clients = [];
var tanks = [];
var projectiles = [];

//Main Server Code
io.sockets.on('connection', function(socket){
	console.log('socket connection');
	
	clients.push(socket);
	joined = false;
	for(i=0;i<tanks.length;i++){
		if(!tanks[i].gunner){
			console.log('gunner!');
			tanks[i].gunnerJoin(socket.id);
			joined = true;
			break;
		}
	}
	if(!joined){
		tanks.push(new Tank(45, 30, "red", 10, 120, 0, 0, socket.id));
	}
	
	socket.on('keyUpdate',function(data){
		for(i=0;i<tanks.length;i++){
			if(tanks[i].driver == socket.id){
				tanks[i].driverKeys = data.keys;
				break;
			}
			else if(tanks[i].gunner == socket.id){
				tanks[i].gunnerKeys = data.keys;
				break;
			}
		}
	});

	socket.on('disconnect', function(){
		console.log('socket disconnect');
		var i = clients.indexOf(socket);
		clients.splice(i,1);
		for(i=0;i<tanks.length;i++){
			if(tanks[i].driver == socket.id){
				tanks[i].driverLeave();
				if(tanks[i].driver){
					tanks.splice(i,1);
				}
				break;
			}
			else if(tanks[i].gunner == socket.id){
				tanks[i].gunnerLeave();
				break;
			}
		}
	});
	
});

//Server Interval Code
setInterval(update, 20);
function update(){
	for (i = 0; i < tanks.length; i++){
		//tanks[i].update();
	}
	
	sendState();
}

function sendState(){
	for (i = 0; i<clients.length; i++){
		isDriver = false;
		for(j = 0; j<tanks.length; j++){
			if(tanks[j].driver==clients[i].id){
				isDriver = true;
				if(!tanks[j].gunner){
					isDriver = false;
				}
				break;
			}
			else if(tanks[j].gunner==clients[i].id){
				isDriver = false;
				break;
			}
		}
		var tmp = tanks;
		tmp.slice(j,1);
		clients[i].emit('send-state',{
			player: tanks[j],
			isDriver: isDriver,
			tanks: tmp,
			projectiles: projectiles
		});
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