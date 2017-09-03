import AbstractView from "../../AbstractView"

export default class CommentView extends AbstractView {
	getCommentParams() {
		return {
			author: this.renderElement.find($("#commentAuthor")).val(),
			content: this.renderElement.find($("#commentContent")).val(),
			date: new String(new Date()),
			id: 1
		}
	}

	renderComments(comments) {
		comments = comments.map((comment) => {
			return `
				<div><b>${comment.author}</b> replied on ${comment.date}:</div>
				<div>${comment.content}</div>
			`
		})
		this.renderElement.find($("#commentList")).html(comments.join(''))
	}
}