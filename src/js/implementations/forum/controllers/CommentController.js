import AbstractController from "../../AbstractController"

export default class CommentController extends AbstractController {
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
		this.view.renderComments(this.currentPost().comments)
	}

	paramsReceived() {
		super.paramsReceived()
		this.view.renderComments(this.currentPost().comments)
	}

	create() {
		console.log("create")
		let commentParams = this.view.getCommentParams()
		let post = this.currentPost()
		try {
			new this.manager.Comment({...commentParams, post})
			this.view.renderComments(post.comments)
		} catch (err) {
			console.log("invalid")
			console.log(err)
		}
	}
}
