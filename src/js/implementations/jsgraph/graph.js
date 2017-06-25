export class Graph {
	constructor() {
		this.lines = [];
	}

	addLine(color, width, start, ...points) {
		this.lines.push(new Line(color, width, start, points));
	}

	draw(canvas) {
		let min_x = 10000000;
		let min_y = 10000000;
		let max_x = 0;
		let max_y = 0;
		for(let line of this.lines) {
			for(let point of line.points) {
				if(point.x < min_x) {
					min_x = point.x;
				}
				if(point.y < min_y) {
					min_y = point.y;
				}
				if(point.x > max_x) {
					max_x = point.x;
				}
				if(point.y > max_y) {
					max_y = point.y;
				}
			}
		}
		let scale_x = canvas.width/(max_x - min_x);
		let scale_y = canvas.height/(max_y-min_y);

		let context = canvas.getContext("2d");

		for(let line of this.lines) {
			context.beginPath();
			context.moveTo(line.start.x*scale_x, canvas.height - line.start.y*scale_y);
			for(let point of line.points) {
				if(point instanceof BezierPoint) {
					context.bezierCurveTo(
						point.cp1x*scale_x,
						canvas.height - point.cp1y*scale_y,
						point.cp2x*scale_x,
						canvas.height-point.cp2y*scale_y,
						point.x*scale_x, 
						canvas.height - point.y*scale_y);
				} else if (point instanceof QuadraticPoint) {
					context.quadraticCurveTo(
						point.cp1x*scale_x,
						canvas.height - point.cp1y*scale_y,
						point.x*scale_x, 
						canvas.height - point.y*scale_y);
				} else if (point instanceof Point) {
					context.lineTo(point.x*scale_x, canvas.height - point.y*scale_y);
				}
			}
			context.lineWidth = line.width;
		    context.strokeStyle = line.color;
		    context.stroke();
		}
	}
}

export class Line {
	constructor(color, width, start, points) {
		this.points = [];

		TypeChecker.validateColor(color);
		this.color = color;

		TypeChecker.validateNumber(width, 1, 10);
		this.width = width;

		if(start.length == 2) {
			this.start = new Point(start[0], start[1]);
			this.points.push(this.start);
		} else {
			throw new TypeError("Start point must have 2 coordinates")
		}

		for(let point of points) {
			switch(point.length) {
				case 2:
					this.points.push(new Point(point[0], point[1]));
					break;
				case 4:
					this.points.push(new QuadraticPoint(
						point[0], point[1], 
						point[2], point[3]));
					break;
				case 6:
					this.points.push(new BezierPoint(
						point[0], point[1], 
						point[2], point[3], 
						point[4], point[5]));
					break;
				default:
					throw new TypeError("Invalid number of points");
			}
		}
	}
}

export class Point {
	constructor(x, y) {
		TypeChecker.validateNumber(x);
		TypeChecker.validateNumber(y);
		this.x = x;
		this.y = y;
	}
}

export class QuadraticPoint extends Point {
	constructor(cpx, cpy, x, y) {
		super(x, y);
		TypeChecker.validateNumber(cpx);
		TypeChecker.validateNumber(cpy);
		this.cp1x = cpx;
		this.cp1y = cpy;
	}
}

export class BezierPoint extends QuadraticPoint {
	constructor(cp1x, cp1y, cp2x, cp2y, x, y) {
		super(cp1x, cp1y, x, y);
		TypeChecker.validateNumber(cp2x);
		TypeChecker.validateNumber(cp2y);
		this.cp2x = cp2x;
		this.cp2y = cp2y;
	}
}

class TypeChecker {
	static validateNumber(i, min, max) {
		if(typeof(i) != "number") {
			throw new TypeError(i+" is not a number");
		}
		if(min != undefined) {
			if(i < min) {
				throw new TypeError(i+" is lower than the minimum "+min);
			}
		}
		if(max != undefined) {
			if(i > max) {
				throw new TypeError(i+" is greater than the maximum "+max);
			}
		}
		return true;
	}

	static validateColor(color) {
		if(typeof(color) != "string" ||
			(color != "black" &&
			color != "green" &&
			color != "blue" &&
			color != "red")) {
			throw new TypeError("color must be a string and one of [black, green, blue, red]")
		}
		return true;
	}
}
