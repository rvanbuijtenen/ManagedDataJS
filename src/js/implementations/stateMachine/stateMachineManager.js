import * as bdm from "../../framework/basicDataManager/basicDataManager.js";

export class StateMachineManager extends bdm.BasicDataManager {
	constructor(factory, schema) {
		super(factory, schema);

		this.machine = new this.factory.machine();
	}

	change(event) {
		for(let t of this.machine.start.transitions_out) {
			if(t.event == event) {
				this.machine.start = t.to;
				console.log("Executing transition from "+t.from.name+" to "+t.to.name+" with event "+t.event);
				/* transition was succesful */
				return true;
			}
		}
		/* transition failed */
		console.log("Cannot execute event "+event+": state "+this.machine.start.name+" has no outgoing transitions with that event");
		return false;
	}

	printMachine() {
		console.log("Machine: "+this.machine.name);
		console.log("start state: "+this.machine.start.name);
		console.log("States:");
		for(let s of this.machine.states) {
			console.log("  "+s.name)
			console.log("    transitions_in for "+ s.name+":");
			for(let t of s.transitions_in) {
				console.log("      "+t.from.name+" -> "+t.event+" -> "+t.to.name);
			}
			console.log("    transitions_out for "+ s.name+":");
			for(let t of s.transitions_in) {
				console.log("      "+t.from.name+" -> "+t.event+" -> "+t.to.name);
			}
		}
	}
}