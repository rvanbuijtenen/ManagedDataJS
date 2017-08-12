import DoorsController from "./DoorsController"

export default class GmailValidatorController extends DoorsController {
	execute() {
		let log = []
		let events = this.view.getEvents()
		let start = this.model.start
		// execute state machine
		try {
			log.push("<b>--$: </b>Validating email: ["+events.join("")+"]")
			for(let event of events) {
				let succes = false
				for(let trans of this.model.start.transitions_out) {
					if(trans.event.getValues().includes(event)) {
						this.model.start = trans.to
						log.push("<b>--$: </b>Executed transition from state " + trans.from.name + " to state " + trans.to.name + " with event " + event)
						succes = true
					}
				}
				if(succes == false) {
					this.view.renderExecution(log)
					this.view.renderError("<b>--$: </b>State " + this.model.start.name + " has no outgoing transitions with event " + event)
					this.view.renderValidation(events.join(""), "invalid")
					this.model.start = start
					return;
				}
			}
			this.view.renderExecution(log)
			if(this.model.start.name != "mExtension") {
				this.view.renderError("<b>--$: </b>There are no more events to process")
				this.view.renderValidation(events.join(""), "invalid")
			} else {
				this.view.renderError("<b>--$: </b>no errors occured while executing")
				this.view.renderValidation(events.join(""), "valid")
				
			}

		} catch (error) {
			this.view.renderValidation(events.join(""), "invalid")
			this.view.renderError("<b>--$: </b>"+error.message)
		}

		this.view.renderExecution(log)
		this.model.start = start
	}
}