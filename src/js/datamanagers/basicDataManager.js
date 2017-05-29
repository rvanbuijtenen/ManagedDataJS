import * as interpreter from "../schemaInterpreter/schemaInterpreter.js";

let FactoryHandler = {
	get(target, propKey, receiver){
		//if an attribute was accessed, simply return the value
		var propValue = target[propKey];
		if (typeof propValue != "function"){
			return propValue;
		}
		else{
			// return a function that executes the method call on the target
			return function(){
				return propValue.apply(target, arguments);
			}
		}
	}
}


export class BasicRecordHandler {
	// invoke the get method of the target object
	get(target, propKey, receiver) {
		if(propKey in target) {
			return Reflect.get(target, propKey, receiver);
		} else {		
			return target.get(propKey);
		}
	}
	
	// invoke the set method of the target object
	set(target, propKey, value, receiver) {
		if(propKey in target) {
			return Reflect.set(target, propKey, value, receiver);
		} else {		
			return target.set(propKey, value);
		}
	}
}

export class MObject {
	// initialize the data of this managed object
	constructor(inits) {
		for(var key in inits) {
			data[key] = inits[key];	
		}
	}
	
	// default set function
	set(propKey, param) {
		this.data[propKey] = param;
		return true;
	}
	
	// default get function
	get(propKey) {
		return this.data[propKey];
	}
}



let f = function(inits) {
	
	let i = new interpreter.SchemaInterpreter();
	let mobj = new this.MObj(inits);
	mobj.data = {"x": 0, "y": 0};
	
	return new Proxy(mobj, new this.handler());
}

export class BasicRecordFactory {
	constructor(schema) {
		// set handler and 
		this.handler = BasicRecordHandler;
		this.MObj = MObject;
		
		// assign a method that builds the managed object to each class definition in schema
		this[schema.name] = f;
		for(var def in schema.definitions) {
			this[def] = f;
		}
		this.schema = schema;
		
		// attach a handler that intercepts the function calls of the factory
		return new Proxy(this, FactoryHandler);
	}
}