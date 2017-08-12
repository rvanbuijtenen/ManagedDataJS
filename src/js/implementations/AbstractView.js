export default class AbstractView {
	constructor(templateName, renderElement) {
		$.ajaxSetup ({cache: false});
		this.renderElement = renderElement
		this.renderElement.load("src/js/implementations/templates/"+templateName, this.initActions.bind(this))
	}

	setController(controller) {
		this.controller = controller
	}

	initActions() {
		this.renderElement.find($(".action")).each((idx, element) => {
			element.addEventListener("click", () => {
				this.controller[$("#"+element.id).attr("event")]()
			})
		})
		this.controller.viewLoaded()
	}
}