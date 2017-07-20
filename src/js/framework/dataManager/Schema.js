/**
 * A Klass is a wrapper around a parsed JSON schema that contains schemas for all fields of this klass
 */
export class Klass {
	/**
	 * A simple constructor that initializes fields and fieldTypes
	 */
	constructor() {
		/**
		 * @type {Object} An object that maps a key to a field schema
		 */
		this.fields = {}

		/**
		 * @type{Object} an object that maps a key to a string representing the fields type
		 */
		this.fieldTypes = {}
	}

	/**
	 * @param {String} propKey - The key of the field that we want to set the schema for
	 * @param {Object} field - A parsed JSON schema representing a single property
	 * @param {String} type - The type of the field that we want to set
	 */
	addFieldSchema(propKey, field, type) {
		this.fields[propKey] = field
		this.fieldTypes[propKey] = type
	}

	/**
	 * @param {String} propKey - The key of the field that we want to retrieve the schema of
	 * @return {Object} - A parsed JSON schema representing the requested property
	 * @throws {TypeError} - An error is thrown if the requested field does not exist
	 */
	getFieldSchema(propKey) {
		if(this.fields.hasOwnProperty(propKey)) {
			return this.fields[propKey]
		} else {
			throw new TypeError(propKey + " is not defined in schema")
		}
	}

	/**
	 * @param {String} propKey - The key of the field that we want to retrieve the schema of
	 * @return {Boolean} - True if the field exists, false otherwise
	 */
	hasFieldSchema(propKey) {
		if(this.fields.hasOwnProperty(propKey)) {
			return true
		} else {
			return false
		}
	}

	/**
	 * @param {String} propKey - The key of the field that we want to retrieve the type of
	 * @return {String} - the type of the requested field
	 * @throws {TypeError} - An error is thrown if the requested field does not exist
	 */
	getFieldType(propKey) {
		if(this.fields.hasOwnProperty(propKey)) {
			return this.fieldTypes[propKey]
		} else {
			throw new TypeError(propKey + " is not defined in schema")
		}
	}
}

/**
 * Schema is a wrapper that provides a setKlass and a getKlass method for managing schemas describing a single klass
 */
export class Schema {
	/**
	 * A simple constructor that initializes the internal klasses property
	 */
	constructor() {
		/**
		 * @type {Object} An object that maps klass names to Klass instances
		 */
		this.klasses = {}
	}

	/**
	 * @param {String} klassName - A string representing the klass name that we want to add
	 * @param {Klass} klass - The klass that we want to add
	 */
	addKlass(klassName, klass) {
		this.klasses[klassName] = klass
	}

	/**
	 * @param {String} klassName - The klass that we want to retrieve
	 * @return {Klass} The klass corresponding with the given klassName
	 * @throws {TypeError} An error is thrown when the given klassName does not exist
	 */ 
	getKlass(klassName) {
		if(this.klasses.hasOwnProperty(klassName)) {
			return this.klasses[klassName]
		} else {
			throw new TypeError("unknown klass: " + klassName)
		}
	}
}

/**
 * @param {Object} schema - A JSON schema
 * @return {Schema} A parsed JSON schema
 */
export function parseSchema(schema) {
	/* Verify that the schema contains the required 'name' and 'properties' property */
	if(!schema.hasOwnProperty("name")) {
		throw new TypeError("A schema must have a 'name' property")
	}

	if(!schema.hasOwnProperty("properties")) {
		throw new TypeError("A schema must have 'properties'")
	}

	/* Create a new instance of Schema */
	let s = new Schema()

	/* Initialize paths: an object that maps a definition path to a klass name. 
	 * the path '#' refers to the main schema.
	 * paths of the form '#/definitions/<klassName>' refers to a definition */
	let paths = {}
	paths["#"] = schema.name

	/* Parse definitions if there are any */
	if(schema.hasOwnProperty("definitions")) {
		for(let definition in schema.definitions) {
			parseDefinitions(schema.definitions, s, paths)
		}
	}

	/* Parse the mainKlass */
	let mainKlass = parseKlass(schema, schema.name, paths)
	s.addKlass(schema.name, mainKlass)

	return s
}

/**
 * @param {Object} definitions - A 'definitions' object from a JSON schema
 * @param {Schema} schema - A Schema where parseDefinitions can store parsed klasses
 * @param {Object} paths - An object that maps schema paths to the corresponding klass name
 */
function parseDefinitions(definitions, schema, paths) {
	/* For each definition: map the path of that definition to the definition (klassName) */
	for(let definition in definitions) {
		paths["#/definitions/" + definition] = definition
	}

	/* For each definition: parse the klass that it describes and add it to the schema */
	for(let definition in definitions) {
		let klass = parseKlass(definitions[definition], definition, paths) 
		schema.addKlass(definition, klass)
	}
}

/**
 * @param {Object} klassSchema - A JSON schema describing the klass
 * @param {String} klassName - The name of this klass
 * @param {Object} paths - An object that maps schema paths to the corresponding klass name
 * @return {Klass} A parsed klass
 */
function parseKlass(klassSchema, klassName, paths) {
	/* Create a new empty Klass */
	let klass = new Klass(klassName)

	/* For each property: parse the property and add it to the Klass */
	for(let property in klassSchema.properties) {
		let prop = klassSchema.properties[property]
		let type = getType(prop)

		klass.addFieldSchema(property, parseProperty(prop, type, paths), type)
	}

	return klass
}

/**
 * @param {Object} property - A JSON schema describing a single property
 * @param {String} type - The type of the property
 * @param {Object} paths - An object that maps schema paths to the corresponding klass name
 * @return {Object} A parsed property
 * @throws {TypeError} - If the schema contains an invalid keyword then an error is thrown
 */
function parseProperty(property, type, paths) {
	/* Shallow copy the given property to a new object so we don't modify the existing schema */
	let newProp = { ...property }

	switch(type) {
		case "object": {
			/* An object must have a reference */
			if(newProp.hasOwnProperty("$ref")) {
				/* Replace the '$ref' keyword by a klass */
				newProp["klass"] = paths[newProp["$ref"]]
				delete newProp["$ref"]
			} else {
				throw new TypeError("A property of type 'object' must have a '$ref' keyword that references the definition describing the object")
			}
			break
		}
		case "array": {
			/* An array must define items */
			if(newProp.hasOwnProperty("items")) {
				if(newProp.items instanceof Array) {
					/* Parse each item in the array */
					newProp.items = parseArray(newProp.items, paths)
				} else {
					/* Items is a single property so we parse the property */
					let type = getType(newProp.items)
					newProp.items = parseProperty(newProp.items, type, paths)
				}
			} else {
				throw new TypeError("An array must define the type of its contained items in an 'items' keyword")
			}
			break
		}
		case "oneOf": {
			/* oneOf must be an array of types */
			if(newProp.oneOf instanceof Array) {
				/* Parse each item in the array */
				newProp.oneOf = parseArray(newProp.oneOf, paths)
			} else {
				throw new TypeError("The oneOf keyword must be an array of types")
			}
			break
		}
	}
	return newProp
}

/**
 * @param {Array} array - An array of JSON schema properties
 * @param {Object} paths - An object that maps schema paths to the corresponding klass name
 * @return {Array} An array containing the parsed properties
 */
function parseArray(array, paths) {
	let newArr = []
	for(let item of array) {
		/* For each item: parse the item and add it to the new Array */
		let type = getType(item)
		newArr.push(parseProperty(item, type, paths))
	}
	return newArr
}

/**
 * @param {Object} property - A JSON schema describing a single property
 * @return {String} The type of the given property
 */
function getType(property) {
	if(property.hasOwnProperty("enum")) {
		return "enum"
	}

	if(property.hasOwnProperty("oneOf")) {
		return "oneOf"
	}

	if(property.hasOwnProperty("type")) {
		return property.type
	}
}