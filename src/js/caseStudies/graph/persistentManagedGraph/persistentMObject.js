import * as mObject from "../../../framework/basicDataManager/mObject.js";
const uuidv4 = require("uuid/v4");

export class PersistentMObject extends mObject.MObject {
	constructor(schema, klass, subKlasses) {
		super(schema, klass, subKlasses);
		this.id = uuidv4();
	}

	__set(propKey, value) {
		let result = super.__set(propKey, value);
		this.save(propKey);
		return result;
	}

	notifyArrayChanged(array) {
		let propKey = super.notifyArrayChanged(array);
		this.save(propKey);
		return propKey;
	}

	getId() {
		return this.id;
	}

	save(propKey) {
		//console.log("saving object of klass "+this.klass+" with id "+this.id);
		if(this.id in localStorage) {
			//console.log("updating");
			this.update(propKey);
		} else {
			//console.log("saving...");
			let item = {};
			for(propKey in this.data) {
				let prop = this.data[propKey].getValue();

				if(typeof(prop) == "object") {
					if("getKlass" in prop){
						item[propKey] = {"klass": prop.getKlass(), "id": prop.getId()};
					} else if("klass" in prop) {
						item[propKey] = {"klass": prop.klass};
					} else {
						item[propKey] = this.serializeArray(prop.getValues());
					}
				} else {
					item[propKey] = prop;
				}


				
			}
			localStorage.setItem(this.id, JSON.stringify(item));
		}
		// TO DO: implement save
	}

	serializeArray(array) {
		let serializedArray = [];
		for(let item of array) {
			if(typeof(item) == "object") {
				if("getKlass" in item) {
					serializedArray.push({"klass": item.getKlass(), "id": item.getId()});
				} else {
					serializedArray.push(this.serializeArray(item));
				}
			} else {
				item[propKey].push(item);
			}
		}
		return serializedArray;
	}

	update(propKey) {
		let item = JSON.parse(localStorage.getItem(this.id));
		let prop = this.data[propKey].getValue();
		
		if(typeof(prop) == "object") {
			if("getKlass" in prop) {
				item[propKey] = {"klass": prop.getKlass(), "id": prop.getId()};
			} else {
				item[propKey] = this.serializeArray(prop.getValues());				
			}
		} else {
			item[propKey] = prop;
		}
		localStorage[this.id] = JSON.stringify(item);
	}
}