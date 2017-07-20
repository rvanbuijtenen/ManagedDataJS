import {DataManager} from "../../framework/dataManager/DataManager";
import {Logging} from "../../framework/mixins/Logging";
import {makeDoors, execute, printMachine} from "./stateMachine";

export class RunLoggingDoors {
	constructor(description) {
		$.ajaxSetup ({
		    // Disable caching of AJAX responses
		    cache: false
		});
		/* load schema and create basic data manager */
		let schema = require("./machineSchema.json");
		let manager = new DataManager(schema, Logging);

		/* create the doors machine */

		let print = function(string) {
			$("#output").append("<p>"+string+"</p>");
		}

		let doors = makeDoors(manager);

		/* initialize the UI */
        $("#content").load("src/js/implementations/stateMachine/views/loggingDoors.html", function() {
        	$("#execute").click(function() {
		        let value = $("#events").val().split(",");
		        let outputType = $("#outputType").val();
				execute(doors, value, print);
				printMachine(doors, print);
			});
        });	 		
	}
}