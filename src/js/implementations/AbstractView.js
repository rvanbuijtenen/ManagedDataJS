export default class AbstractView {
	constructor(templateName, renderElement) {
		console.log("abstract view:", renderElement)
		$.ajaxSetup ({cache: false});
		this.renderElement = renderElement

		this.elementId = templateName.split('/').pop().replace(/.html/, 'View')
		this.renderElement.append(`<div id="${this.elementId}"></div>`)
		this.renderElement = this.renderElement.find($("#"+this.elementId))
		this.renderElement.load("src/js/implementations/templates/"+templateName, this.init.bind(this))
	}

	setController(controller) {
		this.controller = controller
	}

	load() {
		this.renderElement.show()
		this.controller.viewLoaded()
	}

	init() {
		this.initActions()
		this.load()
	}

	unload() {
		this.renderElement.hide()
		this.controller.afterUnload()
	}

	initActions() {
		this.renderElement.find($(".action")).each((idx, element) => {
			element.addEventListener("click", () => {
				console.log($("#"+element.id).attr("event"))
				this.controller[$("#"+element.id).attr("event")]()
			})
		})
	}
	/*
	initLinks() {
		this.renderElement.find($(".link")).each((idx, element) => {
			element.addEventListener("click", () => {
				this.renderElement.find($(".active")).removeClass("active")
				console.log(element)
				this.controller["handleLink"](element.textContent)
				element.className += " active"
			})
		})
	}*/
}