import {MFieldFactory} from "./fields/MFieldFactory.js";

/**
 * MObjectHandler provides a get and a set trap for the proxy that is wrapped around a
 * managed object. The set trap simply invokes our custom set() function on the MObject.
 * get first checks whether the requested property in the object is a function. If it is
 * we execute that function. Otherwise, the requested property key is forwarded to our custom
 * get() function in the MObject
 */
export class MObjectHandler {
	/**
	 * @param {Object} target - The target object.
	 * @param {String, Symbol} propKey - The name of the property to get.
	 * @param {Object} receiver - Either the proxy or an object that inherits from the proxy.
	 *
	 * @return {*} Either the value of the requested property or a function that executes the requested property
	 */
	get(target, propKey, receiver) {
		var propValue = target[propKey];
		if (typeof propValue != "function"){		
			/* if the property is not a function: return MObject.__get(propKey) */
			return target.get(propKey);
		}
		else{
			/* return a function that executes the method call on the target */
			return function(){
				return propValue.apply(target, arguments, propKey);
			}
		}

	}

	/**
	 * @param {Object} target - The target object.
	 * @param {String, Symbol} propKey - The name of the property to set.
	 * @param {*} value - The value to set the property to
	 * @param {Object} receiver - Either the proxy or an object that inherits from the proxy.
	 *
	 * @return {Boolean} true if setting the value was succesful. If setting the value failed an 
	 * exception is thrown ny the managed object
	 */
	set(target, propKey, value, receiver) {
		/* invoke MObject.__set(propKey, value) */
		return target.set(propKey, value);
	}
}

/**
 * MObject implements the basic functionality for managed data:
 * 
 * It provides a set() and get() method for managed fields that will be invoked by the proxy
 * wrapped around this object. Managed fields are stored in the 'data' property of an MObject.
 *
 * Furthermore, it provides a notifyArrayChanged() callback that will be invoekd whenever an
 * ArrayMField changes its state.
 */
export class MObject {
	/**
	 * Constructor function for a managed object
	 *
	 * @param {Object} schema - A schema describing the data property of this managed object
	 * @param {String} klass - A string representing the klass name of tihs managed object
	 */
	constructor(schema, klass) {
		/**
		 * @type {Object}
		 */
		this.data = {};
		/**
		 * this.proxy may only contain a pointer to the proxy wrapped around this instance of MObject
		 * @type {Object}
		 */
		this.proxy = {};
		/**
		 * @type {String}
		 */
		this.klass = klass;

		/**
		 * @type {Schema}
		 */
		this.schema = schema;
	}

	/**
	 * Init function that initializes the data property with managed fields and sets an initial
	 * value if this was provided in the inits parameter
	 *
	 * @param {Object} inits - An object containing the initial values for this MObject
	 */
	init(inits) {
		console.log(this.schema)
		for(let propKey in this.schema.fields) {
			this.data[propKey] = MFieldFactory(
									this.schema.getFieldSchema(propKey),
									this.proxy
								);
		}

		for(let propKey in inits) {
			this.set(propKey, inits[propKey]);
		}
	}

	/**
	 * @param {Object} proxy - The proxy wrapped around this MObject
	 */
	setThisProxy(proxy) {
		if(!proxy === this) {
			throw new TypeError("the given proxy must be this object's proxy!")
		}
		this.proxy = proxy;
	}

	/**
	 * @return {String} A string representing the klass that this MObject implements
	 */
	getKlass() {
		return this.klass;
	}

	/**
	 * @param {String, Symbol} propKey - The property key of the managed field that we want to access
	 */
	get(propKey) {
		if(this.schema.hasFieldSchema(propKey)) {
			return this.data[propKey].getValue();
		} else {
			throw new TypeError("property "+propKey+" is not defined in schema");
		}
	}

	/**
	 * @param {String, Symbol} propKey - The property key of the managed field that we want to access
	 * @param {*} value - The value that we want to set the managed field to
	 *
	 * @return {Boolean} True if setting was succesfull
	 */
	set(propKey, value) {
		if(this.schema.hasFieldSchema(propKey)) {
			this.data[propKey].setValue(value);
			return true
		} else {
			throw new TypeError("property "+propKey+" is not defined in schema");
		}
	}

	/**
	 * @param {Symbol, String} propKey - The property key of the field that we want to get the type of
	 *
	 * @return {String} The type of the field stored in data[propKey]
	 */
	getType(propKey) {
		return this.schema.getFieldType(propKey)
	}

	/**
	 * By default the modification methods of managed arrays bypasses
	 * the set trap. Because of this, arrays notify their superKlass when they change.
	 * This way an MObject can still implement its functionality whenever an array field
	 * is modified by extending this function.
	 *
	 * @param {ArrayMField} array - The array that was modified
	 * 
	 * @return {Symbol} - The property key that points to the changed array
	 */
	notifyArrayChanged(array) {
		let propKey = undefined;
		for(let key in this.data) {
			if(this.data[key].getType() == "array" && this.data[key] == array) {
				propKey = key;
			}
		}
		if(propKey == undefined) {
			throw new TypeError("something went wrong");
		}

		return propKey;
	}

	/**
	 * @return {String} A string representing the managed object
	 */
	toString() {
		return "[managedObject "+this.klass+"]"
	}
}