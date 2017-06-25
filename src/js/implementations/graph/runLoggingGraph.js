import * as runGraph from "./runGraph.js";
import * as loggingMObject from "../../framework/loggingDataManager/loggingMObject.js";

export class RunLoggingGraph extends runGraph.RunGraph {
	constructor(description) {
		if(description == undefined) {
			super("<p>This example demonstrates the implementation of a logging graph drawing program using data managers. New graphs can be created by filling in a unique name for the graph, or existing graphs can be updated by filling in an exisiting name.</p><p>The graph editor supports the following line types:<br>straight lines<br>quadratic lines<br>bezier lines</p><p>To add a line, fill in point coordinates separated by commas and enclosed in square brackets []. The points themselves should also be separated by commas.<br> An example would be: [0,0],[1,2],[2,4]</p><p>The following notations define the type of line:<br>linear: [x,y]<br>quadratic: [control_x, control_y, x, y]<br>bezier: [control_x1, control_y1, control_x2, control_y2, x, y]</p><p>After creating a graph the log output can be found in the output element below the canvas");		
		} else {
			super(description);
		}
	}

	createUi() {
		super.createUi();
		let logOutput = document.createElement("div");
		logOutput.id = "logOutput";
		document.body.appendChild(logOutput);
	}

	initFactory() {
		this.factory = this.manager.factory(this.schema, loggingMObject.LoggingMObject);
	}
}