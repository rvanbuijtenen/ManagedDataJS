import AbstractController from "../../AbstractController"

export default class PostController extends AbstractController {
	currentPost() {
		for(let post of this.model.posts) {
			if(post.id == this.params.postId) {
				return post
			}
		}
		return undefined
	}

	viewLoaded() {
		super.viewLoaded()
		if(this.params.postId == undefined) {
			this.view.renderPostForm()
		} else {
			this.view.renderPost(this.currentPost())
		}
	}

	paramsReceived() {
		super.paramsReceived()
		if(this.params.postId == undefined) {
			this.view.renderPostForm()
		} else {
			this.view.renderPost(this.currentPost())
		}
	}

	create() {
		let postParams = this.view.getPostParams()
		console.log(postParams)
		let post = new this.manager.Post({...postParams, blog: this.model})
		window.location="http://localhost:8080/#/blog/"
	}
}