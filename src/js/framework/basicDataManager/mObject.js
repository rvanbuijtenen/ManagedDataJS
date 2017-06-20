import * as field from "./fields/mField.js";

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