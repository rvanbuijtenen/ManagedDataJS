import {DataManager} from "../../framework/dataManager/DataManager";
import {makeGraph, addLine, draw} from "./graph";

export class RunGraph {
	constructor() {
		$.ajaxSetup ({
		    // Disable caching of AJAX responses
		    cache: false
		});
		/* load schema and create basic data manager */
		let schema = require("./graphSchema.json");
		let manager = new DataManager(schema);

		/* create the doors machine */
		let graph = makeGraph(manager, "");

		let print = function(string) {
			$("#output").append("<p>"+string+"</p>");
		}

		/* initialize the UI */
        $("#content").load("src/js/implementations/graph/views/graph.html", function() {
        	$("#draw").click(function() {
        		let points = "["+$("#line").val()+"]";
    			let parsedPoints = JSON.parse(points);
        		let width = parseInt($("#width").val());
        		let color = $("#color").val();
				addLine(graph, manager, width, color, parsedPoints);
				draw(graph, $("#canvas")[0]);
			});
        });	 		
	}
}
