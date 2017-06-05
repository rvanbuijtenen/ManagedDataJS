import * as interpreter from "../schemaInterpreter/schemaInterpreter3.js";

let Ajv = require('ajv');
let ajv = Ajv({allErrors: true});

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

export class MObject {
	// initialize the data of this managed object
	constructor(schema, klass) {
		this.data = Object.create(Object);
		this.klass = klass;
		this.schema = schema;
	}
	
	// default set function
	set(propKey, param) {
		if(this.schema.schema.properties.hasOwnProperty(propKey)) {
			if(this.isValidType(propKey, param, this.schema.schema.properties[propKey])) {
				this.data[propKey] = param;
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
	
	toString() {
		let str = "{";
		for(var key in this.data) {
			if(this.data[key].hasOwnProperty('klass')) {
				str = str + key + ": " + this.data[key].toString();
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
		
		if(c == Array) {
			if(schema.type == 'array') {
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
				return true;	
			}
			throw new TypeError("field " +propKey+" is of type " + schema.type + " but parameter is of type string");
		} else if (typeof(value) === 'number') {
			if(schema.hasOwnProperty("enum")) {
				if(schema.enum.includes(c)) {
					return true;	
				}
			}
			if(schema['type'] == 'number') {
				return true;	
			} else if(schema['type'] == 'integer') {
				if(value%1 == 0) {
					return true;
				}
				throw new TypeError("field " +propKey+" is of type " + schema.type + " but parameter is of type integer");
			}
			throw new TypeError("field " +propKey+" is of type " + schema.type+ " but parameter is of type number");
		} else if (typeof(value) === 'boolean') {
			if(schema['type'] == 'boolean') {
				return true;	
			}
			throw new TypeError("field " +propKey+" is of type " + schema.type + " but parameter is of type boolean");
		} else {
			console.log(c, value, schema);
			if(value.hasOwnProperty('klass') && this.schema.subKlasses.includes(value.klass)) {
				return true;
			} else
			throw new TypeError("objects assigned to "+propKey+" must be managed data");
		}
	}
}

let f = function(inits, klass) {
	let mobj = new this.MObj(this.schema.klassSchemas[klass], klass);
	let mObjProxy = new Proxy(mobj, new this.handler());
	
	for(var propKey in inits) {
		mObjProxy[propKey] = inits[propKey];	
	}
	
	return mObjProxy;
}

export class BasicRecordFactory {
	constructor(schema) {
		// set handler and MObject class 
		this.handler = BasicRecordHandler;
		this.MObj = MObject;
		
		let i = new interpreter.SchemaInterpreter();
		this.schema = i.parseSchema(schema);
		
		// assign a factory function for mainKlass
		this[this.schema.mainKlass] = f;
		for(var klass in this.schema.klassSchemas) {
			// assign a factory function for each klass subKlass
			this[klass] = f;
		}
		return new Proxy(this, FactoryHandler);
	}
}