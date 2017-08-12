/**
 * A mixin that logs get, set and array change events
 * Please refer to source for documentation on this Mixin. The documentation
 * generator does not work properly with mixin definition
 */
export let Logging = (superclass) => class extends superclass {
	/**
	 * @param {Schema} - A Schema object that represents the data that this managed object has to manage
	 */
	constructor(schema) {
		super(schema);
	}
	/**
	 * Set the value at index 'propKey' to value and log which property is being set, which key it is assigned to 
	 * and which value is being set
	 * @param {String, Symbol} propKey - The property key of the managed field that we want to access
	 * @param {*} value - The value that we want to set the managed field to
	 *
	 * @return {Boolean} True if setting was succesfull
	 */
	set(propKey, value) {
		let result;
		try {
			result = super.set(propKey, value);
			console.log("set property "+propKey+" of klass "+this.schema.getKlass()+" to value: "+ JSON.stringify(value));
		} catch (err) {
			console.log("An error occured when setting property "+propKey+" of klass "+this.schema.getKlass()+" to value: " + JSON.stringify(value));
			throw err
		}
		return result;
	}

	/**
	 * Log which property is being retrieved
	 *
	 * @param {String, Symbol} propKey - The property key of the managed field that we want to access
	 *
	 * @return {*} The value of the requested property, if it exists.
	 * @throws {TypeError} An error is thrown if the field does not exist in this MObject's schema
	 */
	get(propKey) {
		let result;
		try {
			result = super.get(propKey);
			console.log("getting property "+propKey+" of klass "+this.schema.getKlass());
		} catch (err) {
			console.log("An error occured when getting property "+propKey+" of klass "+this.schema.getKlass())
			throw err
		}
		return result;
	}

	/**
	 * Log which array method has been called
	 *
	 * @param {String} method - A string representing the name of the method that was called on the managedArray
	 * @param {Array} args - An array containing the arguments that will be passed to the method
	 * @param {ManagedArray} array - The array that the method was invoked on
	 *
	 * @return {Array} - An array containing the args that were passed to this function. If the args are modified,
	 * 					 the invoked array method will execute 'method' with the modified arguments instead.
	 */
	notifyArray(method, args, array) {
		args= super.notifyArray(method, args, array)
		console.log("invoked "+method+" on ManagedArray in object "+this.schema.getKlass()+" with arguments "+args.toString())
		return args
	}
}