import DocumentationController from "./controllers/DocumentationController"
import DocumentationView from "./views/DocumentationView"

import {DataManager} from "../../framework/dataManager/DataManager"
import {Logging,Locking, Persistence} from "../../framework/mixins"

export default function runDocumentation(viewElement) {
	let manager, model, view, controller

	let schema = require("./schemas/documentationSchema")

	manager = new DataManager(schema)

	model = new manager.Documentation()
	console.log("new model, function model: " ,model, manager.Documentation())
	view = new DocumentationView("documentation/base.html", viewElement)
	controller = new DocumentationController(model, view, manager)
}