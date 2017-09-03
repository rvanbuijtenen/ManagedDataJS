import AbstractController from "../../AbstractController"

export default class BlogController extends AbstractController {
	constructor(model, view, manager) {
		super(model, view, manager)
	}

	viewLoaded() {
		super.viewLoaded()
		this.view.renderPostList(this.model.posts)
	}
}