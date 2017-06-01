
//import * as Point from "./schemas/pointSchema.js";
import * as MD4JS from "./datamanagers/basicDataManager.js";
import * as interpreter from "./schemaInterpreter/schemaInterpreter.js";
//import * as LMD4JS from "./loggingDataManager2.js";
//import * as Machine from "./machineSchema.js";
//import * as logger from "./loggingDataManager.js";

let Ajv = require('ajv');
let ajv = Ajv({allErrors: true});

class Main { 
    constructor(principal, years, rate) {	
		let pointSchema = require('./schemas/mountPointSchema.json');
		let i = new interpreter.SchemaInterpreter();
		let data = i.parseSchema(pointSchema);
		console.log(data);
		//l	
		//let Point = new MD4JS.BasicRecordFactory(pointSchema);
		//console.log(Point);
		//let aPoint = new Point.point(1,2);
		//console.log(aPoint);
		//aPoint.log("test", "something", "value");
		//aPoint.x = 5;

		//aPoint.lock();
		//aPoint.x = 7;
		//aPoint.unlock();
		//aPoint.x = 9;

		/*console.log(pointSchema);
		let Point = new MD4JS.BasicRecord(pointSchema);
		let LoggedPoint = new LMD4JS.LoggedRecord(pointSchema, "point.txt");
		console.log(LoggedPoint);
		//console.log(rec);
		let x2 = new LoggedPoint({"a": 1, "b": 2, "c": "testString", "d": [1,2,3], "e": false, "f": null, "g": 1, "h": {"x": 2, "y": 1, "parent": {"x": 2, "y": 2, "z": 2}}});
	
		let x = new Point({"a": 1, "b": 2, "c": "testString", "d": [1,2,3], "e": false, "f": null, "g": 1, "h": {"x": 2, "y": 1, "parent": {"x": 2, "y": 2, "z": 2}}});
		console.log(x);*/
		
		//var aPoint = new rec(5,6.5,"string",[1,2,3],false,null, "test",{"x":3,"y":5});
		//let loggedRec = new logger.LoggedRecord(rec);
		//console.log(aPoint);
		
		/*let mf = new MD4JS.BasicRecord(machineSchema);
		let m = mf.newMachine();
		let s1 = mf.newState();
		let s2 = mf.newState();
		let t1 = mf.newTransition();
		let t2 = mf.newTransition();
		
		m.start = s1;
		m.states = [s1,s2];
		s1.transitions.add(t1);
		s2.transitions.add(t2);*/
		
		
		/*
		var aPoint = new rec(1,2);
		console.log(aPoint);
		
		console.log("DEBUG INFO: assigning float to x (type must be integer)");
		rec.x = 1.2;
		
		console.log("\n\nDEBUG INFO: assigning integer to x (type must be integer)");
		//rec.x = 1;
			
		console.log("\n\nDEBUG INFO: assigning string to y (type must be integer)");
		rec.y = 'test';
		
		console.log("\n\nDEBUG INFO: assigning int to y (type must be integer)");
		//rec.y = 2;
		
		console.log("\n\nDEBUG INFO: assigning value of an unknown field to z");
		rec.z = rec.unknownField;*/
    }
}

document.getElementById('test').addEventListener('click', () => {
    let x = new Main();
});