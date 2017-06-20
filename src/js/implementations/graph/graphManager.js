import * as bdm from "../../framework/basicDataManager/basicDataManager.js";

export class GraphManager extends bdm.BasicDataManager {
	constructor(factory, schema) {
		super(factory, schema);
		this.graph = new this.factory.graph();
	}

	addLine(color, width, start, ...points) {
		let line = new this.factory.line({"color": color, "width": width, "belongs_to": this.graph});
		let startPoint = new this.factory.point({"x":start[0],"y":start[1]});
		line.start = startPoint;
		new this.factory.linearPoint({"end": startPoint, "belongs_to": line});

		for(let point of points) {
			let end = {};
			switch(point.length) {
				case 2:
					end = new this.factory.point({"x": point[0], "y": point[1]});
					new this.factory.linearPoint({"end": end, "belongs_to": line});
					break;
				case 4:
					let cp = new this.factory.point({"x": point[0], "y": point[1]});
					end = new this.factory.point({"x": point[2], "y": point[3]});
					new this.factory.quadraticPoint(
						{"cp": cp, "end": end, "belongs_to": line});
					break;
				case 6:
					let cp1 = new this.factory.point({"x": point[0], "y": point[1]});
					let cp2 = new this.factory.point({"x": point[2], "y": point[3]});
					end = new this.factory.point({"x": point[4], "y": point[5]});

					new this.factory.bezierPoint(
						{"cp1": cp1, "cp2": cp2, "end": end, "belongs_to": line});
					break;
				default:
					throw new TypeError("Invalid number of points");
					break;
			}
		}
	}

	draw(canvas) {
		let min_x = 10000000;
		let min_y = 10000000;
		let max_x = 0;
		let max_y = 0;
		for(let line of this.graph.lines) {
			for(let point of line.points) {
				if(point.end.x < min_x) {
					min_x = point.end.x;
				}
				if(point.end.y < min_y) {
					min_y = point.end.y;
				}
				if(point.end.x > max_x) {
					max_x = point.end.x;
				}
				if(point.end.y > max_y) {
					max_y = point.end.y;
				}
			}
		}
		let scale_x = canvas.width/(max_x - min_x);
		let scale_y = canvas.height/(max_y-min_y);

		let context = canvas.getContext("2d");

		for(let line of this.graph.lines) {
			context.beginPath();
			context.moveTo(line.start.x*scale_x, canvas.height - line.start.y*scale_y);
			for(let point of line.points) {
				if(point.getKlass() == "linearPoint") {
					context.lineTo(point.end.x*scale_x, canvas.height - point.end.y*scale_y);
				} else if (point.getKlass() == "quadraticPoint") {
					context.quadraticCurveTo(
						point.cp.x*scale_x,
						canvas.height - point.cp.y*scale_y,
						point.end.x*scale_x, 
						canvas.height - point.end.y*scale_y);
				} else if (point.getKlass() == "bezierPoint") {
					context.bezierCurveTo(
						point.cp1.x*scale_x,
						canvas.height - point.cp1.y*scale_y,
						point.cp2.x*scale_x,
						canvas.height-point.cp2.y*scale_y,
						point.end.x*scale_x, 
						canvas.height - point.end.y*scale_y);
				}
			}
			context.lineWidth = line.width;
		    context.strokeStyle = line.color;
		    context.stroke();
		}
	}
}