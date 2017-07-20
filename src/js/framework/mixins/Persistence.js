import {MObject} from "../dataManager/MObject";
import {MFieldFactory} from "../dataManager/fields/MFieldFactory";
import {ArrayMField} from "../dataManager/fields/MFieldMulti"

/**
 * A persistence mixin that:
 * - serializes this.data
 * - saves all MObjects stored in this.data
 * - saves a serialized verion of itself
 * - loads an earlier state from local storage based on a given 
 *
 * Please refer to source for documentation on this Mixin. The documentation
 * generator does not work properly with mixin definition
 */
export let Persistence = (superclass) => class extends superclass {
	/**
	 * Constructor for a persistent MObject
	 *
	 * @param {Object} schema - A schema describing the data property of this managed object
	 * @param {String} klass - A string representing the klass name of tihs managed object
	 * @param {DataManager} factory - A DataManager that this Persistent MObject can use to create new managed objects
	 * @param {String} id - An id to use when saving this MObjet
	 */
	constructor(schema, klass, factory, id, ...otherArgs) {
		super(schema, klass, ...otherArgs);
		/**
		 * @type {DataManager}
		 */
		this.factory = factory;
		/**
		 * @type {String}
		 */
		this.id = id;
	}

	/**
	 * @param {Symbol, String} propKey - The property key to set in this.data
	 * @param {*} value - The value to set this.data[propKey] to
	 * @return {Boolean} True if setting the value was succesfull
	 * @throws {TypeError}
	 */
	set(propKey, value) {
		let result = super.set(propKey, value);	
		return result;
	}

	/**
	 * @return {String} the id used to save this Persistent MObject
	 */
	getId() {
		return this.id;
	}

	/**
	 * @return {Object} A serialized version of this.data
	 */
	serialize() {
		let obj = {}
		for(let propKey in this.data) {
			obj[propKey] = this.serializeProp(this.data[propKey])
		}
		return obj
	}

	/**
	 * @param {MField} prop - An instance of MField to serialize
	 * @return {*} A serialized version of the given MField
	 */
	serializeProp(prop) {
		switch(prop.getType()) {
			case "object": {
				return this.serializeObject(prop.getValue())
				break
			}
			case "array": {
				return this.serializeArray(prop)
				break
			}
			default: {
				return prop.getValue()
				break
			}
		}
	}

	/**
	 * @param {ArrayMField} prop - An instance of ArrayMField to serialize
	 * @return {Array} A serialized version of the given array
	 */
	serializeArray(prop) {
		let arr = []
		for(let item of prop) {
			if(item instanceof MObject) {
				arr.push(this.serializeObject(item))
			} else if(item instanceof ArrayMField) {
				arr.push(this.serializeArray(item))
			} else {
				arr.push(item)
			}
		}
		return arr
	}

	/**
	 * @param {MObjectMField} prop - An MObjectMField to serialize
	 * @return {Object} - A serialized version of the MObject
	 */
	serializeObject(prop) {
		return {klass: prop.getKlass(), id: prop.getId()}
	}

	/**
	 * A method that saves this.data
	 * @param {number} [time] - A timestamp that indicates when saving started
	 */
	save(time) {
		console.log("saving: ", time);
		/* get current time and set time if not defined */
		let now = new Date().getTime();
		if(time == undefined) {
			time = now;
		}

		/* check if this item has been saved already */
		let loadedItem = JSON.parse(localStorage.getItem(this.id));
		if(loadedItem && loadedItem.updated_at >= time) {
			return;
		}

		/* initialize saveItem and serialize this.data */
		let saveItem = this.serialize()
		saveItem.updated_at = now

		/* save the item */
		localStorage.setItem(this.id, JSON.stringify(saveItem));

		/* go over each property and if its managed data, call that items save function */
		for(let prop in this.data) {
			this.saveProp(this.data[prop], time);
		}
	}

	/**
	 * Save the given property if it is an MObject or Array
	 * @param {MField} prop - The MField to save
	 * @param {number} [time] - A timestamp that indicates when saving started
	 */
	saveProp(prop, time) {
		console.log("saving prop:", prop, prop.getType())
		switch(prop.getType()) {
			case "object": {
				prop.getValue().save(time)
				break
			}
			case "array": {
				this.saveArray(prop, time); console.log("arr")
				break
			}
		}
	}

	/**
	 * Save the MObjects in the given array, if there are any
	 * @param {ArrayMField} prop - The ArrayMField to save
	 * @param {number} [time] - A timestamp that indicates when saving started
	 */
	saveArray(prop, time) {
		console.log("saving array:", prop)
		for(let item of prop) {
			if(item instanceof MObject) {
				item.save(time)
			} else if (item instanceof ArrayMField) {
				this.saveArray(item, time)
			}
		}
	}

	/**
	 * Load an earlier state of this MObject from localStorage
	 * @param {Array} loadedItems - An array containing all items that were loaded so far
	 */
	load(loadedItems) {
		if(loadedItems == undefined) {
			loadedItems = []
		}
		if(!loadedItems.includes(this.proxy)) {
			loadedItems.push(this.proxy)
		}

		let item = JSON.parse(localStorage.getItem(this.id))
		delete item.updated_at
		if(item != undefined) {
			for(let propKey in item) {
				this.proxy[propKey] = this.loadProp(item[propKey], loadedItems)
			}
		}
	}

	/**
	 * Loads a single property
	 * @param {Object} prop - The serialized property to load into this MObject
	 * @param {Array} loadeditems - An array containing all items that were loaded so far
	 * @return {Object} The loaded property
	 */
	loadProp(prop, loadedItems) {
		if (prop.hasOwnProperty("klass")) {
			return this.loadObject(prop, loadedItems)
		} else if(prop instanceof Array) {
			return this.loadArray(prop, loadedItems)
		} else {
			return prop
		}
	}

	/**
	 * Load an array of properties
	 * @param {Array} prop - An array of serialized properties
	 * @param {Array} loadeditems - An array containing all items that were loaded so far
	 * @return {Array} An array containing the loaded properties
	 */
	loadArray(prop, loadedItems) {
		console.log(prop, prop.hasOwnProperty("klass"), prop instanceof Array)
		let arr = []
		for(let item of prop) {
			if(item.hasOwnProperty("klass")) {
				arr.push(this.loadObject(item, loadedItems))
			} else if(prop instanceof Array) {
				arr.push(this.loadArray(item, loadedItems))
			} else {
				arr.push(item)
			}
		}
		return arr
	}

	/**
	 * Load an MObject property
	 * @param {Array} prop - A serialized MObject
	 * @param {Array} loadeditems - An array containing all items that were loaded so far
	 * @return {MObject} The loaded MObject 
	 */
	loadObject(prop, loadedItems) {
		/* Check if the object was loaded before*/
		for(let item of loadedItems) {
			if(item.getId() == prop.id) {
				return item;
			}
		}

		/* Check if the object we're loading has any inverse properties */
		let properties = this.factory.schema.getKlass(prop.klass).fields
		let inverseKey = "";
		for(let property in properties) {
			if(properties[property].hasOwnProperty("inverse")) {
				inverseKey = property;
			}
		}

		/* If there was an inverse property, provide the proper init object to the constructor of the MObject */
		if(inverseKey != "") {
			let init = {};
			init[inverseKey] = this.proxy;
			let newObj = new this.factory[prop.klass](init, this.factory, prop.id)
			newObj.load(loadedItems);
			return newObj;
		}
		/* Otherwise: create a simple empty MObject and tell it to load its data*/
		let newObj = new this.factory[prop.klass]({}, this.factory, prop.id);
		newObj.load(loadedItems);
		return newObj;
	}
}