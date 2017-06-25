import * as bdm from "../../framework/basicDataManager/basicDataManager";

export class RunDoors {
	constructor(description) {
		this.manager = new bdm.BasicDataManager();
		this.createUi();
		this.schema = require("./machineSchema.json");
		this.initFactory();
		this.machine = this.factory.machine({"name": "doors machine"});
		this.makeDoors();
		
		this.printMachine();
	}

	createUi() {
		$("#content").empty();

		console.log("generating UI");
		let table = document.createElement("table");
		let tr = document.createElement("tr");
		let td1 = document.createElement("td");
		let td2 = document.createElement("td");
		td2.id = "logOutput";

		let menuTable = document.createElement("table");
		td1.appendChild(menuTable);
		this.menuTable = menuTable;

		let tr1 = document.createElement("tr");
		let td3 = document.createElement("td");
		let td4 = document.createElement("td");
		td3.innerHTML = "event sequence";
		td4.innerHTML = "<textArea id='events'></textArea>";

		tr1.appendChild(td3);
		tr1.appendChild(td4);

		menuTable.appendChild(tr1);

		let tr2 = document.createElement("tr");
		let td5 = document.createElement("td");
		let td6 = document.createElement("td");
		let runDoors = this;
		let executeButton = document.createElement("button");
		executeButton.innerHTML = "Execute Events";
		executeButton.onclick = function () {
			console.log("["+$("#events").val()+"]");
			runDoors.execute(JSON.parse("["+$("#events").val()+"]"));
		}

		td6.appendChild(executeButton);
		tr2.appendChild(td5);
		tr2.appendChild(td6);
		menuTable.appendChild(tr2);

		tr.appendChild(td1);
		tr.appendChild(td2);

		table.appendChild(tr);

		$("#content").append(table);
	}

	initFactory() {
		this.factory = this.manager.factory(this.schema);
	}

	makeDoors() {

		let stateOpened = this.factory.state({"name": "opened", "belongs_to": this.machine});
		let stateClosed = this.factory.state({"name": "closed", "belongs_to": this.machine});
		let stateLocked = this.factory.state({"name": "locked", "belongs_to": this.machine});

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

		let transLock = this.factory.transition({
			"event": ["lock"],
			"from": stateClosed,
			"to": stateLocked
		});

		let transUnlock = this.factory.transition({
			"event": ["unlock"],
			"from": stateLocked,
			"to": stateClosed
		});

		this.machine.start = stateClosed;
	}

	execute(...events) {
		console.log(this.machine);
		for(let event of events) {
			for(let transition of this.machine.start.transitions_out) {
				if(transition.event == event) {
					this.machine.start = transition.to;
					console.log("Executed transition from state " + transition.from.name + " to state " + transition.to.name + " with event " + event);
				}
			}
		}
	}

	printMachine() {
		console.log("Machine: "+this.machine.name);
		console.log("start state: "+this.machine.start.name);
		console.log("States:");
		for(let s of this.machine.states) {
			console.log("  "+s.name)
			console.log("    transitions_in for "+ s.name+":");
			for(let t of s.transitions_in) {
				console.log("      "+t.from.name+" -> "+JSON.stringify(t.event.getValues())+" -> "+t.to.name);
			}
			console.log("    transitions_out for "+ s.name+":");
			for(let t of s.transitions_out) {
				console.log("      "+t.from.name+" -> "+JSON.stringify(t.event.getValues())+" -> "+t.to.name);
			}
		}
	}
}