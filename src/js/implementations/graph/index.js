import GraphController from "./controllers/GraphController"
import LockingGraphController from "./controllers/LockingGraphController"
import LockingPersistentGraphController from "./controllers/LockingPersistentGraphController"

import GraphView from "./views/GraphView"
import LockingGraphView from "./views/LockingGraphView"
import LockingPersistentGraphView from "./views/LockingPersistentGraphView"

import {DataManager} from "../../framework/dataManager/DataManager"
import {Logging,Locking, Persistence} from "../../framework/mixins"

export default function runMachine(type, viewElement) {
	viewElement.html('')
	let manager, model, view, controller
	let schema = require("./schemas/graphSchema")

	switch(type) {
		case "graph": {
			manager = new DataManager(schema)

			model = makeGraph(manager)
			view = new GraphView("graph/graph.html", viewElement)
			controller = new GraphController(model, view, manager)
			break;
		}
		case "loggingGraph": {
			manager = new DataManager(schema, {}, {}, Logging)

			model = makeGraph(manager)
			view = new GraphView("graph/graph.html", viewElement)
			controller = new GraphController(model, view, manager)
			break;
		}
		case "lockingGraph": {
			manager = new DataManager(schema, {}, {}, Locking)

			model = makeGraph(manager)
			view = new LockingGraphView("graph/lockingGraph.html", viewElement)
			controller = new LockingGraphController(model, view, manager)
			break;
		}
		case "loggingLockingGraph": {
			manager = new DataManager(schema, {}, {}, Logging, Locking)

			model = makeGraph(manager)
			view = new LockingGraphView("graph/lockingGraph.html", viewElement)
			controller = new LockingGraphController(model, view, manager)
			break;
		}
		case "loggingLockingPersistentGraph": {
			manager = new DataManager(schema, {}, {}, Logging, Locking, Persistence)

			model = makePersistentGraph(manager)
			view = new LockingPersistentGraphView("graph/lockingPersistentGraph.html", viewElement)
			controller = new LockingPersistentGraphController(model, view, manager)
			break;
		}
		default: {
			throw new TypeError("Unknown graph type: "+type)
		}
	}
}

function makeGraph(manager) {
	return manager.Graph()
}

function makePersistentGraph(manager) {
	let graph = manager.Graph()
	graph.setId("")
	graph.setFactory(manager)
	return graph
}