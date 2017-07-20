import {DataManager} from "../../framework/dataManager/DataManager";
import {Locking} from "../../framework/mixins/Locking";
import {makeDoors, execute, printMachine} from "./stateMachine";

export class RunLockingDoors {
	constructor(description) {
		$.ajaxSetup ({
		    // Disable caching of AJAX responses
		    cache: false
		});
		/* load schema and create basic data manager */
		let schema = require("./machineSchema.json");
		let manager = new DataManager(schema, Locking);

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
		        execute(doors, value, print)
				printMachine(doors, print);
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