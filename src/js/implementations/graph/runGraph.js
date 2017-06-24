import * as bdm from "../../framework/basicDataManager/basicDataManager.js";

export class RunGraph {
	constructor(description) {
		this.schema = require("./graphSchema.json");
		this.manager = new bdm.BasicDataManager();
		this.initFactory();

		if(description == undefined) {
			this.description = "<p>This example demonstrates the implementation of a graph drawing program using data managers. New graphs can be created by filling in a unique name for the graph, or existing graphs can be updated by filling in an exisiting name.</p><p>The graph editor supports the following line types:<br>straight lines<br>quadratic lines<br>bezier lines</p><p>To add a line, fill in point coordinates separated by commas and enclosed in square brackets []. The points themselves should also be separated by commas.<br> An example would be: [0,0],[1,2],[2,4]</p><p>The following notations define the type of line:<br>linear: [x,y]<br>quadratic: [control_x, control_y, x, y]<br>bezier: [control_x1, control_y1, control_x2, control_y2, x, y]</p>";
		} else {
			this.description = description;
		}
		this.createUi();
	}

	initFactory() {
		this.factory = this.manager.factory(this.schema);
	}

	createUi() {
		let container = document.getElementById("container");
		if(container == null) {
			container = document.createElement('div');
		} else {
			$("#container").empty();
		}

		container.id = "container";
		container.innerHTML = this.description;
		
		let table = document.createElement('table');
		let r = document.createElement('tr');
		let menuTd = document.createElement('td');
		let canvasTd = document.createElement('td');

		let menuTable = document.createElement('table');
		menuTable.id = "menuTable";
		
		let r1 = document.createElement('tr');
		let td1 = document.createElement('td');
		td1.innerHTML = "graph name";
		let td2 = document.createElement('td');
		let if1 = document.createElement('input');
		if1.type = "text";
		if1.id = "graph_name";

		td2.appendChild(if1);
		r1.appendChild(td1);
		r1.appendChild(td2);
		menuTable.appendChild(r1);
		
		let r2 = document.createElement('tr');
		let td3 = document.createElement('td');
		td3.innerHTML = "add a line";
		let td4 = document.createElement('td');
		let ta1 = document.createElement('textArea');
		ta1.id = "line";

		td4.appendChild(ta1);
		r2.appendChild(td3);
		r2.appendChild(td4);
		menuTable.appendChild(r2);

		let r3 = document.createElement('tr');
		r3.innerHTML="<td>line width</td><td> <input type='number' id='width' min='1' max='10'></td>";
		menuTable.appendChild(r3);

		let r4 = document.createElement('tr');
		r4.innerHTML="<td>line color</td><td> <select id='color'><option value='red'>Red</option><option value='black'>Black</option><option value='green'>Green</option><option value='blue'>Blue</option></select> </td>";
		menuTable.appendChild(r4);

		let r5 = document.createElement('tr');
		let td5 = document.createElement('td');
		let td6 = document.createElement('td');
		let b1 = document.createElement('button');

		b1.classList.add ("btn");
		b1.classList.add("btn-default");
		b1.innerHTML = "Draw";

		let rg = this;
		b1.onclick = function() {
			let lineInput = document.getElementById('line')
			let lineData = lineInput.value;
			let lineArr = "["+lineData+"]";
			let graphName = if1.value;
			let lineWidth = parseInt(document.getElementById('width').value);
			let e = document.getElementById("color");
			let color = e.options[e.selectedIndex].value;
			rg.createGraph(if1.value, lineWidth, color, JSON.parse(lineArr));
			rg.drawGraph();
			lineInput.value="";
		}

		td6.appendChild(b1);
		r5.appendChild(td5);
		r5.appendChild(td6);
		menuTable.appendChild(r5);

		menuTd.appendChild(menuTable);


		let canvas = document.createElement('canvas');
        canvas.id     = "CursorLayer";
        canvas.width  = 800;
        canvas.height = 400;
        canvas.style.zIndex   = 8;
        canvas.style.position = "relative";
        canvas.style.border   = "1px solid";
        canvasTd.appendChild(canvas);

        this.canvas = canvas;

        r.appendChild(menuTd);
        r.appendChild(canvasTd);
        table.appendChild(r);
        container.appendChild(table);
		document.body.appendChild(container);
	}

	createGraph(graphName, width, color, lineData) {
		// create new graph
		if(graphName != this.graphName) {
			this.graphName = graphName;
			this.graph = this.factory.graph();
		}
		if(lineData.length == 0) {
			return;
		}

		let start = this.factory.point({"x": lineData[0][0], "y": lineData[0][1]});
		let line = this.factory.line({"color": color, "width": width, "start": start,"belongs_to": this.graph});

		lineData.unshift();
		
		for(let point of lineData) {
			switch(point.length) {
				case 2:
					let end = this.factory.point({"x": point[0], "y": point[1]});
					let lp = this.factory.linearPoint({"end": end, "belongs_to": line});
					break;
				case 4:
					let cp = this.factory.point({"x": point[0], "y": point[1]})
					end = this.factory.point({"x": point[2], "y": point[3]});
					let qp = this.factory.quadraticPoint({"end": end, "cp": cp, "belongs_to": line});
					break;
				case 6:
					let cp1 = this.factory.point({"x": point[0], "y": point[1]})
					let cp2 = this.factory.point({"x": point[2], "y": point[3]});
					end = this.factory.point({"x": point[4], "y": point[5]});
					let bp = this.factory.bezierPoint({"end": end, "cp1": cp1, "cp2": cp2, "belongs_to": line});
					break;
				default:
					throw new TypeError("invalid number of arguments for new line. It must contain 2,4 or 6 numbers");
					break;
			}
		}
	}

	drawGraph() {
		let min_x = 10000000;
		let min_y = 10000000;
		let max_x = 0;
		let max_y = 0;
		for(let line of this.graph.lines) {
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
		let scale_x = this.canvas.width/(max_x - min_x);
		let scale_y = this.canvas.height/(max_y-min_y);

		let context = this.canvas.getContext("2d");
		context.clearRect(0,0,this.canvas.width,this.canvas.height);

		for(let line of this.graph.lines) {
			context.beginPath();
			context.moveTo(line.start.x*scale_x, this.canvas.height - line.start.y*scale_y);

			for(let point of line.points) {
				if(point.getKlass() == "linearPoint") {
					context.lineTo(point.end.x*scale_x, this.canvas.height - point.end.y*scale_y);
				} else if (point.getKlass() == "quadraticPoint") {
					context.quadraticCurveTo(
						point.cp.x*scale_x,
						this.canvas.height - point.cp.y*scale_y,
						point.end.x*scale_x, 
						this.canvas.height - point.end.y*scale_y);
				} else if (point.getKlass() == "bezierPoint") {
					context.bezierCurveTo(
						point.cp1.x*scale_x,
						this.canvas.height - point.cp1.y*scale_y,
						point.cp2.x*scale_x,
						this.canvas.height-point.cp2.y*scale_y,
						point.end.x*scale_x, 
						this.canvas.height - point.end.y*scale_y);
				}
			}
			context.lineWidth = line.width;
		    context.strokeStyle = line.color;
		    context.stroke();
		}
	}
}
