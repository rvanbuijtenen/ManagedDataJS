import * as bdm from "./basicDataManager.js"

/*
 * The LoggingHandler calls the appropriate methods of the LoggedMobject and
 * then forwards the call to the BasicRecordHandler for typeChecking.
 */
export class LoggingHandler extends bdm.BasicRecordHandler {
	/* call log function on target to log this event, then forward the call to super */
	get(target, propKey, receiver) {
		target.logGet(propKey);
		return super.get(target, propKey, receiver);
	}
	
	/* call log function on target to log this event, then forward the call to super */
	set(target, propKey, value, receiver) {
		target.logSet(propKey, value);
		return super.set(target, propKey, value, receiver);
	}
}

/*
 * LoggedMObject defines the functionality for logged records.
 */
export class LoggedMObject extends bdm.MObject {
	constructor(schema, klass, factory) {
		super(schema, klass, factory);
	}

	/* A simple function that logs data about a get request */
	logGet(propKey) {
		console.log("invoked GET on klass " + this.klass + " for property "+ propKey)
	}

	/* A simple function that logs data about a set request*/
	logSet(propKey, propValue) {
		console.log(propKey, propValue);
		if(propValue && propValue.hasOwnProperty('klass')) {
			console.log("invoked SET on klass " + this.klass + " for property "+ propKey + " with value of type " + propValue.klass)
		} else {
			console.log("invoked SET on klass " + this.klass + " for property "+ propKey + " with value " + propValue);
		}	
	}
}

/* 
 * The loggedRecordFactory is an extension of BasicRecord. All that is required is to assign our new
 * handler and managed object in the constructor.
 */
export class LoggedRecordFactory extends bdm.BasicRecordFactory {
	constructor(schema) {
		super(schema);
		
		// overwrite the handler and MBobject class associated with the factory
		this.handler = LoggingHandler;
		this.MObj = LoggedMObject;
	}
}