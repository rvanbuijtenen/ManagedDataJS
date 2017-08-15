export default class AbstractView {
	constructor(templateName, renderElement) {
		console.log("abstract view")
		$.ajaxSetup ({cache: false});
		this.renderElement = renderElement
		this.renderElement.load("src/js/implementations/templates/"+templateName, this.init.bind(this))
	}

	setController(controller) {
		this.controller = controller
	}

	init() {
		this.initActions()
		this.initLinks()		
		this.controller.viewLoaded()
	}

	initActions() {
		this.renderElement.find($(".action")).each((idx, element) => {
			element.addEventListener("click", () => {
				this.controller[$("#"+element.id).attr("event")]()
			})
		})
	}

	initLinks() {
		this.renderElement.find($(".link")).each((idx, element) => {
			element.addEventListener("click", () => {
				this.renderElement.find($(".active")).removeClass("active")
				console.log(element)
				this.controller["handleLink"](element.textContent)
				element.className += " active"
			})
		})
	}
}