
//import * as Point from "./schemas/pointSchema.js";
import * as stateMachine from "./datamanagers/stateMachine/stateMachineDataManager.js";
import * as MD4JS from "./datamanagers/basicDataManager.js";
import * as interpreter from "./schemaInterpreter/schemaInterpreter.js";
import * as testingSuite from "./testingSuite/tester.js";
//import * as LMD4JS from "./loggingDataManager2.js";
//import * as Machine from "./machineSchema.js";
//import * as logger from "./loggingDataManager.js";

let Ajv = require('ajv');
let ajv = Ajv({allErrors: true});

class Main { 
    constructor() {
    	let doorsManager = new stateMachine.MachineDataManager();

    	console.log("____________________________________________________________");
    	console.log("Machine after initialization:");

    	doorsManager.printMachine();

    	console.log("____________________________________________________________");

    	console.log("Executing state transitions:");

    	doorsManager.change("open");
    	doorsManager.change("close");
    	doorsManager.change("open");

    	console.log("____________________________________________________________");

    	console.log("Machine after executing transitions:");

    	doorsManager.printMachine();
    	
    	console.log("____________________________________________________________");


    	/*let schema = {
    		"name": "point",
    		"properties": {
    			"x": {"type": "integer"},
    			"y": {"type": "number"},
    			"name": {
    				"type": "string",
    				"minLength": 3,
    				"maxLength": 5,
    				"pattern": "/^a+$/"
    				},
    			"valid": {"type": "boolean"},
    			"arr": {
    				"type": "array",
    				"items": {"type": "integer"}
    			},
    			"arr2": {
    				"type": "array",
    				"items": [
    					{"type": "integer"},
    					{"type": "string"}, 
    					{
		    				"type": "object",
		    				"$ref": "#/definitions/object"
		    			}
		    		]
    			},
    			"en": {
    				"enum": [
    					{"type": "integer"},
    					{"type": "number"},
    					{"type": "boolean"},
    					{
    						"type": "array",
    						"items": {"type": "integer"}
    					},
    					{
		    				"type": "object",
		    				"$ref": "#/definitions/object"
		    			},
    					{"enum": ["one", "two", "three"]},
    					]
    			},
    			"obj": {
    				"type": "object",
    				"$ref": "#/definitions/object"
    			}
    		},
    		"definitions": {
    			"object": {
    				"properties": {
    					"x": {"type": "integer"}
    				}
    			}
    		}
    	}
    	let br = new MD4JS.BasicRecordFactory(schema);
    	let point = new br.point({"x": 1, "y": 4, "name": "aaa", "valid": true, "arr": [1,2,3], "arr2": [1,"test", new br.object({"x": 6}), 2,"otherTest", new br.object({"x": 5})]});
    	let otherPoint = new br.point();
    	otherPoint.x = 2;
    	otherPoint.y = 3.5;
    	otherPoint.name = "aaaaa";
    	otherPoint.valid = false;

    	console.log(point);
    	console.log(otherPoint);

    	point.en = "one";
    	point.en = 1;
    	point.en = 1.2;
    	point.en = false;
    	point.en = [1,2,3];
    	point.en = new br.object({"x": 6});
    	point.obj = new br.object();
    	
    	point.obj.x = 2;
    	
    	//point.en.x = 8;
    	//point.arr2 = [1, "test", new br.object({"x": 2})];
    	point.obj.x = "error";
    	console.log(point.obj);*/
    	/*testingSuite.TestBasicRecord.testAll();
		// load schema and create a basicRecordFactory
		let pointSchema = require('./schemas/testSchema.json');
		let br = new MD4JS.PersistentRecordFactory(pointSchema);
		let m = new br.machine({"machineName": "machine1", "states": []});
		
		let s1 = new br.state({"stateName": "closed", "transitions_in": [], "transitions_out": [], "machine": m});
		let s2 = new br.state({"stateName": "opened", "transitions_in": [], "transitions_out": [], "machine": m});
		
		let t1 = new br.transition({"event": "open"});
		let t2 = new br.transition({"event": "close"});
		
		m.start = s1;

		console.log(m);
		console.log(m.states);

		t1.from = s1;
		t1.to = s2;
		
		t2.from = s2;
		t2.to = s1;
		
		console.log("start state:" + m.start.stateName);
		console.log("to event: " + m.start.transitions_out[0].event);	
		console.log("from event: " + m.start.transitions_in[0].event);
		console.log("new state: " + m.start.transitions_out[0].to.stateName);
		console.log("to event: " + m.start.transitions_out[0].to.transitions_out[0].event);
		console.log("from event: " + m.start.transitions_out[0].to.transitions_in[0].event);
		console.log("new state: " + m.start.transitions_out[0].to.transitions_out[0].to.stateName);
		console.log(m);

		let mId = m.id;
		let s1Id = s1.id;
		let s2Id = s2.id;

		let t1Id = t1.id;
		let t2Id = t2.id;

		let m2 = br.machine({});
		let s3 = br.state({});
		let s4 = br.state({});
		let t3 = br.transition({});
		let t4 = br.transition({});

		m2.load(mId);
		s3.load(s1Id);
		s4.load(s2Id);
		t3.load(t1Id);
		t4.load(t2Id);

		m2.start = s3;

		s3.machine = m2;
		s4.machine = m2;

		t3.from = s3;
		t3.to = s4;
		
		t4.from = s4;
		t4.to = s3;

		console.log(m2);
		/*let mountPointData = {
			"/": {
				"fstype": "btrfs",
				"readonly": true
			},
			"/var": {
				"fstype": "ext4",
				"options": [ "nosuid" ]
			},
			"/tmp": {
			},
			"/var/www": {
			}
		}
		
		let storageData = {
			"diskDevice": {
				"type": "disk",
				"device": "/dev/sda1"
			},
			"diskUUID": {
				"type": "disk",
				"label": "8f3ba6f4-5c70-46ec-83af-0d5434953e5f"
			},
			"nfs": {
				"type": "nfs",
				"server": "my.nfs.server",
				"remotePath": "/exports/mypath"
			},
			"tmpfs": {
				"type": "tmpfs",
				"sizeInMB": 64
			}
		}
		
		// initialize fstab
		let fstab = Object.create(Object);
		
		// create a managed mountPoint for each directory
		for(var key in mountPointData) {
			fstab[key] = new br.mountPoint(mountPointData[key]);
		}
		
		// create managed storage object for each directory
		fstab['/'].storage = new br.diskDevice(storageData['diskDevice']);
		fstab['/var'].storage = new br.diskUUID(storageData['diskUUID']);
		fstab['/tmp'].storage = new br.tmpfs(storageData['tmpfs']);
		fstab['/var/www'].storage = new br.nfs(storageData['nfs']);
		
		
		// test assignment
		fstab['/tmp'].storage.sizeInMB = 512;
		
		
		// attempt to assign non existing property: throws error
		console.log("\n\n\nright before assignment to nonExistingProperty:\n\n");
		console.log(fstab['/var']);
		
		let ids = {};
		let storageIds = {};
		for(key in fstab) {
			ids[key] = fstab[key].id;
			storageIds[key] = fstab[key].storage.id;
		}

		let newFstab = {};

		for(key in fstab) {
			newFstab[key] = new br.mountPoint({});
			newFstab[key].load(ids[key]);
		}

		newFstab['/'].storage = new br.diskDevice({});
		newFstab['/var'].storage = new br.diskUUID({});
		newFstab['/tmp'].storage = new br.tmpfs({});
		newFstab['/var/www'].storage = new br.nfs({});
		
		newFstab['/'].storage.load(storageIds['/'])
		newFstab['/var'].storage.load(storageIds['/var']);
		newFstab['/tmp'].storage.load(storageIds['/tmp']);
		newFstab['/var/www'].storage.load(storageIds['/var/www']);

		console.log(newFstab);
*/
    }
}

document.getElementById('test').addEventListener('click', () => {
    let x = new Main();
});