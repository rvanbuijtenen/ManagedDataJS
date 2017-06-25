import * as run from "./runDoors.js";
import * as lockingMObject from "../../framework/lockingDataManager/lockingMObject.js";

export class RunLockingDoors extends run.RunDoors {

	initFactory() {
		this.factory = this.manager.factory(this.schema, lockingMObject.LockingMObject);
	}

	makeDoors() {
		let stateOpened = this.factory.state({"name": "opened", "belongs_to": this.machine});
		let stateClosed = this.factory.state({"name": "closed", "belongs_to": this.machine});

		let transOpen = this.factory.transition({
			"event": ["open"], 
			"from": stateClosed, 
			"to": stateOpened
		});

		let transClose = this.factory.transition({
			"event": ["close"],
			"from": stateOpened,
			"to": stateClosed
		});

		this.machine.start = stateClosed;
	}

	execute(...events) {
		for(let event of events) {
			for(let transition of this.machine.start.transitions_out) {
				if(transition.event == event) {
					this.machine.start = transition.to;
					console.log("Executed transition from state " + transition.from.name + " to state " + transition.to.name + " with event " + event);
				} else if (event == "lock") {
					this.machine.lock();
				} else if (event == "unlock") {
					this.machine.unlock();
				}
			}
		}
	}
}