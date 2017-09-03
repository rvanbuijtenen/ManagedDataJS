import AbstractView from "../../AbstractView"

export default class BlogView extends AbstractView {
	renderPostList(posts) {
		let elements = posts.map((post) => {
			return `
				<li><a href="http://localhost:8080/#/blog/post/${post.id}/">Title: ${post.title}, Author: ${post.author}</a></li>
			`
		})

		elements.unshift(`</ul>`)
		elements.push(`<ul>`)
		console.log(elements)
		this.renderElement.find($("#postList")).html(elements.reverse().join(''))
	}
}