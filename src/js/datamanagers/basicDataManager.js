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
			if(propKey in target) {
				return Reflect.get(target, propKey, receiver);
			} else {		
				return target.get(propKey);
			}
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
		this.proxy = {};

		for(let prop in this.schema.schema.properties) {
			let p = this.schema.schema.properties[prop];
			if(p.hasOwnProperty('type') && p.type == 'array') {
				if(p.hasOwnProperty('items')) {
					this.data[prop] = new Proxy([], new ArrayManager.ArrayHandler(p.items));
				} else {
					this.data[prop] = new Proxy([], new ArrayManager.ArrayHandler([]));
				}
			}
		}
	}

	/*
	 * The set() method receives a property key to set and a parameter. The type of the parameter
	 * is checked against the schema, and if the assignment is allowed the value is set and true is returned.
	 * If the value does not match the schema, then an error is thrown.
	 */
	set(propKey, param) {
		let props = this.schema.schema.properties;

		/* check if property is defined in schema. If not: throw a typeError */
		if(!props.hasOwnProperty(propKey)) {
			throw new TypeError("property "+ propKey + " is not defined in schema");	
		}

		let typeDescription = props[propKey];

		if(typeDescription.hasOwnProperty('inverse')) {
			if(param.hasOwnProperty('klass')) {
				if(param[typeDescription.inverse] instanceof Array) {
					console.log(this.proxy, param[typeDescription.inverse]);
					param[typeDescription.inverse].push(this.proxy);
				} else {
					param[typeDescription.inverse] = this.proxy;
				}
			}
		}

		if(typeDescription.hasOwnProperty('enum')) {
			/*
			 * validate enum keyword. An enum can only contain specific instances of a basicType
			 * such as specific strings or numbers
			 */
			if(TypeValidator.validateEnum(typeDescription, param)) {
				let msg = "A value assigned to "+propKey+" must be one of: [ ";
				for(let item of typeDescription.enum) {
					msg = msg + item + ",";
				}
				msg = msg.subString(0, msg.length-1);
				throw new TypeError(msg);
			}
			this.data[propKey] = param;
		} else if(typeDescription.hasOwnProperty('oneOf')) {
			/*
			 * validate oneOf keyword. Items of the oneOf keyword must be klasses
			 */
			if(TypeValidator.validateEnum(typeDescription, param)) {
				let msg = "A value assigned to "+propKey+" must be an instance of a managed object of klass: [ ";
				for(let item of typeDescription.oneOf) {
					msg = msg + item.type + ",";
				}
				msg = msg.subString(0, msg.length-1);
				throw new TypeError(msg);
			}
			this.data[propKey] = param;
		} else if(typeDescription.hasOwnProperty('type')) {
			/*
			 * validate the type keyword. This can refer to a Klass, Array or basicType.
			 */
			if(this.schema.subKlasses.includes(typeDescription.type)) {
				/* the parameter must be an MObject */
				if(!(param.hasOwnProperty('klass') && this.schema.subKlasses.includes(param.klass))) {
					throw new TypeError();
				}
				this.data[propKey] = param;
			} else if(typeDescription.type == 'array') {
				if(!TypeValidator.validateArray(param)) {
					throw new TypeError("field "+propKey+" is of type array but parameter is of type "+typeof(param));
				} else {
					/* append each item of the passed array to the managed array*/
					for(let item of param) {
						this.data[propKey].push(item);
					}
				}
			} else if(!TypeValidator.validateBasicType(typeDescription, param)) {
				/*
				 * At this point the parameter can only be one of the basic types (String, Number, Integer, Boolean)
				 */
				throw new TypeError("field "+propKey+" is of type "+typeDescription.type+" but parameter is of type "+typeof(param));
			} else {
				/*
				 * A basic type was sucesfully validated. We now need to check for value constraints for strings, numbers and integers
				 */ 
				if(typeDescription.type == 'string') {
					/* validate string value restrictions */
					if(typeDescription.hasOwnProperty('minLength') && param.length < typeDescription.minLength) {
						throw new TypeError("String "+param+" is too short: minLength = "+typeDescription.minLength);
					}
					if(typeDescription.hasOwnProperty('maxLength') && param.length > typeDescription.maxLength) {
						throw new TypeError("String "+param+" exceeds the maximum length: maxLength = "+typeDescription.maxLength);
					}
					if(typeDescription.hasOwnProperty('pattern') && !param.match(typeDescription.pattern)) {
						throw new TypeError("String "+param+" does not match "+typeDescription.pattern);
					}
				}
				
				if(typeDescription.type == 'number' || typeDescription.type == 'integer') {
					/* validate number and integer value restrictions */
					if(typeDescription.hasOwnProperty('multipleOf') && (param%typeDescription.multipleOf != 0)) {
						throw new TypeError('field '+propKey+' must be a multiple of ' + typeDescription.multipleOf);
					}
					if(typeDescription.hasOwnProperty('minimum') && param < typeDescription.minimum) {
						throw new TypeError('field '+propKey+' has a minimum value of '+typeDescription.minimum+', but the passed value is '+ param);
					}
					if(typeDescription.hasOwnProperty('maximum') && param > typeDescription.maximum) {
						throw new TypeError('field '+propKey+' has a maximum value of '+typeDescription.maximum+', but the passed value is '+ param);
					}
				}
				// integer restrictions
				this.data[propKey] = param;
			}
		}
		return true;
	}

	/*
	 * The get method checks if the given property key exists in the schema. If it does, the value is returned,
	 * otherwise an error is thrown.
	 */
	get(propKey) {
		if(this.schema.schema.properties.hasOwnProperty(propKey)) {
			if(!this.data.hasOwnProperty(propKey)) {
				throw new TypeError("property "+propKey+" exists in schema, but it has not yet been assigned a value");
			}
			return this.data[propKey];
		} else {
			throw new TypeError("property "+ propKey + " is not defined in schema");	
		}
	}
}

class TypeValidator {
	/* 
	 * validates the given parameter against the type description. Since an enum can only
	 * contain specific values of basic types we check whether the parameter is included
	 * in the enum array.
	 */
	static validateEnum(typeDescription, param) {
		if(typeDescription.enum.includes(param)) {
			return true;
		}
		return false;
	}

	/*
	 * validates the given parameter against the type definitions in the oneOf keyword.
	 */
	static validateOneOf(typeDescription, param) {
		let includes = false;
		if(param.hasOwnProperty('klass')) {
			for(let t of typeDescription.oneOf) {
				if(t.type == param.klass) {
					return true;
				}
			}
		}
		return false;
	}

	/*
	 * validates the basicType in the 'type' keyword of the schema against the type of the parameter
	 */
	static validateBasicType(typeDescription, param) {
		if(typeDescription.type == typeof(param)) {
			return true;
		} else if (typeDescription.type == 'integer' && typeof(param) == 'number') {
			if(param%1 == 0) {
				return true;
			}
		}
		return false;
	}

	/*
	 * validates if the parameter is indeed an array
	 */
	static validateArray(param) {
		if(param.constructor == Array) {
			return true;
		}
		return false;
	}
}

/**
 * This function acts as a layer that decouples MObject initalization from data manager definition.
 * This is achieved by initializing an instance of the MObject and Handler classes set by the last factory
 * in the prototype chain. It also takes the arguments passed by the constructor. Each argument is then set
 * individually through the proxy handler to ensure the data conforms with the schema and data manager implmenetation.
 */ 
let f = function(inits, klass) {
	let schema = this.schema.klassSchemas[klass];
	let mobj = new this.MObj(schema, klass, this);
	let mObjProxy = new Proxy(mobj, new this.handler());

	/* The MObject needs a pointer to its own proxy for when an inverse field is found */
	mObjProxy.proxy = mObjProxy;

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