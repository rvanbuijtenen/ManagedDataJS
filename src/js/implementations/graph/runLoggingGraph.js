import {Logging} from "../../framework/mixins/Logging";
import {DataManager} from "../../framework/dataManager/DataManager";
import {makeGraph, addLine, draw} from "./graph.js";

export class RunLoggingGraph {
	constructor() {
		$.ajaxSetup ({
		    // Disable caching of AJAX responses
		    cache: false
		});
		/* load schema and create basic data manager */
		let schema = require("./graphSchema.json");
		let manager = new DataManager(schema, Logging);

		/* create the doors machine */
		let graph = makeGraph(manager, "");

		let print = function(string) {
			$("#output").append("<p>"+string+"</p>");
		}

		/* initialize the UI */
        $("#content").load("src/js/implementations/graph/views/loggingGraph.html", function() {
        	$("#draw").click(function() {
        		let points = "["+$("#line").val()+"]";
    			let parsedPoints = JSON.parse(points);
        		let width = parseInt($("#width").val());
        		let color = $("#color").val();
        		console.log(width, color, parsedPoints, name);
				addLine(graph, manager, width, color, parsedPoints);
				draw(graph, $("#canvas")[0]);
			});
        });	 		
	}
}