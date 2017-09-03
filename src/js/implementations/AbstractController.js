export default class AbstractController {
	constructor(model, view, manager) {
		this.model = model
		this.view = view
		this.manager = manager
		this.view.setController(this)
	}

	paramsReceived() {

	}
	
	viewLoaded() {}

	afterUnload() {
		console.log("after unload")
	}

	handleLink(to) {}

	setParams(params) {
		this.params = params
		this.paramsReceived()
	}
}