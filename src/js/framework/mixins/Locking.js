/**
 * A mixin that provides functionality for locking and unlocking MObjects
 * Please refer to source for documentation on this Mixin. The documentation
 * generator does not work properly with mixin definition
 */
export let Locking = (superclass) => class extends superclass {
	/**
	 * @param {KlassSchema} schema - A KlassSchema describing this MObject's data
	 */
	constructor(schema, ...otherArgs) {
		super(schema, ...otherArgs);
		/**
		 * @type{Boolean} Indicates whether the object is locked. When locked === true the object cannot be modified
		 */
		this.locked = false;
	}

	/**
	 * @param {Symbol, String} propKey - The property key to set in this.data
	 * @param {*} value - The value to set this.data[propKey] to
	 * @return {Boolean} True if setting the value was succesfull
	 * @throws {TypeError}
	 */
	set(propKey, value) {
		if(this.locked == true) {
			throw new TypeError("object is locked");
		}
		return super.set(propKey, value);
	}

	/**
	 * @param {Symbol, String} propKey - The property key to look for in this.data
	 * @return {Boolean} True if getting the value was succesfull
	 * @throws {TypeError}
	 */
	get(propKey) {
		return super.get(propKey);
	}

	/**
	 * Sets locked to true
	 */
	lock() {
		this.locked = true;
	}

	/**
	 * @return {Boolean} True if locked, false otherwise
	 */
	isLocked() {
		return this.locked;
	}

	/**
	 * Sets locked to false
	 */
	unlock() {
		this.locked = false;
	}

	/**
	 * @param {String} method - A string representing the name of the method that was called on the managedArray
	 * @param {Array} args - An array containing the arguments that will be passed to the method
	 * @param {ManagedArray} array - The array that the method was invoked on
	 *
	 * @return {Array} - An array containing the args that were passed to this function. If the args are modified,
	 * 					 the invoked array method will execute 'method' with the modified arguments instead.
	 */
	notifyArray(method, args, array) {
		args = super.notifyArray(method, args, array)
		let methodsWithSideEffects = ["push", "splice", "pop", "shift", "unshift"]
		
		if(this.isLocked() && methodsWithSideEffects.includes(method)) {
			throw TypeError("object is locked")
		}
		return args
	}
}