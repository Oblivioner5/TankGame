//Close-Form Collision
//Handles collision detection of convex polygons and circles with each other.
//Does not handle concave polygons, must break into individual objects before sending to this function
//Does not check for circle inside of polygon
/*
obj = {
	points: [0:n][x,y], (only if not circle)
	isCircle: T/F,
	r: radius (only if circle)
}
*/

var collision = function(obj1, obj2){
	//Seperating Line Generation
	this.generateNormalLines = function(obj){
		lines = [];
		for(var i=0;i<obj.points.length;i++){
			lines[i] = [[],[]];
			//Find Normal Line
			if(i == 0){
				lines[i][0] = -(obj.points[i][1] - obj.points[obj.points.length-1][1]);
				lines[i][1] = obj.points[i][0] - obj.points[obj.points.length-1][0];
			}
			else{
				lines[i][0] = -(obj.points[i][1] - obj.points[i-1][1]);
				lines[i][1] = obj.points[i][0] - obj.points[i-1][0];
			}
		}
		return lines;
	}
	
	this.eliminateRedudantLines = function(lines){
		var idx = [];
		for(var i=0;i<lines.length;i++){
			//Find unit vector
			var mag = Math.sqrt(Math.pow(lines[i][0],2) + Math.pow(lines[i][1],2));
			var unitVec = [lines[i][0]/mag, lines[i][1]/mag];
			for(j=0;j<i;j++){
				var tmpMag = Math.sqrt(Math.pow(lines[j][0],2) + Math.pow(lines[j][1],2));
				var tmpUnitVec = [lines[j][0]/mag, lines[j][1]/mag];
				//Check if identical of rotated 180 degrees
				if(tmpUnitVec[0] == unitVec[0] && tmpUnitVec[1] == unitVec[1]){
					//Identical
					idx.push(i);
					break;
				}
				else if(tmpUnitVec[0] == -unitVec[0] && tmpUnitVec[1] == -unitVec[1]){
					//Rotated 180
					idx.push(i);
					break;
				}
			}
		}
		for(var i=idx.length-1;i>=0;i--){
			lines.splice(idx[i],1);
		}
		return lines;
	}
	
	//Find point on line
	this.pointsOnLineDot = function(points, line){
		var dots = [];
		var mag2 = this.mag2([line[1][0]-line[0][0],line[1][1]-line[0][1]]);
		for(var i=0;i<points.length;i++){
			dots[i] = this.dotProduct([points[i][0]-line[0][0],points[i][1]-line[0][1]],[line[1][0]-line[0][0],line[1][1]-line[0][1]]);
			//Clamp loc to length of line at max
			if(dots[i]>mag2){
				dots[i] = mag2;
			}
			else if(dots[i] < 0){
				dots[i] = 0;
			}
		}
		return dots;
		//var dot = this.dotProduct(point - line[0],line[1] - line[0]);
		//var mag2 = (line[1][0] - line[0][0])^2 + (line[1][1] - line[0][1])^2;
		//return (dot*(line[1]-line[0])/mag2) + line[0];
		//return dot
	}
	
	this.dotProductOfProjection = function(points, unitVec){
		var dots = [];
		for(var i=0;i<points.length;i++){
			dots[i] = this.dotProduct(points[i],unitVec);
			//Clamp loc to length of line at max
		}
		return dots;
		//var dot = this.dotProduct(point - line[0],line[1] - line[0]);
		//var mag2 = (line[1][0] - line[0][0])^2 + (line[1][1] - line[0][1])^2;
		//return (dot*(line[1]-line[0])/mag2) + line[0];
		//return dot
	}
	
	//Determine if dots overlap on given line
	this.dotsOverlap = function(dots1,dots2){
		/* testing if an overlap exists
		return (min(dots1) >= min(dots2) && min(dots1)<= max(dots2) || //Min of dots 1 is in dots 2
			max(dots1) >= min(dots2) && max(dots1)<=max(dots2) || //Max of dots 1 is in dots 2
			min(dots2) >= min(dots1) && min(dots2) <= max(dots1)) //Covers case of dots2 being inside dots1
		*/
		
		//instead check if gap is present:
		return !(Math.min.apply(null, dots1) > Math.max.apply(null, dots2) || Math.min.apply(null, dots2) > Math.max.apply(null, dots1));
	}
	
	//Circle-Line Collison Check
	this.circleOnLine = function(obj, line){
		//Find closest point on line
		var dot = pointsOnLineDot(obj.points, line);
		var mag2 = this.mag2([line[1][0]-line[0][0],line[1][1]-line[0][1]]);
		var loc = [dot*(line[1][0]-line[0][0])/mag2,dot*(line[1][1]-line[0][1])/mag2];
		
		//Is distance to this point from center smaller than radius?
		return (Math.pow(loc[0] + line[0][0] - obj.points[0][0],2) + Math.pow(loc[1] + line[0][1] - obj.points[0][1],2) <= Math.pow(obj.r,2));
	}
	
	//Dot Product
	this.dotProduct = function(A,B){
		return A[0]*B[0] + A[1]*B[1];
	}
	this.mag2 = function(A){
		return Math.pow(A[0],2) + Math.pow(A[1],2);
	}
	
	if(obj1.isCircle&&!obj2.isCircle){
		debugger
		//Check for collision
		for(var i=0;i<obj2.points.length;i++){
			if(i==0){
				var line = [obj2.points[0], obj2.points[obj2.points.length-1]];
			}
			else{
				var line = [obj2.points[i], obj2.points[i-1]];
			}
			if(this.circleOnLine(obj1,line)){
				//Collision!
				return true
			}
		}
		//No collision on any axis
		return false;
	}
	else if(!obj1.isCircle && obj2.isCircle){
		//Check for collision
		for(var i=0;i<obj1.points.length;i++){
			if(i==0){
				var line = [obj1.points[0], obj1.points[obj1.points.length-1]];
			}
			else{
				var line = [obj1.points[i], obj1.points[i-1]];
			}
			if(this.circleOnLine(obj2,line)){
				//Collision!
				return true
			}
		}
		//No collision on any axis
		return false;
	}
	else if(obj1.isCircle&&obj2.isCircle){
		//Circle-Circle collision
		return (Math.pow(obj1.points[0][0]-obj2.points[0][0],2) + Math.pow(obj1.points[0][1]-obj2.points[0][1],2)) <= Math.pow(obj1.r+obj2.r,2);
	}
	else{
		//Polygon-Polygon collision
		//Find lines
		debugger
		var lines = this.generateNormalLines(obj1);
		lines = lines.concat(this.generateNormalLines(obj2));
		//Eliminate redudant lines
		var lines = this.eliminateRedudantLines(lines);
		//Check for collision
		for(var i=0;i<lines.length;i++){
			var dots1 = this.dotProductOfProjection(obj1.points, lines[i]);
			var dots2 = this.dotProductOfProjection(obj2.points, lines[i]);
			if(!this.dotsOverlap(dots1,dots2)){
				//No collision on this axis!
				return false;
			}
		}
		//Collision on all axes
		return true;
	}
	
}