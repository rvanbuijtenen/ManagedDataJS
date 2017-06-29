export let makeGraph = function(manager, graphid) {
	let graph = new manager.graph({"name": graphid});

	return graph;
}

export let makePersistentGraph = function(manager, graphid) {
	let graph = new manager.graph({"name": graphid}, manager, graphid);

	return graph;
}

export let draw = function(graph, canvas) {
	let min_x = 10000000;
	let min_y = 10000000;
	let max_x = 0;
	let max_y = 0;
	for(let line of graph.lines) {
		for(let point of line.points) {
			min_x = point.end.x < min_x ? point.end.x : min_x;
			max_x = point.end.x > max_x ? point.end.x : max_x;
			min_y = point.end.y < min_y ? point.end.y : min_y;
			max_y = point.end.y > max_y ? point.end.y : max_y;
			if(point.getKlass() == 'quadraticPoint') {
				min_x = point.cp.x < min_x ? point.cp.x : min_x;
				max_x = point.cp.x > max_x ? point.cp.x : max_x;
				min_y = point.cp.y < min_y ? point.cp.y : min_y;
				max_y = point.cp.y > max_y ? point.cp.y : max_y;		
			}
			if(point.getKlass() == 'bezierPoint') {
				min_x = point.cp1.x < min_x ? point.cp1.x : min_x;
				max_x = point.cp1.x > max_x ? point.cp1.x : max_x;
				min_y = point.cp1.y < min_y ? point.cp1.y : min_y;
				max_y = point.cp1.y > max_y ? point.cp1.y : max_y;
				min_x = point.cp2.x < min_x ? point.cp2.x : min_x;
				max_x = point.cp2.x > max_x ? point.cp2.x : max_x;
				min_y = point.cp2.y < min_y ? point.cp2.y : min_y;
				max_y = point.cp2.y > max_y ? point.cp2.y : max_y;		
			}
		}
	}

	let scale_x = canvas.width/(max_x - min_x);
	let scale_y = canvas.height/(max_y-min_y);
	console.log(max_x, min_x, max_y, min_y, scale_x, scale_y);

	let context = canvas.getContext("2d");
	context.clearRect(0,0,canvas.width,canvas.height);

	for(let line of graph.lines) {
		context.beginPath();
		context.moveTo(line.start.x*scale_x, canvas.height - line.start.y*scale_y);
		console.log(line.start.x, line.start.y);
		for(let point of line.points) {
			if(point.getKlass() == "linearPoint") {
				console.log("linear point");
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

export let addLine = function(graph, manager, width, color, lineData) {
	if(lineData.length == 0) {
		return;
	}
	
	let start = manager.point({"x": lineData[0][0], "y": lineData[0][1]});
	let line = manager.line({"color": color, "width": width, "start": start,"belongs_to": graph});
	lineData.unshift();
	
	for(let point of lineData) {
		switch(point.length) {
			case 2:
				let end = manager.point({"x": point[0], "y": point[1]});
				let lp = manager.linearPoint({"end": end, "belongs_to": line});
				break;
			case 4:
				let cp = manager.point({"x": point[0], "y": point[1]})
				end = manager.point({"x": point[2], "y": point[3]});
				let qp = manager.quadraticPoint({"end": end, "cp": cp, "belongs_to": line});
				break;
			case 6:
				let cp1 = manager.point({"x": point[0], "y": point[1]})
				let cp2 = manager.point({"x": point[2], "y": point[3]});
				end = manager.point({"x": point[4], "y": point[5]});
				let bp = manager.bezierPoint({"end": end, "cp1": cp1, "cp2": cp2, "belongs_to": line});
				break;
			default:
				throw new TypeError("invalid number of arguments for new line. It must contain 2,4 or 6 numbers");
				break;
		}
	}
}

export let addPersistentLine = function(graph, manager, width, color, lineData) {
	if(lineData.length == 0) {
		return;
	}
	
	let graphId = graph.getId();
	let lineId = graphId + "l" + graph.lines.getValues().length;

	let start = manager.point({"x": lineData[0][0], "y": lineData[0][1]}, manager, lineId+"start");
	let line = manager.line({"color": color, "width": width, "start": start,"belongs_to": graph}, manager, lineId);
	lineData.unshift();

	let pointIdx = 0;
	
	for(let point of lineData) {
		switch(point.length) {
			case 2:
				let pointId = getPointId(lineId, pointIdx);
				let end = manager.point({"x": point[0], "y": point[1]}, manager, getEndId(pointId, 0));
				let lp = manager.linearPoint({"end": end, "belongs_to": line}, manager, pointId);
				break;
			case 4:
				pointId = getPointId(lineId, pointIdx);
				let cp = manager.point({"x": point[0], "y": point[1]}, manager, getEndId(pointId, 0));
				end = manager.point({"x": point[2], "y": point[3]}, manager, getEndId(pointId, 1));
				let qp = manager.quadraticPoint({"end": end, "cp": cp, "belongs_to": line}, manager, pointId);
				break;
			case 6:
				pointId = getPointId(lineId, pointIdx);
				let cp1 = manager.point({"x": point[0], "y": point[1]}, manager, getEndId(pointId, 0));
				let cp2 = manager.point({"x": point[2], "y": point[3]}, manager, getEndId(pointId, 1));
				end = manager.point({"x": point[4], "y": point[5]}, manager, getEndId(pointId, 2));
				let bp = manager.bezierPoint({"end": end, "cp1": cp1, "cp2": cp2, "belongs_to": line}, manager, pointId);
				break;
			default:
				throw new TypeError("invalid number of arguments for new line. It must contain 2,4 or 6 numbers");
				break;
		}
		pointIdx++;
	}
}

let getPointId = function(lineId, pointIdx) {
	return lineId + "p" + pointIdx;
}

let getEndId = function(pointId, endIdx) {
	return pointId + "e" + endIdx;
}