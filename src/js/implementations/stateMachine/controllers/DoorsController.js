import AbstractController from "../../AbstractController"

export default class DoorsController extends AbstractController {
	constructor(model, view, manager) {
		super(model, view, manager)
        this.originalStart = model.start
        this.eventLog = []
        this.errorCnt = 0
	}

	viewLoaded() {
		this.view.renderInfo()
		this.view.renderCurrentState(this.model)
		this.view.renderMachine(this.model)
	}

	execute() {
		/* Initialize for execution */
        if(this.errorCnt > 0) {
            this.errorCnt = 0
            this.model.start = this.originalStart
            this.eventLog = []
            this.view.resetExecution()
        }
        let events = this.view.getEvents()
        this.eventLog = this.eventLog.concat(events)
        /* Attempt to execute each event */
        events.map((event) => {
            /* Attempt to execute each transition */
            let transition = this.model.start.transitions_out.map((transition) => {
                return {
                    success: transition.event.includes(event), 
                    from: transition.from, 
                    to: transition.to
                }
            }).reduce((acc, item) => {
                return item.success ? item : acc
            }, {success: false, from: this.model.start})

            /* Check if there was a valid transition, and if so execute it */
            if(transition.success) {
                this.model.start = transition.to
                this.view.renderExecution("Executed transition from "+transition.from.name+" to "+transition.to.name+" with event "+event)
            } else {
                this.errorCnt++
                this.view.renderExecution("State "+transition.from.name+" has no outgoing transitions with event "+event)
            }
        })


        this.view.renderCurrentState(this.model)
	}
}