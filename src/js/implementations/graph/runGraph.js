import * as bdm from "../../framework/basicDataManager/basicDataManager.js";
import * as graphProgram from "./graph.js";

export class RunGraph {
	constructor() {
		$.ajaxSetup ({
		    // Disable caching of AJAX responses
		    cache: false
		});
		/* load schema and create basic data manager */
		let schema = require("./graphSchema.json");
		let manager = new bdm.BasicDataManager(schema);

		/* create the doors machine */
		let graph = graphProgram.makeGraph(manager, "");

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
        		console.log(width, color, parsedPoints, name);
				graphProgram.addLine(graph, manager, width, color, parsedPoints);
				graphProgram.draw(graph, $("#canvas")[0]);
			});
        });	 		
	}
}
