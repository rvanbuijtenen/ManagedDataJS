import * as bdm from "../../framework/basicDataManager/basicDataManager";
import * as logging from "../../framework/loggingDataManager/loggingMObject.js";
import * as persistence from "../../framework/persistentDataManager/persistentMObject.js";
import * as stateMachine from "./stateMachine.js";

export class RunLoggingGmailValidator {
	constructor(description) {
		$.ajaxSetup ({
		    // Disable caching of AJAX responses
		    cache: false
		});
		/* load schema and create basic data manager */
		let schema = require("./machineSchema.json");
		let manager = new bdm.BasicDataManager(schema, logging.LoggingMObject);

		/* create the doors machine */
		let doors = stateMachine.makeValidator(manager);

		let print = function(string) {
			$("#output").append("<p>"+string+"</p>");
		}

		let printValid = function(string) {
			$("#valid").append("<h2>"+string+"</h2>");
		}

		/* initialize the UI */
        $("#content").load("src/js/implementations/stateMachine/views/validator.html", function() {
        	$("#execute").click(function() {
        		let value = $("#events").val();
		        let values = value.split("");
				if(stateMachine.execute(doors, values, print)){
					printValid(value + " is a valid Gmail Address");
				} else {
					printValid(value + " is <b>not</b> a valid Gmail Address");
				}
			});
        });	 		
	}
}