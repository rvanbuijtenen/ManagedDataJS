import * as graphManager from "../../../implementations/graph/graphManager.js";

export class PersistentGraphManager extends graphManager.GraphManager {
	constructor(factory, schema) {
		super(factory, schema);

		if(!("storedGraphs" in localStorage)) {
			localStorage.storedGraphs = JSON.stringify([]);
		}

		let graphs = JSON.parse(localStorage.getItem("storedGraphs"));
		if(!graphs.includes(this.graph.getId())) {
			graphs.push(this.graph.getId());
			localStorage.setItem("storedGraphs", JSON.stringify(graphs));
		}
		
	}

	addLine(color, width, start, ...points) {
		super.addLine(color, width, start, ...points);
	}

	loadGraph(id, objects) {
		console.log("loading graph with id: ", id)
		let graphs = JSON.parse(localStorage.getItem("storedGraphs"));
		this.graph = new this.factory.graph();
		this.graph.load(id, objects);
		console.log("finished loading: ", this.graph);
	}

	getStoredGraphs() {
		return JSON.parse(localStorage.storedGraphs);
	}
}