import * as mObject from "../basicDataManager/mObject.js";

export class LockingMObject extends mObject.MObject {
	constructor(schema, klass, subKlasses) {
		super(schema, klass, subKlasses);
		this.locked = false;
	}

	__set(propKey, value) {
		if(this.locked == true) {
			throw new TypeError("object is locked");
		}
		return super.__set(propKey, value);
	}

	__get(propKey, value) {
		if(this.locked == true) {
			throw new TypeError("object is locked");
		}
		return super.__get(propKey);
	}


	lock() {
		this.locked = true;
	}

	unlock() {
		this.locked = false;
	}	
}