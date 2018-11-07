//Handles everything that goes on the game canvas

function Drawing(ctx) {
  this.ctx = ctx;
  this.clear = function(){
	this.ctx.beginPath();
	this.ctx.clearRect(0, 0, 1224, 768);
	this.ctx.closePath();
}
	
	this.drawTank = function(x,y,angle,turret,color){
		width = 50;
		height = 30;
		turretWidth = 60;
		turretHeight = 5;
		this.ctx.save();
		this.ctx.translate(x,y);
		this.ctx.rotate(angle*Math.PI/180);
		
		//Tank
		this.ctx.fillStyle = color;
		this.ctx.fillRect(-width/2,-height/2, width,height);
		
		//Turret
		this.ctx.rotate((turret-angle)*Math.PI/180);
		this.ctx.fillStyle = 'blue';
		this.ctx.fillRect(0,-turretHeight/2,turretWidth,turretHeight);
		this.ctx.restore();
		
			/*
		this.update = function() {
			this.x += this.speed * Math.cos(this.angle*Math.PI/180);
			this.y += this.speed * Math.sin(this.angle*Math.PI/180);
			this.angle += this.speedAngle;
			this.turret += this.speedTurret;
			this.xc = this.x +this.width/2;//+ (this.width/2)*Math.cos(this.angle*Math.PI/180); //+ this.height*Math.sin(this.angle*Math.PI/180);
			this.yc = this.y +this.height/2;//+ (this.height/2)*Math.cos(this.angle*Math.PI/180);// + this.height*Math.cos(this.angle*Math.PI/180);
		
			ctx = this.context;
			ctx.fillStyle = this.color;
			ctx.save();
			ctx.translate(this.x + this.width/2, this.y + this.height/2);
			ctx.rotate((this.angle)*Math.PI/180);
			ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
			ctx.rotate((this.turret-this.angle)*Math.PI/180);
			ctx.fillStyle = 'blue';
			ctx.fillRect(0, -2, 40, 4);
			ctx.restore();
		}
		*/
	}
	this.drawVision = function(x,y,angle){
		this.ctx.save();
		this.ctx.translate(x,y);
		this.ctx.rotate(angle*Math.PI/180);
		
		this.ctx.fillStyle = 'black';
		this.ctx.beginPath();
		this.ctx.arc(0,0,1500,(0.2)*Math.PI,(1.8)*Math.PI);
		this.ctx.lineTo(0,0)
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.restore();
	}
	
	
	this.drawBullet = function(x,y,angle,color){
	this.ctx.save();
	this.ctx.translate(x,y);
	this.ctx.rotate(angle);
	this.ctx.fillStyle('Red');
	this.ctx.fillRect(x,y,50,50);
	this.ctx.restore();
}
}



