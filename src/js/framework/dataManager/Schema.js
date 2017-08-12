/**
 * A Klass is a wrapper around a parsed JSON schema that contains schemas for all fields of this klass
 */
export class KlassSchema {
	/**
	 * A simple constructor that initializes fields and fieldTypes
	 */
	constructor(klass) {
		/**
		 * @param {String} A string representing this klass's type
		 */
		this.klass = klass

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

	/**
	 * @return {String} A string representing this klass's type
	 */
	getKlass() {
		return this.klass
	}
}

/**
 * Schema is a wrapper that provides an addKlass and a getKlassByName method. These methods are used to manage an
 * object that maps klass names to KlassSchemas. it's purpose is to group multiple KlassSchemas into a single Schema
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
	getKlassByName(klassName) {
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
	let parsedSchema = new Schema()

	/* Initialize paths: an object that maps a definition path to a klass name. 
	 * the path '#' refers to the main schema.
	 * paths of the form '#/definitions/<klassName>' refers to a definition */
	let paths = {}
	paths["#"] = schema.name

	let hasDefinitions = false
	/* Parse definitions if there are any */
	if(schema.hasOwnProperty("definitions")) {
		for(let definition in schema.definitions) {
			parseDefinitions(schema.definitions, parsedSchema, paths)
		}
	}

	/* Parse the mainKlass */
	let mainKlass = parseKlass(schema, schema.name, paths)
	parsedSchema.addKlass(schema.name, mainKlass)

	parseRelations(schema, parsedSchema, paths)

	return parsedSchema
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
	let klass = new KlassSchema(klassName)

	/* For each property: parse the property and add it to the Klass */
	for(let property in klassSchema.properties) {
		let prop = klassSchema.properties[property]
		let type = getType(prop)

		klass.addFieldSchema(property, parseProperty(prop, type, paths), type)
	}

	return klass
}

/**
 * @param {Object} schema - A complete (raw) JSON schema
 * @param {Schema} parsedSchema - A Schema object that contains the parsed Klasses to which relations must be added
 * @param {Object} paths - An object that maps a path of the form "#" or "#/definitions/<klassName>" to the corresponding klassName
 */
function parseRelations(schema, parsedSchema, paths) {
	/* parse relations for the main klass */
	if(schema.hasOwnProperty("relations")) {
		for(let relation in schema.relations) {
			parseRelation(relation, schema.relations[relation], parsedSchema, schema.name, paths)
		}
	}

	/* parse relations for all other classes defined in "definitions" */
	if(schema.hasOwnProperty("definitions")) {
		for(let definition in schema.definitions) {	
			if(schema.definitions[definition].hasOwnProperty("relations")) {
				for(let relation in schema.definitions[definition].relations) {
					parseRelation(relation, schema.definitions[definition].relations[relation], parsedSchema, definition, paths)
				}
			}	
		}
	}
}

function parseRelation(relationType, relations, parsedSchema, klassName, paths) {
	let fieldsList = []
	let inversesList = []
	switch(relationType) {
		case "oneToOne": {
			for(let relation of relations) {
				let {field, inverses} = buildOneToOne(relation, klassName, paths)
				fieldsList.push(field)
				inversesList.push(inverses)
			}
			break;
		}
		case "oneToMany": {
			for(let relation of relations) {
				let {field, inverses} = buildOneToMany(relation, klassName, paths)
				fieldsList.push(field)
				inversesList.push(inverses)
			}
			break;
		}
		case "manyToMany": {
			for(let relation of relations) {
				let {field, inverses} = buildManyToMany(relation, klassName, paths)
				fieldsList.push(field)
				inversesList.push(inverses)
			}
			break;
		}
		default: {
			throw new TypeError(relationType + "is not a valid relation type. Please use one of [oneToOne, oneToMany, manyToMany]")
		}
	}
	for(let field of fieldsList) {
		parsedSchema.klasses[klassName].addFieldSchema(field.key, field.schema, field.type)
	}

	for(let inverses of inversesList) {
		for(let inverseKlass in inverses) {
			parsedSchema.klasses[inverseKlass].addFieldSchema(inverses[inverseKlass].key, inverses[inverseKlass].schema, inverses[inverseKlass].type)
		}
	}
}

function validateRelationSchema(schema, paths) {
	if(schema.hasOwnProperty("$ref")) {
		if(!paths.hasOwnProperty(schema["$ref"])) {
			throw new TypeError(schema["$ref"] + " is not a valid schema reference")
		}
	} else if (schema.hasOwnProperty("oneOf")) {
		for(let item of schema.oneOf) {
			if(item.hasOwnProperty("$ref")) {
				if(!paths.hasOwnProperty(item["$ref"])) {
					throw new TypeError(item["$ref"] + " is not a valid schema reference")
				}
			} else {
				throw new TypeError("An item in 'oneOf' must have a '$ref' keyword referencing a schema")
			}
		}
	}
}

function buildOneToOne(relation, klassName, paths) {
	validateRelationSchema(relation, paths)

	let field = {}
	let inverses = {}
	if(relation.hasOwnProperty("$ref")) {
		let relatedKlass = paths[relation["$ref"]]
		field.schema = buildObjectField(relatedKlass, relation.referred, "object")
		field.key = relation.referrer
		field.type = "object"

		inverses[relatedKlass] = {}
		inverses[relatedKlass].schema = buildObjectField(klassName, relation.referrer, "object")
		inverses[relatedKlass].type = "object"
		inverses[relatedKlass].key = relation.referred
	} else if (relation.hasOwnProperty("oneOf")) {
		field = {}
		field.type="oneOf"
		field.key=relation.referrer
		field.schema = {
			"oneOf": []
		}
		for(let item of relation.oneOf) {
			let relatedKlass = paths[item["$ref"]]
			field.schema.oneOf.push(buildObjectField(relatedKlass, relation.referred, "object"))
			
			inverses[relatedKlass] = {}
			inverses[relatedKlass].type = "object"
			inverses[relatedKlass].key = relation.referred
			inverses[relatedKlass].schema = buildObjectField(relatedKlass, relation.referrer, "object")
		}
	}

	return {field, inverses}
}

function buildOneToMany(relation, klassName, paths) {
	validateRelationSchema(relation, paths)

	let field = {}
	let inverses = {}
	if(relation.hasOwnProperty("$ref")) {
		let relatedKlass = paths[relation["$ref"]]
		field.schema = buildArrayField(relation.referred, {"type": "object", "klass": relatedKlass}, "object")
		field.key = relation.referrer
		field.type = "array"

		inverses[relatedKlass] = {}
		inverses[relatedKlass].schema = buildObjectField(klassName, relation.referrer, "array")
		inverses[relatedKlass].type = "object"
		inverses[relatedKlass].key = relation.referred
	} else if (relation.hasOwnProperty("oneOf")) {
		field = {}
		field.type="array"
		field.key = relation.referrer

		let items = {
			"oneOf": []
		}

		for(let item of relation.oneOf) {
			let relatedKlass = paths[item["$ref"]]
			items.oneOf.push({"type": "object", "klass": relatedKlass})
			
			inverses[relatedKlass] = {}
			inverses[relatedKlass].type = "object"
			inverses[relatedKlass].key = relation.referred
			inverses[relatedKlass].schema = buildObjectField(klassName, relation.referrer, "array")
		}

		field.schema = buildArrayField(relation.referred, items, "object")
	}

	return {field, inverses}
}

function buildManyToMany(relation, klassName, paths) {
	validateRelationSchema(relation, paths)

	let field = {}
	let inverses = {}
	if(relation.hasOwnProperty("$ref")) {
		let relatedKlass = paths[relation["$ref"]]
		field.schema = buildArrayField(relation.referred, {type: "object", klass: relatedKlass}, "array")
		field.key = relation.referrer
		field.type = "array"

		inverses[relatedKlass] = {}
		inverses[relatedKlass].schema = buildArrayField(relation.referrer, {type: "object", klass: klassName}, "array")
		inverses[relatedKlass].type = "array"
		inverses[relatedKlass].key = relation.referred
	} else if (relation.hasOwnProperty("oneOf")) {
		field = {}
		field.type="array"
		field.key = relation.referrer

		let items = {
			"oneOf": []
		}

		for(let item of relation.oneOf) {
			let relatedKlass = paths[item["$ref"]]
			items.oneOf.push({"type": "object", "klass": relatedKlass})
			
			inverses[relatedKlass] = {}
			inverses[relatedKlass].type = "array"
			inverses[relatedKlass].key = relation.referred
			inverses[relatedKlass].schema = buildArrayField(relation.referrer, {type: "object", "klass": klassName}, "array")
		}

		field.schema = buildArrayField(relation.referred, items, "array")
	}

	return {field, inverses}
}

function buildArrayField(inverseKey, items, inverseType) {
	return {
		"type": "array",
		"items": items,
		"inverseKey": inverseKey,
		"inverseType": inverseType

	}
}

function buildObjectField(klass, inverseKey, inverseType) {
	return {
		"type": "object",
		"klass": klass,
		"inverseKey": inverseKey,
		"inverseType": inverseType
	}
}


/**
 * @param {array} relations - An array that contains all one to one relation schemas
 * @param {Schema} parsedSchema - A Schema object that contains the parsed Klasses to which relations must be added
 * @param {Object} paths - An object that maps a path of the form "#" or "#/definitions/<klassName>" to the corresponding klassName
 * @param {String} klassName - the name of the klass that these relations are added to
 */
function parseOneToOne(relations, parsedSchema, paths, klassName) {
	for(let relation of relations) {
		/* validate each relation by checking if the reference is correct */
		if(!relation.hasOwnProperty("$ref")) {
			throw new TypeError("A relation must have a reference to the related Klass definition")
		}

		if(!paths.hasOwnProperty(relation["$ref"])) {
			throw new TypeError("Klass "+relation["$ref"]+" is undefined")
		}

		/* Determine the other klass for this relation and create the fields that should
		 * be added to the schema */
		let otherKlass = paths[relation["$ref"]]

		let relationField = {
			"type": "object",
			"klass": otherKlass,
			"inverseKey": klassName.toLowerCase(),
			"inverseType": "object"
		}

		let inverseField = {
			"type": "object",
			"klass": klassName,
			"inverseKey": otherKlass.toLowerCase(),
			"inverseType": "object"
		}

		/* Determine the keys used to access the relation fields. Defaults to klassName.toLowerCase() */
		let relationKey = otherKlass.toLowerCase()
		let inverseKey = klassName.toLowerCase()

		if(relation.hasOwnProperty("referrer")) {
			relationKey = relation.referrer
		}

		if(relation.hasOwnProperty("referred")) {
			inverseKey = relation.referred
		}

		/* Add the fields to the schema */
		parsedSchema.klasses[klassName].addFieldSchema(relationKey, relationField, "object")
		parsedSchema.klasses[otherKlass].addFieldSchema(inverseKey, inverseField, "object")
	}
}

/**
 * @param {array} relations - An array that contains all one to many relation schemas
 * @param {Schema} parsedSchema - A Schema object that contains the parsed Klasses to which relations must be added
 * @param {Object} paths - An object that maps a path of the form "#" or "#/definitions/<klassName>" to the corresponding klassName
 * @param {String} klassName - the name of the klass that these relations are added to
 */
function parseOneToMany(relations, parsedSchema, paths, klassName) {
	for(let relation of relations) {
		/* Validate each relation by checking if the reference is correct */
		if(!relation.hasOwnProperty("$ref")) {
			throw new TypeError("A relation must have a reference to the related Klass definition")
		}

		if(!paths.hasOwnProperty(relation["$ref"])) {
			throw new TypeError("Klass "+relation["$ref"]+" is undefined")
		}
		
		/* Determine the other klass for this relation
		 * be added to the schema */
		let otherKlass = paths[relation["$ref"]]
		
		/* Determine the keys used to access the relation fields. Defaults to klassName.toLowerCase() */
		let relationKey = otherKlass.toLowerCase()
		let inverseKey = klassName.toLowerCase()

		/* Define the relation schemas */
		let relationField = {
			"type": "array",
			"items": {"type": "object", "klass": otherKlass},
			"inverseKey": klassName.toLowerCase(),
			"inverseType": "object"
		}

		let inverseField = {
			"type": "object",
			"klass": klassName,
			"inverseKey": otherKlass.toLowerCase(),
			"inverseType": "array"
		}


		if(relation.hasOwnProperty("referrer")) {
			relationKey = relation.referrer
		}

		if(relation.hasOwnProperty("referred")) {
			inverseKey = relation.referred
		}

		/* Add the fields to the schema */
		parsedSchema.klasses[klassName].addFieldSchema(relationKey, relationField, "array")
		parsedSchema.klasses[otherKlass].addFieldSchema(inverseKey, inverseField, "object")
	}
}

/**
 * @param {array} relations - An array that contains all many to many relation schemas
 * @param {Schema} parsedSchema - A Schema object that contains the parsed Klasses to which relations must be added
 * @param {Object} paths - An object that maps a path of the form "#" or "#/definitions/<klassName>" to the corresponding klassName
 * @param {String} klassName - the name of the klass that these relations are added to
 */
function parseManyToMany(relations, parsedSchema, paths, klassName) {
	for(let relation of relations) {
		/* validate each relation by checking if the reference is correct */
		if(!relation.hasOwnProperty("$ref")) {
			throw new TypeError("A relation must have a reference to the related Klass definition")
		}

		if(!paths.hasOwnProperty(relation["$ref"])) {
			throw new TypeError("Klass "+relation["$ref"]+" is undefined")
		}
		
		/* Determine the other klass for this relation and create the fields that should
		 * be added to the schema */
		let otherKlass = paths[relation["$ref"]]

		let relationField = {
			"type": "array",
			"items": {"type": "object", "klass": otherKlass},
			"inverseKey": klassName.toLowerCase(),
			"inverseType": "array"
		}

		let inverseField = {
			"type": "array",
			"items": {"type": "object", "klass": klassName},
			"inverseKey": otherKlass.toLowerCase(),
			"inverseType": "array"
		}

		/* Determine the keys used to access the relation fields. Defaults to klassName.toLowerCase() */
		let relationKey = otherKlass.toLowerCase()
		let inverseKey = klassName.toLowerCase()

		if(relation.hasOwnProperty("referrer")) {
			relationKey = relation.referrer
		}

		if(relation.hasOwnProperty("referred")) {
			inverseKey = relation.referred
		}

		/* Add the fields to the schema */
		parsedSchema.klasses[klassName].addFieldSchema(relationKey, relationField, "array")
		parsedSchema.klasses[otherKlass].addFieldSchema(inverseKey, inverseField, "array")
	}
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
				if(newProp.klass == undefined) {
				}
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