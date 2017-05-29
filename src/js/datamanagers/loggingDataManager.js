import * as bdm from "./basicDataManager.js"

export class LoggingHandler extends bdm.BasicRecordHandler {
	// call log function on target to log this event, then forward the call to super
	get(target, propKey, receiver) {
		target.log("GET", propKey, null);
		console.log(target[propKey]);
		return super.get(target, propKey, receiver);
	}
	
	// call log function on target to log this event, then forward the call to super
	set(target, propKey, value, receiver) {
		console.log(target);
		target.log("SET", propKey, value);
		
		return super.set(target, propKey, value, receiver);
	}
}

export class LoggedMObject extends bdm.MObject {
	constructor(inits) {
		super(inits);
	}
	
	// log the data passed to this function
	log(event, propKey, propValue) {		
		console.log(event + " property "+ propKey + " with value " + propValue);	
	}
}

export class LoggedRecordFactory extends bdm.BasicRecordFactory {
	constructor(schema, logFile) {
		super(schema);
		
		// overwrite the handler and MBobject class associated with the factory
		this.handler = LoggingHandler;
		this.MObj = LoggedMObject;
		this.logFile = logFile;
	}
}