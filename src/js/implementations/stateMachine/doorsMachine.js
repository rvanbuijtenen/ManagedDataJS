import * as stateMachine from "./stateMachineManager.js";

export class Doors extends stateMachine.StateMachineManager {
	constructor(factory, schema) {
		super(factory, schema);

		this.machine.name = "doors";

		let stateOpened = new this.factory.state({"name": "opened", "belongs_to": this.machine});
		let stateClosed = new this.factory.state({"name": "closed", "belongs_to": this.machine});

		let transOpen = new this.factory.transition(
			{"event": "open", 
			"from": stateClosed, 
			"to": stateOpened}
		);

		let transClose = new this.factory.transition(
			{"event": "close",
			"from": stateOpened,
			"to": stateClosed}
		);

		this.machine.start = stateClosed;
	}
}