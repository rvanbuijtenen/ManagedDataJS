import * as mObject from "../../../framework/basicDataManager/mObject.js";
const uuidv4 = require("uuid/v4");

export class PersistentMObject extends mObject.MObject {
	constructor(schema, klass, subKlasses, otherInits) {
		super(schema, klass, subKlasses, otherInits);
		this.id = uuidv4();
	}

	__set(propKey, value) {
		let result = super.__set(propKey, value);	
		this.save();
		return result;
	}

	notifyArrayChanged(array) {
		let propKey = super.notifyArrayChanged(array);
		console.log(propKey);
		this.save();
		return propKey;
	}

	getId() {
		return this.id;
	}

	save() {
		let saveItem = {};
		for(let propKey in this.data) {
			saveItem[propKey] = this.serializeProperty(this.data[propKey].getValue());
			if(propKey == "lines") {
			}
		}

		localStorage.setItem(this.id, JSON.stringify(saveItem));
		// save
	}

	serializeProperty(prop) {
		if(typeof(prop) == "object" && prop != null) {
			if("getKlass" in prop) {
				return this.serializeMObject(prop);
			} else if("type" in prop && prop.type == "array") {
				return this.serializeArray(prop);
			}
		} else {
			return prop;
		}
	}

	serializeMObject(obj) {
		return {"klass": obj.getKlass(), "id": obj.getId()}
	}

	serializeArray(arr) {
		let serializedArray = [];
		for(let item of arr) {
			serializedArray.push(this.serializeProperty(item));
		}
		return serializedArray;
	}

	load(id, objects) {
		objects.push(this.proxy);
		let data = JSON.parse(localStorage.getItem(id));
		let properties = this.schema.properties;
		for(let propKey in data) {
				if(properties[propKey].hasOwnProperty("inverse")) {
					continue;
				}
				let property = this.loadProperty(data[propKey], objects);
			
			//if(property != null) {
				this.__set(propKey,property);
			//}
		}

		localStorage.removeItem(this.id);
		this.id = id;
	}

	loadProperty(prop, objects) {
		if (prop instanceof Array) {
			return this.loadArray(prop, objects);
		}
		if(prop.hasOwnProperty("klass")) {
			return this.loadMObject(prop, objects);
			/*let p = this.loadMObject(prop);
			console.log("loaded prop:", p);
			return p;
			return prop;*/
		}
		return prop;
	}

	loadArray(arr, objects) {
		let loadArray = [];
		for(let item of arr) {
			let i = this.loadProperty(item, objects);
			if(i != null) {
				loadArray.push(i);
			}
		}
		return loadArray;
	}

	loadMObject(obj, objects) {
		for(let o of objects) {
			if(obj.id == o.getId()) {
				return o;
			}
		}

		let properties = this.factory.schema.klassSchemas[obj.klass].schema.properties;
		let inverseKey = "";
		for(let prop in properties) {
			if(properties[prop].hasOwnProperty("inverse")) {
				inverseKey = prop;
			}
		}
		if(inverseKey != "") {
			let init = {};
			init[inverseKey] = this.proxy;
			let newObj = new this.factory[obj.klass](init)
			newObj.load(obj.id, objects);
			return newObj;
		}
		let newObj = new this.factory[obj.klass]();
		newObj.load(obj.id, objects);
		return newObj;
	}
}