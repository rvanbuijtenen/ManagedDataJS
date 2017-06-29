import * as mObject from "../basicDataManager/mObject.js";

export let LockingMObject = (superclass) => class extends superclass {
	constructor(schema, klass, subKlasses, ...otherArgs) {
		super(schema, klass, subKlasses, ...otherArgs);
		this.locked = false;
	}

	__set(propKey, value) {
		if(this.locked == true) {
			throw new TypeError("object is locked");
		}
		return super.__set(propKey, value);
	}

	__get(propKey, value) {
		return super.__get(propKey);
	}

	notifyBeforeArrayChanged(array, value) {
		if(this.isLocked()) {
			throw new TypeError("object is locked");
		}
		return true;
	}


	lock() {
		this.locked = true;
	}

	isLocked() {
		return this.locked;
	}

	unlock() {
		this.locked = false;
	}	
}