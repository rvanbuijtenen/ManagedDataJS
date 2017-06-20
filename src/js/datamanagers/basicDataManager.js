import * as interpreter from "../schemaInterpreter/schemaInterpreter.js";
import * as ArrayManager from "./arrayDataManager.js";

let Ajv = require('ajv');
let ajv = Ajv({allErrors: true});

/**
 * The FactoryHandler appends the klass name of the klass that should be constructed
 * to the end of the arguments list, and then forwards this call to the appropriate
 * constructor function assigned to the property with that same klass name.
 */
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
 * BasicRecordHandler checks wheter a property exists in the MObject klass. If it does: that
 * property is accessed. Otherwise the call is forwarded to the MObjects get or set function,
 * where operations will be performed on the data field contained in the MObject.
 */
export class BasicRecordHandler {
	/* 
	 * if the requested property does not exist in the class MObject itself: 
	 * invoke the get method of the target object, otherwise return the requested 
	 * property from the MObject 
	 */
	get(target, propKey, receiver) {
		var propValue = target[propKey];
		if (typeof propValue != "function"){
			/*if(propKey in target) {
				return Reflect.get(target, propKey, receiver);
			} else {*/		
				return target.__get(propKey);
			//}
		}
		else{
			/* return a function that executes the method call on the target */
			return function(){
				return propValue.apply(target, arguments, propKey);
			}
		}

	}
	
	/* if the target does not contain the requested property: invoke the set method of the target MObject */
	set(target, propKey, value, receiver) {
		/*if(propKey in target) {
			return Reflect.set(target, propKey, value, receiver);
		} else {*/		
			return target.__set(propKey, value);
		//}
	}
}

/**
 * MObject implements the basic functionality for managed data:
 * 
 * It provides a set() and get() method for managed properties. These are stored in the 'data' property 
 * of an MObject. The BasicRecordHandler ensures that if a property does not exist within the MObject definition
 * itself, that the get/set calls are forwarded to those defined in the MObject.
 *
 * Get and set then perform type checking agains the schema. Since the schema has been modified by the parser
 * to only allow fields to be basic types (integer, number, string, boolean), managedArrays or managed data
 * we can ensure that all objects conform to a schema.
 *
 * ToDo: check required fields in constructor.
 */
import * as field from "../fields/MField.js";
export class MObject {
	constructor(schema, klass, subKlasses) {
		this.data = {};
		this.proxy = {};
		this.klass = klass;
		this.schema = schema;
		
	}

	init() {
		let ownSchema = {
			"type": "object",
			"klass": this.klass
		}
		for(let propKey in this.schema.properties) {
			this.data[propKey] = field.MFieldFactory.MField(
									this.schema.properties[propKey],
									this.proxy,
									ownSchema
								);
		}
	}

	setThisProxy(proxy) {
		this.proxy = proxy;
	}

	getKlass() {
		return this.klass;
	}

	__get(propKey) {
		if(this.data.hasOwnProperty(propKey)) {
			return this.data[propKey].getValue();
		} else {
			throw new TypeError("property "+propKey+" is not defined in schema");
		}
	}

	__set(propKey, value) {
		if(this.data.hasOwnProperty(propKey)) {
			this.data[propKey].setValue(value);
		} else {
			throw new TypeError("property "+propKey+" is not defined in schema");
		}
		return true;
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
		this.handler = BasicRecordHandler;
		this.MObj = MObject;
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