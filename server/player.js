function Player(socket, id){
	this.socket = socket;
	this.id = id;
	this.seat = null;
	this.tank = null;
	this.team = null;
	this.game = null;
	this.username = null;
	
	this.setSeat = function(input){
		this.seat = input;
	};
	this.getSeat = function(){
		return this.seat;
	}
	this.setUsername = function(input){
		this.username = input;
	}
	this.getUsername = function(){
		return this.username;
	}
	this.setGame = function(input){
		this.game = input;
	}
	this.getGame = function(){
		return this.game;
	}
	this.getTeam = function(){
		return this.team;
	}
	this.setTeam = function(input){
		this.team = input;
	}
	this.setTank = function(input){
		this.tank = input;
	}
	this.getTank = function(){
		return this.tank;
	}
	this.joinTank = function(tank, seat){
		this.tank = tank;
		this.seat = seat;
	}
	this.quitGame = function(){
		this.seat = null;
		this.tank = null;
		this.team = null;
		this.game = null;
	}
}

module.exports = Player;