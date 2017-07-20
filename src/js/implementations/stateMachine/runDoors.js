import {DataManager} from "../../framework/dataManager/DataManager";
import {makeDoors, execute, printMachine} from "./stateMachine";

export class RunDoors {
	constructor(description) {
		$.ajaxSetup ({
		    // Disable caching of AJAX responses
		    cache: false
		});
		/* load schema and create basic data manager */
		let schema = require("./machineSchema.json");
		let manager = new DataManager(schema);

		/* create the doors machine */
		let doors = makeDoors(manager);

		let print = function(string) {
			$("#output").append("<p>"+string+"</p>");
		}

		/* initialize the UI */
        $("#content").load("src/js/implementations/stateMachine/views/doors.html", function() {
        	$("#execute").click(function() {
		        let value = $("#events").val().split(",");
				execute(doors, value, print);
				printMachine(doors, print);
			});
        });	 		
	}
}