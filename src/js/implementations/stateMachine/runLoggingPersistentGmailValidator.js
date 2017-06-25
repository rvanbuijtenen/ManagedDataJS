import * as runLogging from "./runLoggingDoors.js";
import * as persistentMObject from "../../framework/persistentDataManager/persistentMObject.js";
import * as loggingMObject from "../../framework/loggingDataManager/loggingMObject.js";

export class RunLoggingPersistentGmailValidator extends runLogging.RunLoggingDoors {

	initFactory() {
		this.factory = this.manager.factory(
			this.schema,
			loggingMObject.LoggingMObject, 
			persistentMObject.PersistentMObject
		);
	}

	makeDoors() {
		let start = this.factory.state({"name": "start", "belongs_to": this.machine}, this.factory, "start");
		let prefix = this.factory.state({"name": "prefix", "belongs_to": this.machine}, this.factory, "prefix");
		let at = this.factory.state({"name": "@", "belongs_to": this.machine}, this.factory, "@");
		let g = this.factory.state({"name": "g", "belongs_to": this.machine}, this.factory, "g");
		let m = this.factory.state({"name": "m", "belongs_to": this.machine}, this.factory, "m");
		let a = this.factory.state({"name": "a", "belongs_to": this.machine}, this.factory, "a");
		let i = this.factory.state({"name": "i", "belongs_to": this.machine}, this.factory, "i");
		let l = this.factory.state({"name": "l", "belongs_to": this.machine}, this.factory, "l");
		let dot = this.factory.state({"name": ".", "belongs_to": this.machine}, this.factory, ".");
		let c = this.factory.state({"name": "c", "belongs_to": this.machine}, this.factory, "c");
		let o = this.factory.state({"name": "o", "belongs_to": this.machine}, this.factory, "o");
		let mEx = this.factory.state({"name": "m", "belongs_to": this.machine}, this.factory, "mEx");

		let transStart = this.factory.transition({
			"event": ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0",], 
			"from": start, 
			"to": prefix
			},
			this.factory,
			"transitionStart"
		);

		let transPrefix = this.factory.transition({
			"event": ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0",], 
			"from": prefix, 
			"to": prefix
			},
			this.factory,
			"transitionPrefix"
		);

		let transAt = this.factory.transition({
			"event": ["@"],
			"from": prefix,
			"to": at
			},
			this.factory,
			"transition@"
		);

		let transG = this.factory.transition({
			"event": ["g"],
			"from": at,
			"to": g
			},
			this.factory,
			"transitionG"
		);

		let transM = this.factory.transition({
			"event": ["m"],
			"from": g,
			"to": m
			},
			this.factory,
			"transitionM"
		);

		let transA = this.factory.transition({
			"event": ["a"],
			"from": m,
			"to": a
			},
			this.factory,
			"transitionA"
		);

		let transI = this.factory.transition({
			"event": ["i"],
			"from": a,
			"to": i
			},
			this.factory,
			"transitionI"
		);

		let transL = this.factory.transition({
			"event": ["l"],
			"from": i,
			"to": l
			},
			this.factory,
			"transitionL"
		);

		let transDot = this.factory.transition({
			"event": ["."],
			"from": l,
			"to": dot
			},
			this.factory,
			"transition."
		);

		let transC = this.factory.transition({
			"event": ["c"],
			"from": dot,
			"to": c
			},
			this.factory,
			"transitionC"
		);

		let transO = this.factory.transition({
			"event": ["o"],
			"from": c,
			"to": o
			},
			this.factory,
			"transitionO"
		);

		let transMEx = this.factory.transition({
			"event": ["m"],
			"from": o,
			"to": mEx
			},
			this.factory,
			"transitionMEx"
		);

		this.machine.start = start;
	}

	execute(events) {
		if(events.length != 1) {
			return;
		}
		console.log(events);

		let eventsList = events[0].split("");
		console.log(this.machine);
		for(let event of eventsList) {
			for(let transition of this.machine.start.transitions_out) {
				if(transition.event.getValues().includes(event)) {
					this.machine.start = transition.to;
					console.log("Executed transition from state " + transition.from.name + " to state " + transition.to.name + " with event " + event);
				}
			}
		}
	}

	save() {
		this.machine.save();
	}

	load() {
		console.log("loading");
	}
}