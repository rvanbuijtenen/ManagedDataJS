import AbstractView from "../../AbstractView"

export default class PostView extends AbstractView {
	getPostParams() {
		return {
			title: this.renderElement.find($("#postTitle")).val(),
			content: this.renderElement.find($("#postContent")).val(),
			author: this.renderElement.find($("#postAuthor")).val(),
			date: new String(new Date()),
			id: 2
		}
	}

	renderPost(post) {
		this.renderElement.find($("#newPost")).hide()
		this.renderElement.find($("#post")).show()
		post = `
			<h1 style="display:block;width:100%;text-align:center;">${post.title}</h1>
			<center><h6><b>${post.author}</b> posted on ${post.date}</h6></center>
			<h4 id="container">${post.content}</h4>
		`
		this.renderElement.find($("#post")).html(post)
	}

	renderPostForm() {
		this.renderElement.find($("#newPost")).show()
		this.renderElement.find($("#post")).hide()
	}
}