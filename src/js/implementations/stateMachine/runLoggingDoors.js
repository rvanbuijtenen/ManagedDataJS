import * as bdm from "../../framework/basicDataManager/basicDataManager";
import * as logging from "../../framework/loggingDataManager/loggingMObject.js";
import * as stateMachine from "./stateMachine.js";

export class RunLoggingDoors {
	constructor(description) {
		$.ajaxSetup ({
		    // Disable caching of AJAX responses
		    cache: false
		});
		/* load schema and create basic data manager */
		let schema = require("./machineSchema.json");
		let manager = new bdm.BasicDataManager(schema, logging.LoggingMObject);

		/* create the doors machine */

		let print = function(string) {
			$("#output").append("<p>"+string+"</p>");
		}

		let doors = stateMachine.makeDoors(manager);

		/* initialize the UI */
        $("#content").load("src/js/implementations/stateMachine/views/loggingDoors.html", function() {
        	$("#execute").click(function() {
		        let value = $("#events").val().split(",");
		        let outputType = $("#outputType").val();
				stateMachine.execute(doors, value, print);
				stateMachine.printMachine(doors, print);
			});
        });	 		
	}
}