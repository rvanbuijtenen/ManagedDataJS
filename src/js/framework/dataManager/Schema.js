/**
 * An instance of KlassSchema describes an MObjects fields, fieldTypes and field relations.
 */
export class KlassSchema {
	/**
	 * A simple constructor that initializes fields and fieldTypes. It takes a string representing
	 * the klass's name as argument.
	 *
	 * @param {String} klass - A string representing the klass's name
	 */
	constructor(klass) {
		/**
		 * @type {String} A string representiing the klass's name
		 */
		this.klass = klass

		/**
		 * @type {Object} An object that maps property keys to field schemas
		 */
		this.fields = {}

		/**
		 * @type{Object} an object that maps property keys to field types
		 */
		this.fieldTypes = {}
	}

	/**
	 * @param {String, Symbol} propKey - The key of the field that we want to set the schema for
	 * @param {Object} field - A parsed JSON schema representing a single property
	 * @param {String} type - The type of the field that we want to set
	 */
	addFieldSchema(propKey, field, type) {
		this.fields[propKey] = field
		this.fieldTypes[propKey] = type
	}

	/**
	 * @param {String, Symbol} propKey - The key of the field that we want to retrieve the schema of
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
	 * @param {String, Symbol} propKey - The key of the field that we want to know if it exists
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
	 * @param {String, Symbol} propKey - The key of the field that we want to retrieve the type of
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
 * A schema wraps multiple KlassSchemas together into a single schema. It provides an interface
 * for adding and retrieving klassSchemas.
 */
export class Schema {
	/**
	 * A simple constructor that initializes the internal klasses property
	 */
	constructor() {
		/**
		 * @type {Object} An object that maps klass names to KlassSchema instances
		 */
		this.klasses = {}
	}

	/**
	 * @param {String, Symbol} klassName - A string representing the klass name that we want to add
	 * @param {KlassSchema} klass - The klass that we want to add
	 */
	addKlass(klassName, klass) {
		this.klasses[klassName] = klass
	}

	/**
	 * @param {String, Symbol} klassName - The klass that we want to retrieve
	 * @return {KlassSchema} The KlassSchema corresponding with the given klassName
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
 * parseSchema takes a raw JSON schema as argument and uses it to construct a Schema instance that is
 * is suitable for DataManagers to use to construct MObjects. The parseSchema function does not modify
 * the original schema.
 *
 * @param {Object} schema - An unparsed JSON schema
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
 * @param {Schema} schema - A Schema where parseDefinitions can store parsed KlassSchemas
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
 * @param {Object} schema - A complete unparsed JSON schema
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

/**
 * @param {String} relationType - String describing the type of relation. One of ["oneToOne", "oneToMany", "manyToMany"]
 * @param {Object} relations - A raw JSON schema for relations.
 * @param {parsedSchema} Schema - An instance of Schema that already contains all basic klass definitions.
 * @param {String} klassName - A string describing the name of the klass that these relations belong to.
 * @param {Object} paths - A javascript object that maps schema paths to klass names.
 * @throws {TypeError} When an invalid relation keyword is found in the schema, an error is thrown.
 */
function parseRelation(relationType, relations, parsedSchema, klassName, paths) {
	let fieldsList = []
	let inversesList = []
	/**
	 * Parse all relations of one type. For each relation: 
	 * build a relation field and inverses and add it to the list
	 */
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

	/* Loop over all fields and inverse fields and add them to the schema */
	for(let field of fieldsList) {
		parsedSchema.klasses[klassName].addFieldSchema(field.key, field.schema, field.type)
	}

	for(let inverses of inversesList) {
		for(let inverseKlass in inverses) {
			parsedSchema.klasses[inverseKlass].addFieldSchema(inverses[inverseKlass].key, inverses[inverseKlass].schema, inverses[inverseKlass].type)
		}
	}
}

/**
 * 
 * This function validates the relation:
 *		- if a reference is not defined within the paths object it is invalid
 *		- if a oneOf keyword is found, each reference within the oneOf is validated against the paths object
 *		- if neither of the above are present within the schema, the schema is invalid
 * 
 * @param {Object} schema - A raw JSON schema describing a relation
 * @param {Object} paths - A javascript object that maps schema paths to klass names
 * @Throws {TypeError} A TypeError is thrown when the schema contains an incorrect reference
 */
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
	} else {
		throw new TypeError("A relation must have a reference of oneOf keyword")
	}
}

/**
 * buildOneToOne takes a relation, a kassName which initiates the relation and a paths object that
 * maps schema paths to klass names. Based on this two or more field schemas are built:
 *
 *		- One field belonging to the initiating klass
 *		- One or more fields that refer to the first field. These fields are stored within an object that has indices representing klassNames that map to the corresponding schema
 *
 * @param {Object} relation - A single schema describing a relation
 * @param {String} klassName - The klass that this relation belongs to
 * @param {Object} paths - A javascript object that maps schema paths to klass names
 * @return {Object, Object} - The first object contains the field, and the second contains the inverse(s) of that field
 */
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

/**
 * buildOneToMany takes a relation, a kassName which initiates the relation and a paths object that
 * maps schema paths to klass names. Based on this two or more field schemas are built:
 *
 *		- One field belonging to the initiating klass
 *		- One or more fields that refer to the first field. These fields are stored within an object that has indices representing klassNames that map to the corresponding schema
 *
 * @param {Object} relation - A single schema describing a relation
 * @param {String} klassName - The klass that this relation belongs to
 * @param {Object} paths - A javascript object that maps schema paths to klass names
 * @return {Object, Object} - buildOneToMany creates the fields required for a one to 
 * many relation. The first object is the field for the klass initiating the relation.
 * The second object contains an inverse field for each other klass involved in the relation.
 */
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

/**
 * buildManyToMany takes a relation, a kassName which initiates the relation and a paths object that
 * maps schema paths to klass names. Based on this two or more field schemas are built:
 *
 *		- One field belonging to the initiating klass
 *		- One or more fields that refer to the first field. These fields are stored within an object that has indices representing klassNames that map to the corresponding schema
 *
 * @param {Object} relation - A single schema describing a relation
 * @param {String} klassName - The klass that this relation belongs to
 * @param {Object} paths - A javascript object that maps schema paths to klass names
 * @return {Object, Object} - buildManyToMany creates the fields required for a many to 
 * many relation. The first object is the field for the klass initiating the relation.
 * The second object contains an inverse field for each other klass involved in the relation.
 */
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

/**
 * buildArrayField constructs a schema for an array field based on an inverseKey (used to access the inverse of this field),
 * a list defining the items that can be stored in the array and the type of the inverse field (either "object" or "array")
 *
 * @param {String} inverseKey - The property key used to access the inverse field in this fields value
 * @param {Array} items - An object containing the schema for the item that this array field holds.
 * @param {String} inverseType - A string, either "object" or "array". Used to identify the type of the inverse field
 * @return {Object} A regular javascript object that describes the schema for the created field
 */
function buildArrayField(inverseKey, items, inverseType) {
	return {
		"type": "array",
		"items": items,
		"inverseKey": inverseKey,
		"inverseType": inverseType

	}
}

/**
 * buildObjectField constructs a schema for an object field based on the name of the klass contained in the field,
 * an inverseKey that is used to access the inverse of this field and the type of the inverse field (either "object" or "array")
 *
 * @param {String} klass - A string representing the klass that this object field must hold
 * @param {String} inverseKey - The property key used to access the inverse field in this fields value
 * @param {String} inverseType - A string, either "object" or "array". Used to identify the type of the inverse field
 * @return {Object} A regular javascript object that describes the schema for the created field
 */
function buildObjectField(klass, inverseKey, inverseType) {
	return {
		"type": "object",
		"klass": klass,
		"inverseKey": inverseKey,
		"inverseType": inverseType
	}
}

/**
 * parseProperty checks the schema for definitions that can contain references, and if a reference is found
 * it is replaced with a klass definitoion. The original schema is not modified. It also validates whether
 * required keywords are present.
 *
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