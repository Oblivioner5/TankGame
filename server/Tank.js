function Tank(color, x, y, angle, turret, driver) {
	this.driver = driver;
	this.gunner = null;
	this.driverdriverKeys = [];
	this.gunnerdriverKeys = [];
	this.bulletFired = false;
	this.color = color;
    this.width = 50;
    this.height = 30;
	this.speed = 0;
	this.speedAngle = 0;
	this.rotateCenter = 0;
	this.speedTurret = 0;
    this.x = x;
    this.y = y;  
	this.xc = x + this.width/2;
	this.yc = y + this.height/2;
	this.angle = angle;
	this.turret = turret;
		
	this.gunnerJoin = function(gunner){
		this.gunner = gunner;
	}
	
	this.gunnerLeave = function(){
		this.gunner = null;
	}
	
	this.driverLeave = function(){
		this.driver = this.gunner;
		this.gunner = null;
	}
	this.getTeam = function(){
		return this.color;
	}
	this.emptyGunner = function(){
		return this.gunner == null;
	}
	this.emptyDriver = function(){
		return this.driver ==null;
	}
	
	//Update Function
	
	this.update = function(){
		//console.log(this.driverKeys)
		//Input controllers
		this.speed = 0;
		this.speedAngle = 0;
		this.speedTurret = 0;
		if(this.gunner == null){
			this.gunnerKeys = this.driverKeys;
		}
		if (this.driverKeys && this.driverKeys[65] && this.driverKeys[83]) {this.speed = 1; }	//A & S
		else if (this.driverKeys && this.driverKeys[65] && this.driverKeys[88]) {this.speedAngle = 1; }	//A & X
		else if (this.driverKeys && this.driverKeys[90] && this.driverKeys[83]) {this.speedAngle = -1; } //Z & S
		else if (this.driverKeys && this.driverKeys[90] && this.driverKeys[88]) {this.speed = -1; } // Z & X
		else if (this.driverKeys && this.driverKeys[65]) {this.rotateCenter = -1; this.speedAngle = 1/2;}	//A
		else if (this.driverKeys && this.driverKeys[90]) {this.rotateCenter = -1; this.speedAngle = -1/2;}	//Z
		else if (this.driverKeys && this.driverKeys[83]) {this.rotateCenter = 1; this.speedAngle = -1/2;}	//S
		else if (this.driverKeys && this.driverKeys[88]) {this.rotateCenter = 1; this.speedAngle = 1/2;}	//X
		if (this.gunnerKeys && this.gunnerKeys[69]) {this.speedTurret = 1; } //E
		if (this.gunnerKeys && this.gunnerKeys[81]) {this.speedTurret = -1; } //Q
		if (this.gunnerKeys && this.gunnerKeys[32] & !this.bulletFired) {
			//bullets.push(new bullet(this.xc, this.yc, this.turret, this.color))
			this.bulletFired = true;
			} //Space
		else if(this.gunnerKeys && !this.gunnerKeys[32]){
			this.bulletFired = false;
		}
		
		
		//Movement
		this.angle+=this.speedAngle;
		this.turret+=this.speedTurret;
		this.x += this.speed * Math.cos(this.angle*Math.PI/180);
		this.y += this.speed * Math.sin(this.angle*Math.PI/180);
	};
	
}

module.exports = Tank;
