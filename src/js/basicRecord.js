/**
 * Initialize AJV for schema validation
 */
let Ajv = require('ajv');
let ajv = Ajv({allErrors: true});

/**
 * The basicRecordHandler intercepts the get and set method of an object.
 */
var basicRecordHandler = {
	/**
	 * When a get method is intercepted, we verify if the target 
	 * does indeed contain a field with the given propKey
	 */
	get(target, propKey, receiver) {
		if (!(propKey in target)) {	
			//throw new ReferenceError('Unknown property: '+propKey);
			console.log('ERROR: Unknown property: '+propKey);
		}
		return Reflect.get(target, propKey, receiver);
	},
	
	/**
	 * When a set method is intercepted we also verify if the target
	 * contains a field with the given propKey. If the target contains this
	 * field, we also verify its type based on the target schema.
	 *
	 * To Do: Verify single field rather than the entire object
	 */
	set(target, propKey, value, receiver) {
		/* validate that propKey does indeed exist */
		if (!(propKey in target)) {	
			//throw new ReferenceError('Assigning to unknown property: '+propKey);
			console.log('ERROR: Assigning to unknown property: '+propKey);
			return true;
		}
		
		/* execute the assignment, store the succes value */
		let isSuccesful = Reflect.set(target, propKey, value, receiver);
		
		/* validate the new state of the object agains the schema and throw an error if it doesn't match */
		if(!ajv.validate(target.schema, target)) {
			//throw new TypeError('Assigning invalid type to '+propKey+'. Type must be '+
			//					target.schema.properties[propKey].type);
			console.log('ERROR: Assigning invalid type to '+propKey+'. Type must be '+target.schema.properties[propKey].type);
		}
		
		return isSuccesful;
	}
};


export class BasicRecord {
	/**
	 * Build an object with default values based on the given schema. Attach a
	 * proxy handler to implement basic record functionality
	 */
	constructor(schema) {
		var record = {};
		record['schema'] = schema;
		for (var property in schema.properties) {
			if(schema.properties.hasOwnProperty(property)) {
				record[property] = this.getDefaultValue(schema.properties[property].type);
			}
		}
		return new Proxy(record, basicRecordHandler);
	}
	
	/* this function returns a default value for a given string corresponding with 
	 * a default type of JSON schema */
	getDefaultValue(type) {
		if(type === "integer") {
			return 0;	
		} else if(type === "number") {
			return 0.0;	
		} else if(type === "string") {
			return "";	
		} else {
			return 0;
		}
	}
}