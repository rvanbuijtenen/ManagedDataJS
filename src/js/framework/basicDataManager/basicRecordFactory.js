import * as mObject from "./mObject.js";
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
				//arguments.unshift(propKey);
				if(arguments.length == 0) {
					arguments[0] = {};
					arguments.length++;
				}
				arguments[arguments.length] = propKey;
				arguments.length++;
				return propValue.apply(target, arguments, propKey);
			}
		}
	}
}

/**
 * This function acts as a layer that decouples MObject initalization from data manager definition.
 * This is achieved by initializing an instance of the MObject and Handler classes set by the last factory
 * in the prototype chain. It also takes the arguments passed by the constructor. Each argument is then set
 * individually through the proxy handler to ensure the data conforms with the schema and data manager implmenetation.
 */ 
let f = function(inits, klass) {
	let schema = this.schema.klassSchemas[klass].schema;
	let subKlasses = this.schema.klassSchemas[klass].subKlasses;
	let mobj = new this.MObj(schema, klass, subKlasses, this.otherInits);
	let mObjProxy = new Proxy(mobj, new this.handler());

	/* The MObject needs a pointer to its own proxy for when an inverse field is found */
	mObjProxy.setThisProxy(mObjProxy);
	mObjProxy.init();

	for(var propKey in inits) {
		mObjProxy[propKey] = inits[propKey];
	}
		
	return mObjProxy;
}

/**
 * The BasicRecordFactory consists of a constructor that receives a schema as input.
 * The appropriate default Handler and MObject classes are set in a field to be used
 * by the function that will construct an instance of an MObject.
 *
 * The schema is then parsed by a schemaInterpreter. For each Klass defined in the schema
 * an anonymous function is assigned that takes care of initalizing the MObject.
 *
 * Finally a proxy is wrapped around this instance of the basicRecord factory that
 * ensures a 'new Factory.klassName(args)' call is forwarded to the anonymous function 
 * that constructs a new MObject.
 */
export class BasicRecordFactory {
	constructor(schema) {
		/* set handler and MObject class */
		this.handler = mObject.BasicRecordHandler;
		this.MObj = mObject.MObject;
		this.otherInits = {};
		
		let i = new interpreter.SchemaInterpreter();
		this.schema = i.parseSchema(schema);
		/* assign a factory function for mainKlass */
		this[this.schema.mainKlass] = f;
		for(var klass in this.schema.klassSchemas) {
			/* assign a factory function for each klass */
			this[klass] = f;
		}
		return new Proxy(this, FactoryHandler);
	}
}