function bullet(x, y, angle, color){
	this.width = 10;
	this.height = 4;
	this.speed = 6;
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.color = color;
	this.update = function() {
		this.x += this.speed * Math.cos(this.angle*Math.PI/180);
		this.y += this.speed * Math.sin(this.angle*Math.PI/180);
		
		ctx = myGameArea.context;
        ctx.fillStyle = this.color;
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate((this.angle)*Math.PI/180);
		ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
		ctx.restore();
	}
}

module.exports = bullet;