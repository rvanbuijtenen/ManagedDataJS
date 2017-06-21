import * as graphManager from "../../../implementations/graph/graphManager.js";

export class PersistentGraphManager extends graphManager.GraphManager {
	constructor(factory, schema) {
		super(factory, schema);
		if(!("storedGraphs" in localStorage)) {
			localStorage.storedGraphs = JSON.stringify([]);

		}
	}

	addLine(color, width, start, ...points) {
		super.addLine(color, width, start, ...points);
		for(let line of this.graph.lines) {
			let lines = JSON.parse(localStorage.storedGraphs);

			if(!lines.includes(line.getId())) {
				lines.push(line.getId());
				localStorage.storedGraphs = JSON.stringify(lines);
			}
		}
	}

	loadGraph(id) {
		this.graph = new this.factory.graph();
		graph.load(id);
	}

	getstoredGraphs() {
		return localStorage.storedGraphs;
	}
}