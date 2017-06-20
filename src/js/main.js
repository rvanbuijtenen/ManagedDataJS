
//import * as Point from "./schemas/pointSchema.js";
/*import * as stateMachine from "./datamanagers/stateMachine/stateMachineDataManager.js";
import * as MD4JS from "./datamanagers/basicDataManager.js";
import * as logging from "./datamanagers/loggingManager/LoggingManager.js";
import * as locking from "./datamanagers/lockingManager/lockingDataManager.js";
import * as interpreter from "./schemaInterpreter/schemaInterpreter.js";
import * as testingSuite from "./testingSuite/tester.js";*/
//import * as LMD4JS from "./loggingDataManager2.js";
//import * as Machine from "./machineSchema.js";
//import * as logger from "./loggingDataManager.js";

import * as doorsMachine from "./implementations/stateMachine/doorsMachine.js";
import * as basicFactory from "./framework/basicDataManager/basicRecordFactory.js";
import * as loggingFactory from "./framework/loggingDataManager/loggingFactory.js";
import * as lockingFactory from "./framework/lockingDataManager/lockingFactory.js";
import * as graphManager from "./implementations/graph/graphManager.js";

class Main { 
    constructor() {

    	/**
    	 * Basic Doors Example
    	 */
    	let schema = require("./implementations/stateMachine/machineSchema.json");
    	let doorsManager = new doorsMachine.Doors(basicFactory.BasicRecordFactory, schema);

    	console.log("Doors Machine Example")
    	console.log("____________________________________________________________");
    	console.log("Machine after initialization:");
    	doorsManager.printMachine();

    	console.log("____________________________________________________________");
    	console.log("Executing state transitions:");
    	doorsManager.change("open");

    	console.log("____________________________________________________________");
    	console.log("Machine after executing transitions:");
    	doorsManager.printMachine();

    	/**
    	 * Logging Doors example
    	 */
    	console.log("\n\n\nExecuting Logged Record Example\n____________________________________________________________");
    	let loggingDoorsManager = new doorsMachine.Doors(loggingFactory.LoggingRecordFactory, schema);


    	/**
    	 *	Locking Doors Example
    	 */
    	console.log("\n\n\nExecuting Locking Record Example\n____________________________________________________________");
    	let lockingDoorsManager = new doorsMachine.Doors(lockingFactory.LockingRecordFactory, schema);

    	console.log("\nlocking machine");
    	lockingDoorsManager.machine.lock();

    	console.log("\nexception when trying to open:")
    	try{ 
    		lockingDoorsManager.change("open");
    	} catch (err) {
    		console.log(err.message);
    	}

    	console.log("\nunlocking machine and opening door");
    	lockingDoorsManager.machine.unlock();

    	lockingDoorsManager.change("open");

    	console.log("\nMachine after opening:");
    	lockingDoorsManager.printMachine()


    	/**
    	 * Graph Drawing Example
    	 */
    	let canvas = document.createElement('canvas');
		canvas.id     = "CursorLayer";
		canvas.width  = 1224;
		canvas.height = 768;
		canvas.style.zIndex   = 8;
		canvas.style.position = "absolute";
		canvas.style.border   = "1px solid";
    	document.getElementById('canvas').appendChild(canvas);

    	let graphSchema = require("./implementations/graph/graphSchema.json");
    	let gm = new graphManager.GraphManager(basicFactory.BasicRecordFactory, graphSchema);

    	gm.addLine("red", 2, [0,0], [1,1], [2,2], [3,4], [4,8]);
    	gm.addLine("blue", 5, [0,0], [4,0,4,8]);
    	gm.addLine("green", 10, [0,0], [0,8,4,8,4,0])
    	gm.addLine("black", 4, [0,10], [0,0,1,4],[2,6],[4,10,4,0,2,0])

    	gm.draw(canvas);	
    }
}

document.getElementById('test').addEventListener('click', () => {
    let x = new Main();
});