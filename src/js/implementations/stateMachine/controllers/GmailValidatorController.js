import DoorsController from "./DoorsController"

export default class GmailValidatorController extends DoorsController {
	execute() {
		super.execute()

		var message = 'is not a gmail address'
		if(this.path[this.path.length - 1] == 'mExtension' && this.model.start.name == 'mExtension') {
			message = 'is a gmail address'
		}
		this.view.renderValidation(
			this.view.getEvents().join(''), 
			message)
	}
}