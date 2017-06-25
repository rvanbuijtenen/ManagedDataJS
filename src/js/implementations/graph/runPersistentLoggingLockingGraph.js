import * as runPersistentGraph from "./runPersistentGraph.js";
import * as persistentMObject from "../../framework/persistentDataManager/persistentMObject.js";
import * as loggingMObject from "../../framework/loggingDataManager/loggingMObject.js";
import * as lockingMObject from "../../framework/lockingDataManager/lockingMObject.js";

export class RunPersistentLoggingLockingGraph extends runPersistentGraph.RunPersistentGraph {
	constructor(description) {
		if(description == undefined) {
			super("<p>This example demonstrates the implementation of a logging graph drawing program using data managers. New graphs can be created by filling in a unique name for the graph, or existing graphs can be updated by filling in an exisiting name.</p><p>The graph editor supports the following line types:<br>straight lines<br>quadratic lines<br>bezier lines</p><p>To add a line, fill in point coordinates separated by commas and enclosed in square brackets []. The points themselves should also be separated by commas.<br> An example would be: [0,0],[1,2],[2,4]</p><p>The following notations define the type of line:<br>linear: [x,y]<br>quadratic: [control_x, control_y, x, y]<br>bezier: [control_x1, control_y1, control_x2, control_y2, x, y]</p><p>After creating a graph the log output can be found in the output element below the canvas");		
		} else {
			super(description);
		}
	}

	createUi() {
		super.createUi();
		let logOutput = document.createElement("div");
		logOutput.id = "logOutput";
		document.body.appendChild(logOutput);

		this.createLockUnlockButton();
	}

	createLockUnlockButton() {
		let tr1 = document.createElement("tr");
		let td1 = document.createElement("td");
		let td2 = document.createElement("td");

		let lockButton = document.createElement("button");
		lockButton.classList.add ("btn");
		lockButton.classList.add("btn-default");
		lockButton.innerHTML = "Lock Graph";
		let rpg = this;
		lockButton.onclick = function() {
			rpg.lock();
		}

		td2.appendChild(lockButton);
		tr1.appendChild(td1);
		tr1.appendChild(td2);
		

		let tr2 = document.createElement("tr");
		let td3 = document.createElement("td");
		let td4 = document.createElement("td");
		

		let unlockButton = document.createElement("button");
		unlockButton.classList.add ("btn");
		unlockButton.classList.add("btn-default");
		unlockButton.innerHTML = "Unlock Graph";
		unlockButton.onclick = function() {
			rpg.unlock();
		}

		td4.appendChild(unlockButton);
		tr2.appendChild(td3);
		tr2.appendChild(td4);

		$("#menuTable").append(tr1);
		$("#menuTable").append(tr2);

	}

	lock() {
		this.graph.lock();
	}

	unlock() {
		this.graph.unlock();
	}

	initFactory() {
		this.factory = this.manager.factory(
			this.schema, 
			loggingMObject.LoggingMObject, 
			persistentMObject.PersistentMObject, 
			lockingMObject.LockingMObject
		);
	}
}