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
	constructor(schema, klass, otherInits) {
		super(schema, klass, otherInits);
		this.id = uuidV1();
	}

	save() {
		let time = new Date();
		this.persist(time);
	}

	persist(time) {
		if(localStorage.hasOwnProperty(this.id)) {
			if(localStorage[this.id].updated_at > time) {
				return;
			}
		}
		let persistentObject = Object.create(Function);
		for(var propKey in this.data) {
			if(this.data[propKey].hasOwnProperty('klass')) {
				persistentObject[propKey] = this.data[propKey].id;
			} else if (this.data[propKey] instanceof Array) {
				persistentObject[propKey] = [];
				if(item.hasOwnProperty('klass')) {
					persistentObject[propKey].push(item.id);
				} else {
					persistentObject[propKey].push(item);
				}
			} else {
				persistentObject[propKey] = this.data[propKey];
			}
		}

		localStorage.setItem(this.id, JSON.stringify(persistentObject));

		for(var propKey in this.data) {
			if(this.data[propKey].hasOwnProperty('klass')) {
				this.data[propKey].persist(time);
			} else if (this.data[propKey] instanceof Array) {
				persistentObject[propKey] = [];
				for(let item of this.data[propKey]) {
					if(item.hasOwnProperty('klass')) {
						item.persist(time);
					}
				}
			}
		}
		return this.id;
	}

	load(id) {
		this.id = id;
		console.log(localStorage.getItem(id));
		let data = JSON.parse(localStorage.getItem(id));
		for(var propKey in data) {
			if(data[propKey].hasOwnProperty('klass')) {
			} else {
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
		this.otherInits.factory = this;
	}
}