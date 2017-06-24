import * as runGraph from "../../../implementations/graph/runGraph.js";
import * as persistentMObject from "./persistentMObject.js";

export class RunPersistentGraph extends runGraph.RunGraph {
	constructor(description) {		
		if(description == undefined) {
			super("<p>This example demonstrates the implementation of a persistent graph drawing program using data managers. New graphs can be created by filling in a unique name for the graph, or existing graphs can be updated by filling in an exisiting name.</p><p>The graph editor supports the following line types:<br>straight lines<br>quadratic lines<br>bezier lines</p><p>To add a line, fill in point coordinates separated by commas and enclosed in square brackets []. The points themselves should also be separated by commas.<br> An example would be: [0,0],[1,2],[2,4]</p><p>The following notations define the type of line:<br>linear: [x,y]<br>quadratic: [control_x, control_y, x, y]<br>bezier: [control_x1, control_y1, control_x2, control_y2, x, y]</p><p>After a graph has been drawn it can be saved by pressing the save button. Alternatively, a graph can be loaded by selecting one of the saved graphs from the drop-down menu. Once a graph is selected press load to display it. After loading the graph can be modified and saved again</p>");
		} else {
			super(description);
		}
	}

	initFactory() {
		this.factory = this.manager.factory(this.schema, persistentMObject.PersistentMObject);
	}

	createUi() {
		super.createUi();
		let menuTable = document.getElementById("menuTable");
		let rpg = this;
		let tr = document.createElement("tr");
		let td1 = document.createElement("td");
		let td2 = document.createElement("td");

		let saveButton = document.createElement("button");
		saveButton.innerHTML = "Save Graph";
		saveButton.classList.add ("btn"); 
		saveButton.classList.add("btn-default");
		saveButton.onclick = function() {
			rpg.save();
		}

		td2.appendChild(saveButton);
		tr.appendChild(td1);
		tr.appendChild(td2);
		menuTable.appendChild(tr);

		this.createGraphSelect();
	}

	updateGraphSelect(graph) {
		let option = document.createElement("option");
		option.value = graph;
		option.text = graph;

		let select = document.getElementById("graphSelect");
		if(select == null) {
			this.createGraphSelect();
		} else {
			select.appendChild(option);
		}
	}

	createGraphSelect() {
		let menuTable = document.getElementById("menuTable");
		let tr2 = document.createElement("tr");
		let td3 = document.createElement("td");
		let td4 = document.createElement("td");

		td3.innerHTML = "Select a graph to load";

		let graphSelect = document.createElement("select");
		graphSelect.id = "graphSelect";

		let savedGraphs = JSON.parse(localStorage.getItem("savedGraphs"));
		if(savedGraphs == null) {
			savedGraphs = [];
		}

		for(let graph of savedGraphs) {
			let option = document.createElement("option");
			option.value = graph;
			option.text = graph;
			graphSelect.appendChild(option);
		}

		td4.appendChild(graphSelect);

		tr2.appendChild(td3);
		tr2.appendChild(td4);
		menuTable.appendChild(tr2);

		let tr3 = document.createElement("tr");
		let td5 = document.createElement("td");
		let td6 = document.createElement("td");
		let loadButton = document.createElement("button");	
		loadButton.classList.add ("btn");
		loadButton.classList.add("btn-default");
		loadButton.innerHTML = "Load Graph";
				let rpg = this;
		loadButton.onclick = function() {
			let e = document.getElementById("graphSelect");
			let graph = e.options[e.selectedIndex].value;
			rpg.load(graph);
		}
		td6.appendChild(loadButton);
		tr3.appendChild(td5);
		tr3.appendChild(td6);
		menuTable.appendChild(tr3);
	}

	save() {
		let savedGraphs = JSON.parse(localStorage.getItem("savedGraphs"));
		if(savedGraphs == null) {
			savedGraphs = [];
		}
		if(!savedGraphs.includes(this.graph.getId())) {
			savedGraphs.push(this.graph.getId());
		}
		console.log("saved graphs: ", savedGraphs);
		localStorage.setItem("savedGraphs", JSON.stringify(savedGraphs));
		this.graph.save();
		this.updateGraphSelect(this.graph.getId());
	}

	load(graph) {
		this.graph = this.factory.graph({}, this.factory, graph)
		this.graph.load();
		this.drawGraph();
	}


	createGraph(graphName, width, color, lineData) {
		if(graphName != this.graphName) {
			this.graphName = graphName;
			console.log(graphName);
			this.graph = this.factory.graph({},this.factory, graphName);
		}
		if(lineData.length == 0) {
			return;
		}

		let lineId = graphName + "l" + this.graph.lines.getValues().length;
		let start = this.factory.point({"x": lineData[0][0], "y": lineData[0][1]}, this.factory, lineId+"s");

		let line = this.factory.line({"color": color, "width": width, "start": start,"belongs_to": this.graph}, this.factory, lineId);

		lineData.unshift();
		
		let pointIdx = 0;

		for(let point of lineData) {
			switch(point.length) {
				case 2:
					let end = this.factory.point({"x": point[0], "y": point[1]}, this.factory, this.getEndId(lineId, pointIdx, 0));
					let lp = this.factory.linearPoint({"end": end, "belongs_to": line}, this.factory, this.getPointId(lineId, pointIdx));
					break;
				case 4:
					let cp = this.factory.point({"x": point[0], "y": point[1]}, this.factory, this.getEndId(lineId, pointIdx, 0))
					end = this.factory.point({"x": point[2], "y": point[3]}, this.factory, this.getEndId(lineId, pointIdx, 1));
					let qp = this.factory.quadraticPoint({"end": end, "cp": cp, "belongs_to": line}, this.factory, this.getPointId(lineId, pointIdx));
					break;
				case 6:
					let cp1 = this.factory.point({"x": point[0], "y": point[1]}, this.factory, this.getEndId(lineId, pointIdx, 0))
					let cp2 = this.factory.point({"x": point[2], "y": point[3]}, this.factory, this.getEndId(lineId, pointIdx, 1));
					end = this.factory.point({"x": point[4], "y": point[5]}, this.factory, this.getEndId(lineId, pointIdx, 2));
					let bp = this.factory.bezierPoint({"end": end, "cp1": cp1, "cp2": cp2, "belongs_to": line}, this.factory, this.getPointId(lineId, pointIdx));
					break;
				default:
					throw new TypeError("invalid number of arguments for new line. It must contain 2,4 or 6 numbers");
					break;
			}
			pointIdx++;
		}
	}

	getEndId(lineId, pointIdx, endIdx) {
		return this.getPointId(lineId, pointIdx) + "e" + endIdx;
	}

	getPointId(lineId, pointIdx) {
		return lineId + "p" + pointIdx;
	}
}