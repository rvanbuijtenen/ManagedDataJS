import AbstractView from "../../AbstractView"

export default class DocumentationView extends AbstractView {
	renderTemplate(templateName) {
		this.renderElement.find($("#template")).load("src/js/implementations/templates/documentation/"+templateName, this.initActions.bind(this))
	}
}