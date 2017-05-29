import * as ldm from "./loggingDataManager.js";

// The LockingHandler enforces locking behaviour on the targets data field
export class LockingHandler extends ldm.LoggingHandler {
	get(target, propKey, receiver) {
		if((propKey in target.data) && target.locked == true) 
			throw new TypeError("target is locked");
		console.log(target.locked);
		return super.get(target, propKey, receiver);
	}
	
	set(target, propKey, params, receiver) {
		if((propKey in target.data) && target.locked == true) 
			throw new TypeError("target is locked");
		return super.set(target, propKey, params, receiver);
	}
}

// The LockingMObject class adds locking functionality to MObject
export class LockingMObject extends ldm.LoggedMObject {
	constructor(inits) {
		super(inits);
		this.locked = false;
	}
	
	lock() {
		console.log("setting locked to true");
		this.locked = true;	
		console.log(this.locked);
	}
	
	unlock() {
		console.log("setting locked to false");
		this.locked = false;	
	}
}

export class LockingRecordFactory extends ldm.LoggedRecordFactory {
	constructor(schema, logfile) {
		super(schema, logfile);
		// within the factory constructor a Handler and MObject class must be assigned.
		this.handler = LockingHandler;
		this.MObj = LockingMObject;
	}
}