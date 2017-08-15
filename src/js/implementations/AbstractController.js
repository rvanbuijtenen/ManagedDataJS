export default class AbstractController {
	constructor(model, view, manager) {
		this.model = model
		this.view = view
		this.manager = manager
		this.view.setController(this)
	}

	viewLoaded() {}

	handleLink(to) {}
}