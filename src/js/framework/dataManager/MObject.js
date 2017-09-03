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
 * Furthermore, it provides a notifyArray() callback that will be invoked whenever a method on an ArrayMField
 * contained in the MObject's fields is called
 */
export class MObject {
	/**
	 * Constructor function for a managed object
	 *
	 * @param {KlassSchema} schema - A parsed KlassSchema describing the MObject's fields
	 */
	constructor(schema) {
		/**
		 * @type {Object} The data field contains all MFields described in this MObject's schema
		 */
		this.data = {};
		/**
		 * @type {Proxy} The MObject must know what it's own proxy is when initializing MFields
		 */
		this.proxy = {};

		/**
		 * @type {KlassSchema} A parsed KlassSchema describing the MObject's fields
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
		console.log("inits: ", inits)
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
	 * that object, oneOf and array fields belong to since an MObject may never be accessed directly, except through "this".
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
	 * @throws {TypeError} An error is thrown if the field does not exist in this MObject's schema
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
	 * Methods invoked on managed array fields cannot be trapped by this MObjects proxy,
	 * therefore the array invokes the notifyArray callback when one of it's methods are invoked.
	 * This allows the managed object and possible mixins to perform reflective behaviour on arrays, 
	 * as wel as regular data.
	 * 
	 * @param {String} method - A string used to access the invoked method on the array that invoked this callback
	 * @param {Array} args - An array containing the arguments given to the array's method 
	 * @param {ArrayMField} array - The array that invoked the callback
	 * 
	 * @return {Array} The arguments given to notifyArray. Mixins can override this method 
	 * to intercept and possibly modify the arguments.
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
	 * @return {String} A string representing the managed object
	 */
	[Symbol.toPrimitive]() {
		return this.toString()
	}

	/**
	 * @return {Object} An interable instance of this object's data field
	 */
	[Symbol.iterator]() {
		let data = {};
		for(let propKey in this.data) {
			data[propKey] = this.data[propKey].getValue()
		}
		return data[Symbol.iterator]()
	}
}