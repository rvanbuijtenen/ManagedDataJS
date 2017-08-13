export default class AbstractView {
	constructor(templateName, renderElement) {
		console.log("abstract view")
		$.ajaxSetup ({cache: false});
		this.renderElement = renderElement
		this.renderElement.load("src/js/implementations/templates/"+templateName, this.initActions.bind(this))
	}

	setController(controller) {
		this.controller = controller
	}

	initActions() {
		this.renderElement.find($(".action")).each((idx, element) => {
			console.log($("#"+element.id).attr("event"), this.controller)
			element.addEventListener("click", () => {
				console.log("asdfasdf")
				this.controller[$("#"+element.id).attr("event")]()
			})
		})
		this.controller.viewLoaded()
	}
}