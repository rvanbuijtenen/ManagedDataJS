import * as interpreter from "../schemaInterpreter/schemaInterpreter.js";
import * as arrayManager from "./arrayDataManager.js";

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
	// invoke the get method of the target object
	get(target, propKey, receiver) {
		var propValue = target[propKey];
		if (typeof propValue != "function"){
			if(propKey in target) {
				return Reflect.get(target, propKey, receiver);
			} else {		
				return target.get(propKey);
			}
		}
		else{
			// return a function that executes the method call on the target
			return function(){
				return propValue.apply(target, arguments, propKey);
			}
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
export class MObject {
	// initialize the data of this managed object
	constructor(schema, klass, factory) {
		this.data = Object.create(Object);
		this.klass = klass;
		this.schema = schema;
		this.factory = factory;
	}
	
	// default set function
	set(propKey, param) {
		console.log(this.schema.schema.properties);
		if(this.schema.schema.properties.hasOwnProperty(propKey)) {
			if(this.isValidType(propKey, param, this.schema.schema.properties[propKey])) {
				if(this.schema.schema.properties[propKey].type == 'array') {
					for(let item of param) {
						this.data[propKey].push(item);
					}
				} else {
					this.data[propKey] = param;
				}
			}
		} else {
			throw new TypeError("property "+ propKey + " is not defined in schema");	
		}
		return true;
	}
		
	// default get function
	get(propKey) {
		if(this.schema.schema.properties.hasOwnProperty(propKey)) {
			return this.data[propKey];
		} else {
			throw new TypeError("property "+ propKey + " is not defined in schema");	
		}
	}
	
	toString(klassStack) {
		let str = "{";
		for(var key in this.data) {
			if(this.data[key].hasOwnProperty('klass')) {
				if(klassStack.includes(this.data[key].klass)) {
				   str = str + key + ": " + this.data[key].klass + "\n";
				} else {
					klassStack.push(this.data[key].klass);
					str = str + key + ": " + this.data[key].toString(klassStack);
				}
			} else if(this.data[key].constructor == Array) {
				
				str = str + key + ": [";
				for(var item of this.data[key]) {
					if(item.hasOwnProperty('klass')) {
						if(klassStack.includes(this.data[key].klass)) {
							str = str + key + ": " + this.data[key].klass + "\n";
						} else {
							klassStack.push(this.data[key].klass);
							str = str + item.toString(klassStack) + ", ";
						}
					} else {
						str = str + this.data[key] + ", ";		
					}
				}
			} else {
				str = str + key + ": " + this.data[key] + "\n";	
			}
		}
		return str + "}";
	}
	
	isValidType(propKey, value, schema) {
		let type = '';
		let c = value.constructor;
		if(schema.hasOwnProperty("enum")) {
			if(schema.enum.includes(value)) {
				return true;	
			} else if(value.hasOwnProperty("klass") && schema.enum.includes(value.klass)) {
				return true;
			} else {
				throw new TypeError("field " +propKey+" is enum and "+value+" is not one of "+schema.enum);
			}
		}

		if(schema.hasOwnProperty('oneOf')) {
			for(let item of schema.oneOf) {
				if(item.type == value.klass) {
					return true;
				}
			}
		}
		
		if(c == Array) {
			if(schema.type == 'array') {
				if(!this.data.hasOwnProperty(propKey)) {
					if(schema.hasOwnProperty('items')) {
						this.data[propKey] = new Proxy([], new arrayManager.ArrayHandler(schema.items));
					} else {
						this.data[propKey] = new Proxy([], new arrayManager.ArrayHandler([]));
					}
				}
				return true;	
			}
			throw new TypeError("field " +propKey+" is of type " + schema.type + " but parameter is of type array");
		} else if (typeof(value) === 'string') {
			if(schema.hasOwnProperty("enum")) {
				if(schema.enum.includes(c)) {
					return true;	
				}
			}
			if(schema['type'] == 'string') {
				if(schema.hasOwnProperty('minLength') && value.length < schema.minLength) {
					throw new TypeError("String "+value+" is too short: minLength = " + schema.minLength);
				} else if (schema.hasOwnProperty('maxLength') && value.length > schema.maxLength) {
					throw new TypeError("String "+value+" exceeds the maximum length: maxLength = " + schema.maxLength);
				} else if (schema.hasOwnProperty('pattern') && !value.match(schema.pattern)) {
					throw new TypeError("String "+value+" does not match " + schema.pattern);	
				}
				return true;	
			}
			throw new TypeError("field " +propKey+" is of type " + schema.type + " but parameter is of type string");
		} else if (typeof(value) === 'number') {
			if(schema.hasOwnProperty("enum")) {
				if(schema.enum.includes(c)) {
					return true;	
				}
			}
			if(schema.hasOwnProperty('multipleOf') && (value%schema.multipleOf != 0)) {
				throw new TypeError('field '+propKey+' must be a multiple of ' + schema.multipleOf);
			}
			if(schema.hasOwnProperty('minimum') && value < schema.minimum) {
				throw new TypeError('field '+propKey+' has a minimum value of '+schema.minimum+', but the passed value is '+ value);
			}
			if(schema.hasOwnProperty('maximum') && value > schema.maximum) {
				throw new TypeError('field '+propKey+' has a maximum value of '+schema.maximum+', but the passed value is '+ value);
			}
			if(schema['type'] == 'number') {
				return true;	
			} else if(schema['type'] == 'integer') {
				if(value%1 == 0) {
					return true;
				}
				throw new TypeError("field " +propKey+" is of type " + schema.type + " but parameter is of type number");
			}
			throw new TypeError("field " +propKey+" is of type " + schema.type+ " but parameter is of type number");
		} else if (typeof(value) === 'boolean') {
			if(schema['type'] == 'boolean') {
				return true;	
			}
			throw new TypeError("field " +propKey+" is of type " + schema.type + " but parameter is of type boolean");
		} else {
			
			if(value.hasOwnProperty('klass') && schema.type == value.klass) {
				return true;
			} else {
				throw new TypeError("objects assigned to "+propKey+" must be managed data");
			}
		}
	}
}

let f = function(inits, klass) {
	let mobj = new this.MObj(this.schema.klassSchemas[klass], klass, this);
	let mObjProxy = new Proxy(mobj, new this.handler());
		
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