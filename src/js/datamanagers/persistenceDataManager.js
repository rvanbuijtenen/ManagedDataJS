import * as bdm from "./loggingDataManager.js"

const uuidV1 = require('uuid/v1');

export class PersistentHandler extends bdm.LoggingHandler {
	// call log function on target to log this event, then forward the call to super
	get(target, propKey, receiver) {
		if(propKey == 'load') {
			let propValue = target[propKey];
			return function(){
				return propValue.apply(target, arguments, propKey);
			}
		}
		return super.get(target, propKey, receiver);
	}
	
	// call log function on target to log this event, then forward the call to super
	set(target, propKey, value, receiver) {
		let status = super.set(target, propKey, value, receiver);
		target.persist();
		return status;
	}
}

export class PersistentMObject extends bdm.LoggedMObject {
	constructor(schema, klass, factory) {
		super(schema, klass, factory);
		this.id = uuidV1();
	}

	persist() {
		let persistentObject = Object.create(Function);
		for(var propKey in this.data) {
			if(this.data[propKey].hasOwnProperty('klass') || this.data[propKey] instanceof Array) {
			} else {
				persistentObject[propKey] = this.data[propKey];
			}
		}
		console.log(persistentObject);
		localStorage.setItem(this.id, JSON.stringify(persistentObject));
		return this.id;
	}

	load(id) {
		this.id = id;
		console.log(localStorage.getItem(id));
		let data = JSON.parse(localStorage.getItem(id));
		for(var propKey in data) {
			if(data[propKey].hasOwnProperty('klass')) {
			} else {
				console.log({"data in persistence data manager": data[propKey]});
				this.data[propKey] = data[propKey];
			}
		}
		return true;
	}
}

export class PersistentRecordFactory extends bdm.LoggedRecordFactory {
	constructor(schema) {
		super(schema);
		
		// overwrite the handler and MBobject class associated with the factory
		this.handler = PersistentHandler;
		this.MObj = PersistentMObject;
	}
}