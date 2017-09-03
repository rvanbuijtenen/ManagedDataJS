import DoorsController from "./DoorsController"

export default class GmailValidatorController extends DoorsController {
	execute() {
		super.execute()

		console.log("start name:", this.model.start.name)
		if(this.model.start.name == "mExtension") {
			this.view.renderValidation(
				this.eventLog.join(''), 
				this.errorCnt == 0)
			this.model.start = this.originalStart
			this.eventLog = []
		}
	}
}