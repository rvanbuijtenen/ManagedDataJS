import * as mObject from "../basicDataManager/mObject.js";
import * as mField from "../basicDataManager/fields/mField.js";

export let PersistentMObject = (superclass) => class extends superclass {
	constructor(schema, klass, subKlasses, factory, id, ...otherArgs) {
		super(schema, klass, subKlasses, ...otherArgs);
		this.factory = factory;
		this.id = id;
		this.isLoading = false;
	}

	__set(propKey, value) {
		let result = super.__set(propKey, value);	
		return result;
	}

	notifyArrayChanged(array) {
		let propKey = super.notifyArrayChanged(array);
		return propKey;
	}

	getId() {
		return this.id;
	}

	save(time) {
		console.log("saving: ", time);
		// get current time and set time if not defined
		let now = new Date().getTime();
		if(time == undefined) {
			time = now;
		}

		// check if this item has been saved already
		let loadedItem = JSON.parse(localStorage.getItem(this.id));
		if(loadedItem && loadedItem.updated_at >= time) {
			return;
		}

		// initialize saveItem and serialize each property
		let saveItem = {};

		for(let prop in this.data) {
			saveItem[prop] = this.serializeProperty(this.data[prop]); 
		}
		saveItem.updated_at = now;
		localStorage.setItem(this.id, JSON.stringify(saveItem));

		// go over each property and if its managed data, call that items save function
		for(let prop in this.data) {
			this.saveProperty(this.data[prop], time);
		}
	}

	serializeProperty(prop) {
		if(prop.getType() == "MObject") {
			return this.serializeMObject(prop.getValue());
		} else if (prop.getType() == "array") {
			return this.serializeArray(prop);
		} else {
			return prop.getValue();
		}
	}

	serializeMObject(obj) {
		return {"id": obj.getId(), "klass": obj.getKlass()};
	}

	serializeArray(arr) {
		let serializedArr = [];
		for(let item of arr) {
			serializedArr.push(this.serializeArrayItem(item));
		}
		return serializedArr;
	}

	serializeArrayItem(item) {
		if(item instanceof mObject.MObject) {
			return this.serializeMObject(item);
		} else if (item instanceof mField.ArrayMField) {
			return this.serializeArray(item);
		} else {
			return item;
		}
	}

	saveProperty(prop, time) {
		if(prop.getType() == "MObject") {
			prop.getValue().save(time);
		} else if (prop.getType() == "array") {
			this.saveArray(prop, time);
		}
	}

	saveArray(prop, time) {
		for(let item of prop) {
			this.saveArrayItem(item, time);
		}
	}

	saveArrayItem(item, time) {
		if(item instanceof mObject.MObject) {
			item.save(time);
		} else if (item instanceof mField.ArrayMField) {
			this.saveArray(item, time);
		}
	}

	load(objects) {
		if(objects == undefined) {
			objects = [];
		}
		console.log(objects);
		objects.push(this);

		let loadedItem = JSON.parse(localStorage.getItem(this.id));

		for(let propKey in loadedItem) {
			if(propKey != "updated_at") {
				this.proxy[propKey] = this.loadProperty(loadedItem[propKey], objects);
			}
		}
	}

	loadProperty(prop, objects) {
		if(prop.hasOwnProperty("klass")) {
			return this.loadMObject(prop, objects);
		} else if (prop instanceof Array) {
			return this.loadArray(prop, objects);
		} else {
			return prop;
		}
	}

	loadArray(arr, objects) {
		let loadedArray = [];
		for(let item of arr) {
			if(item instanceof Array) {
				loadedArray.push(this.loadArray(arr, objects));
			} else if (item.hasOwnProperty("klass")) {
				loadedArray.push(this.loadMObject(item, objects));
			} else {
				loadedArray.push(prop);
			}
		}
		return loadedArray;
	}

	loadMObject(obj, objects) {
		for(let o of objects) {
			if(o.getId() == obj.id) {
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
			let newObj = new this.factory[obj.klass](init, this.factory, obj.id)
			newObj.load(objects);
			return newObj;
		}
		let newObj = new this.factory[obj.klass]({}, this.factory, obj.id);
		newObj.load(objects);
		return newObj;
	}
}
