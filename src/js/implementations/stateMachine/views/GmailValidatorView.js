import DoorsView from "./DoorsView"

export default class GmailValidatorView extends DoorsView {
	getEvents() {
		return this.renderElement.find($("#events")).val().split("")
	}

	renderValidation(input, output) {
		this.renderElement.find($("#machine-validation")).append(
			"<div>email address <i>"+input+"</i> is: <b>"+output+"</b></div>"
		)
	}
}