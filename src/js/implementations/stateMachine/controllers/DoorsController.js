import AbstractController from "../../AbstractController"
import {executeMachine} from ".."

export default class DoorsController extends AbstractController {
	constructor(model, view, manager) {
		super(model, view, manager)
        this.originalStart = model.start
        this.eventLog = []
        this.errorCnt = 0
        this.model = model
	}

	viewLoaded() {
		this.view.renderInfo()
		this.view.renderCurrentState(this.model)
		this.view.renderMachine(this.model)
	}

    reinit() {
        /* Initialize for execution */
        this.model.start = this.originalStart
        this.view.resetExecution()
    }

	execute() {
        this.reinit()
        let events = this.view.getEvents()
        this.path = executeMachine(this.model, events)
        this.view.renderExecution(this.path)
        this.view.renderCurrentState(this.model)
	}
}