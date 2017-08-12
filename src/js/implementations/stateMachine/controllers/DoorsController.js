import AbstractController from "../../AbstractController"

export default class DoorsController extends AbstractController {
	constructor(model, view, manager) {
		super(model, view, manager)
	}

	viewLoaded() {
		this.view.renderCurrentState(this.model)
		this.view.renderMachine(this.model)
		this.view.renderExecution(["<b>--$: </b>no events have been executed yet"])
		this.view.renderError(["<b>--$: </b>no errors occured while executing"])
	}

	execute() {
		let log = []
		let events = this.view.getEvents()
		let start = this.model.start
		log.push("<b>--$: </b>Executing event sequence: ["+events.join(",")+"]")
		try {
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
					this.view.renderCurrentState(this.model)
					this.view.renderError("<b>--$: </b>State " + this.model.start.name + " has no outgoing transitions with event " + event)
					return;
				}
			}
			this.view.renderError("<b>--$: </b>no errors occured while executing")
		} catch (error) {
			this.view.renderExecution(log)
			this.view.renderError("<b>--$: </b>"+error.message)
		}
		this.view.renderExecution(log)
		this.view.renderCurrentState(this.model)
	}
}