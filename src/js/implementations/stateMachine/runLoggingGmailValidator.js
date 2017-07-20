import {DataManager} from "../../framework/dataManager/DataManager"
import {Logging} from "../../framework/mixins/Logging"
import {Persistence} from "../../framework/mixins/Persistence"
import {makeValidator, execute, printMachine} from "./stateMachine"

export class RunLoggingGmailValidator {
	constructor(description) {
		$.ajaxSetup ({
		    // Disable caching of AJAX responses
		    cache: false
		});
		/* load schema and create basic data manager */
		let schema = require("./machineSchema.json")
		let manager = new DataManager(schema, logging.LoggingMObject)

		/* create the validator machine */
		let validator = makeValidator(manager)
		let originalStart = validator.start

		let print = function(string) {
			$("#output").append("<p>"+string+"</p>")
		}

		let printValid = function(string) {
			$("#valid").append("<h2>"+string+"</h2>")
		}

		/* initialize the UI */
        $("#content").load("src/js/implementations/stateMachine/views/validator.html", function() {
        	$("#execute").click(function() {
        		let value = $("#events").val()
		        let values = value.split("")
				if(execute(validator, values, print) && validator.start.transitions_out.getValues().length == 0){
					printValid(value + " is a valid Gmail Address")
				} else {
					printValid(value + " is <b>not</b> a valid Gmail Address")
				}
				validator.start = originalStart
			})
        })	 		
	}
}