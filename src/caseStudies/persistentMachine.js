const uuidV1 = require('uuid/v1');

class persistentMachine {
	constructor() {
		this.machineName = "";
		this.start = {};
		this.states = [];
		this.id = uuidV1();
	}

	setName(name) {
		if(!name instanceof String) {
			throw new TypeError("the provided name is not a valid string");
		}
		this.machineName = name;
	}

	setStart(state) {
		if(!state instanceof persistentState) {
			throw new TypeError("the provided startState is not a valid state");
		}
		this.start = state;
	}

	addState(state) {
		if(!state instanceof persistentState) {
			throw new TypeError("the provided state is not a valid state");
		}
		this.states.push(state);
	}

	save() {
		localStorage.setItem(this.id, JSON.stringify({"machineName: ": this.machineName}));
	}

	load(id) {
		let item = localStorage.getItem(id);
		for(let propKey in item) {
			this[propKey] = item[propKey];
		}
	}
}

class persistentState {
	constructor() {
		this.stateName = "";
		this.transitions_in = [];
		this.transitions_out = [];
		this.id = uuidV1();
	}

	setName(name) {
		if(!name instanceof String) {
			throw new TypeError("the provided name is not a valid string");
		}
		this.stateName = name;
	}

	addTransitionIn(transition) {
		if(!transition instanceof persistentTransition) {
			throw new TypeError("the provided incoming transition is not a valid transition");
		}
		this.transitions_in.add(transition);
	}

	addTransitionOut(transition) {
		if(!transition instanceof persistentTransition) {
			throw new TypeError("the provided outgoing transition is not a valid transition");
		}
		this.transitions_out.add(transition);
	}

	save() {
		localStorage.setItem(this.id, {"stateName": this.stateName});
	}

	load(id) {
		let item = localStorage.getItem(id);
		for(let propKey in item) {
			this[propKey] = item[propKey];
		}	
	}
}

class persistentTransition {
	constructor() {
		this.event = "";
		this.from = {};
		this.to = {};
		this.id = uuidV1();
	}

	setEvent(event) {
		if(!event instanceof String) {
			throw new TypeError("the provided event is not a valid string");
		}
		this.event = event;
	}

	setFrom(state) {
		if(!state instanceof persistentState) {
			throw new TypeError("the provided startState is not a valid state");
		}
		this.from = state;
		this.from.addTransitionOut(this);
	}


	setTo(state) {
		if(!state instanceof persistentState) {
			throw new TypeError("the provided state is not a valid state");
		}
		this.to = state;
		this.to.addTransitionIn(this);
	}

	save() {
		localStorage.setItem(this.id, {"event": this.event});
	}

	load(id) {
		let item = localStorage.getItem(id);
		for(let propKey in item) {
			this[propKey] = item[propKey];
		}	
	}
}