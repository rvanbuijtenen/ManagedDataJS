import BlogController from "./controllers/BlogController"
import PostController from "./controllers/PostController"
import CommentController from "./controllers/CommentController"

import BlogView from "./views/BlogView"
import PostView from "./views/PostView"
import CommentView from "./views/CommentView"

import AbstractHashRouter from "../AbstractHashRouter"

export default class HashRouter extends AbstractHashRouter {
	initRoutes() {
		super.initRoutes()

		this.routes = {
			"/blog/": {
				"controllers": [BlogController],
				"views": [BlogView],
				"templates": ["blog/blog.html"],
			},
			"/blog/post/new/": {
				"controllers": [PostController],
				"views": [PostView],
				"templates": ["blog/post.html"],
			},
			"/blog/post/(\\d+)/": {
				"controllers": [PostController, CommentController],
				"views": [PostView, CommentView],
				"templates": ["blog/post.html", "blog/comment.html"],
				"params": ["postId"]
			}
		}

	}
}