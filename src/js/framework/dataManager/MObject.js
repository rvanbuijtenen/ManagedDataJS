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
	 * @param {KlassSchema} schema - A KlassSchema describing the data property of this managed object
	 * @param {String} klass - A string representing the klass name of tihs managed object
	 */
	constructor(schema) {
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
		 * @type {KlassSchema}
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
		for(let propKey in this.schema.fields) {
			/* Initialize an empty MField for each field defined in schema */
			this.data[propKey] = MFieldFactory(
									this.schema.getFieldSchema(propKey),
									this.proxy
								);
		}

		for(let propKey in inits) {
			/* Set all provided initial values. The MField will throw an error if a value is invalid */
			this.set(propKey, inits[propKey]);
		}
	}

	/**
	 * A MObject needs to know its own proxy, since we need to pass a proxied reference of the MObject 
	 * that an MObjectMField belongs to, and non-proxied MObjects may never be interacted with except through 'this'.
	 * So in order to ensure proper inverse relations, and MObjectMField must have a proxied reference to the object
	 * that it belongs to. Setting the proxy must be done by the factory function.
	 *
	 * @param {Proxy} proxy - The proxy wrapped around this MObject
	 * @throws {TypeError} The given proxy must be the proxy wrapped around this, otherwise an error is thrown
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
		return this.schema.getKlass()
	}

	/**
	 * @param {String, Symbol} propKey - The property key of the managed field that we want to access
	 * @return {*} The value of the requested property, if it exists.
	 * @throws {TypeError} An error is thrown if the field does not exist in this MObject's schema
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
	 * @throws {TypeError} If no property key can be found for the changed array an error is thrown.
	 */
	notifyArray(method, args, array) {
		return args
	}

	/**
	 * @return {String} A string representing the managed object
	 */
	toString() {
		return "[managedObject "+this.schema.getKlass()+"]"
	}

	/**
	 * @return {String} A string representing the managed object
	 */
	toJSON() {
		return this.toString()
	}

	/**
	 * @return {String} A stringn representing the managed object
	 */
	[Symbol.toPrimitive]() {
		return this.toString()
	}

	[Symbol.iterator]() {
		let data = {};
		for(let propKey in this.data) {
			data[propKey] = this.data[propKey].getValue()
		}
		return data[Symbol.iterator]()
	}
}