import {Persistence} from "../../framework/mixins/Persistence";
import {DataManager}from "../../framework/dataManager/DataManager.js";
import {makePersistentGraph, addPersistentLine, draw} from "./graph.js";

export class RunPersistentGraph {
	constructor() {
		$.ajaxSetup ({
		    // Disable caching of AJAX responses
		    cache: false
		});
		/* load schema and create basic data manager */
		let schema = require("./graphSchema.json");
		let manager = new DataManager(schema, Persistence);

		/* create the doors machine */
		let graph = makePersistentGraph(manager, "");

		let print = function(string) {
			$("#output").append("<p>"+string+"</p>");
		}

		/* initialize the UI */
        $("#content").load("src/js/implementations/graph/views/persistentGraph.html", function() {
        	let saves = JSON.parse(localStorage.getItem("savedGraphs"));
        	if(saves != null) {
        		for(let save of saves) {
        			let opt = document.createElement("option");
					opt.value = save;
					opt.innerHTML = save;
					$("#savedGraphs").append(opt);	
				}
        	}
        	
        	$("#draw").click(function() {
        		let points = "["+$("#line").val()+"]";
    			let parsedPoints = JSON.parse(points);
        		let width = parseInt($("#width").val());
        		let color = $("#color").val();
        		let name = $("#name").val();
        		if(name != graph.name) {
        			graph = makePersistentGraph(manager, name);
        		}
				addPersistentLine(graph, manager, width, color, parsedPoints);
				draw(graph, $("#canvas")[0]);
			});

			$("#save").click(function() {
				let item = localStorage.getItem("savedGraphs");
				let savedGraphs = [];
				if(item != null) {
					savedGraphs = JSON.parse(item);
				}

				if(!savedGraphs.includes(graph.getId())) {
					savedGraphs.push(graph.getId());

					let opt = document.createElement("option");
					opt.value = graph.getId();
					opt.innerHTML = graph.getId();
					$("#savedGraphs").append(opt);
				}
				localStorage.setItem("savedGraphs",JSON.stringify(savedGraphs));
				

				graph.save();
			});

			$("#load").click(function() {
				let graphId = $("#savedGraphs").val();
				graph = manager.graph({}, manager, graphId);
				graph.load();
				draw(graph, $("#canvas")[0]);

				$("#name")[0].value = graph.name;
			});
        });	 		
	}
}