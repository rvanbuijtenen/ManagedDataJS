import DoorsView from "./DoorsView"

export default class GmailValidatorView extends DoorsView {
	getEvents() {
		return this.renderElement.find($("#events")).val().split("")
	}

	renderInfo() {
		this.renderElement.find($("#info")).append(`
			<h1>Gmail validator state machine using MD4JS</h1>
			<p>
				The gmail validator is a different implementation of the state machine. 
				The state machine is modeled in such way that going from the start state to the 
				final state represents the regular expression "/^[a-z0-9]+@gmail.com$/". It then
				prints whether the given input is a valid gmail address.
			</p>`)
	}

	renderValidation(input, output) {
		this.renderElement.find($("#machine-validation")).append(
			"<div>email address <i>"+input+"</i> is: <b>"+output+"</b></div>"
		)
	}
}