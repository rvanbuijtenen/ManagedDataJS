/**
 * A mixin that provides functionality for locking and unlocking MObjects
 * Please refer to source for documentation on this Mixin. The documentation
 * generator does not work properly with mixin definition
 */
export let Locking = (superclass) => class extends superclass {
	constructor(schema, klass, subKlasses, ...otherArgs) {
		super(schema, klass, subKlasses, ...otherArgs);
		/**
		 * @type{Boolean}
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
	 * @param {Symbol, String} array - The array that will be modified
	 * @return {Boolean} True if the object is not locked
	 * @throws {TypeError}
	 */
	notifyBeforeArrayChanged(array) {
		if(this.isLocked()) {
			throw new TypeError("object is locked");
		}
		return true;
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
}