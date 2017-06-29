import * as bdm from "../../framework/basicDataManager/basicDataManager";
import * as locking from "../../framework/lockingDataManager/lockingMObject.js";
import * as stateMachine from "./stateMachine.js";

export class RunLockingDoors {
	constructor(description) {
		$.ajaxSetup ({
		    // Disable caching of AJAX responses
		    cache: false
		});
		/* load schema and create basic data manager */
		let schema = require("./machineSchema.json");
		let manager = new bdm.BasicDataManager(schema, locking.LockingMObject);

		/* create the doors machine */
		let doors = stateMachine.makeDoors(manager);

		let print = function(string) {
			$("#output").append("<p>"+string+"</p>");
		}

		/* initialize the UI */
        $("#content").load("src/js/implementations/stateMachine/views/lockingDoors.html", function() {
        	$("#execute").click(function() {
			 	console.log("click event");
		        let value = $("#events").val().split(",");
				stateMachine.printMachine(doors, print);
			});

			$("#lock").click(function() {
				doors.lock();
			});

			$("#unlock").click(function() {
				doors.unlock();
			});
        });	 		
	}
}