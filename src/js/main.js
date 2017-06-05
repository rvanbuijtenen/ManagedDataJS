
//import * as Point from "./schemas/pointSchema.js";
import * as MD4JS from "./datamanagers/basicDataManager.js";
import * as interpreter from "./schemaInterpreter/schemaInterpreter3.js";
//import * as LMD4JS from "./loggingDataManager2.js";
//import * as Machine from "./machineSchema.js";
//import * as logger from "./loggingDataManager.js";

let Ajv = require('ajv');
let ajv = Ajv({allErrors: true});

class Main { 
    constructor() {
		// load schema and create a basicRecordFactory
		let pointSchema = require('./schemas/mountPointSchema.json');
		let br = new MD4JS.BasicRecordFactory(pointSchema);
	
		let mountPointData = {
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
		
		// log the managed fstab
		console.log("after initialization:\n\n");
		for(key in fstab) {
			console.log(key + ': ' + fstab[key].toString());
		}
		
		// test assignment
		fstab['/tmp'].storage.sizeInMB = 512;
		
		// log managed fstab again
		console.log("\n\n\nafter assignment:\n\n");
		for(key in fstab) {
			console.log(key + ': ' + fstab[key].toString());
		}
		
		// attempt to assign non existing property: throws error
		console.log("\n\n\nright before assignment to nonExistingProperty:\n\n");
		console.log(fstab['/var']);
		fstab['/tmp'].storage.nonExistingProperty = "test";
    }
}

document.getElementById('test').addEventListener('click', () => {
    let x = new Main();
});