export class SchemaInterpreter {
	/**
	 * 
	 */
	parseSchema(schema) {
		if(!schema.hasOwnProperty('name')) {
			throw new TypeError('schema must have a name');
		}
		if(!schema.hasOwnProperty('properties')) {
			throw new TypeError('schema must have properties');	
		}
		
		/* Add the name of the schema as identifier for the 'main klass' */
		this.klasses = [schema.name];

		/* initialize an object that maps klass names to schema definitions */
		this.klassSchemas = Object.create(Object);
		/* initialize an object that maps reference paths to klass names */
		this.klassPaths = Object.create(Object);

		/* initialize an empty array that will be used as stack to keep track
		 * of the klasses contained within a klass's fields */
		this.currentSubKlasses = [];

		/* create an empty main schema, set its type and copy the properties 
		 * from the given schema, then add this schema to the schema that will 
		 * contain all klass definitions */
		let mainSchema = Object.create(Object);
		mainSchema['type'] = 'object';
		mainSchema['properties'] = schema['properties'];
		this.klassSchemas[schema.name] = Object.create(Object);
		this.klassSchemas[schema.name].schema = mainSchema;
		
		/* parse the definitions from the schema, if they exist */
		if(schema.hasOwnProperty('definitions')) {
			this.parseDefinitions(schema['definitions']);	
		}
		
		/* parse the schema as an object */
		this.parseObject(schema, schema['name']);

		/* append the found sub klasses to the main schema */
		this.klassSchemas[schema.name].subKlasses = this.currentSubKlasses;
		
		/* return an object containing the name of the main klass and a klassSchemas field
		 * containing schema definitions for all klasses that were defined within the schema */
		return {"mainKlass": schema['name'], "klassSchemas": this.klassSchemas};
	}
	
	parseDefinitions(definitions) {
		for(let definition in definitions) {
			/* append the definition name as a klass name and add the definition as a separate schema */
			this.klasses.push(definition);
			this.klassSchemas[definition] = Object.create(Object);
			this.klassSchemas[definition].schema = definitions[definition];

			/* map the path that a $ref will use to the definition name */
			this.klassPaths['#/definitions/'+definition] = definition;
		}

		for(let definition in definitions) {
			/* loop over each definition again. This time parse the definition as an object 
			 * and add the sub klasses to the subKlasses field of the schema */		
			this.parseObject(this.klassSchemas[definition].schema, definition);
			this.klassSchemas[definition].subKlasses = this.currentSubKlasses;
		}
	}
	
	parseObject(object, klass) {
		/* reinitialize the currentSubKlasses field and set the current klass */
		this.currentSubKlasses = [];
		this.currentKlass = klass;

		/* parse the object's properties */
		this.parseProperties(object['properties']);	
	}
	
	parseProperties(properties) {
		for(var propKey in properties) {
			/* for each property: */
			let property = properties[propKey];
			if(property.hasOwnProperty('type') && !property.hasOwnProperty('$ref')) {
				/* if the property has a type field, but no reference, we parse its type */
				this.parseType(property);
			}
			if(property.hasOwnProperty('$ref')) {
				/* if we find a reference: set the klass name as a type and remove the 
				 * reference from the schema */
				property['type'] = this.klassPaths[property['$ref']];
				this.currentSubKlasses.push(this.klassPaths[property['$ref']]);
				delete property['$ref'];
			}
			if(property.hasOwnProperty['enum']) {
				/* if we encounter an enum: parse each type in the type array */
				this.parseTypeArray(property['enum']);
			}
		}
	}
	
	/*
	 * If we find an 'items', 'oneOf', 'anyOf' or 'allOf' keyword, then we parse each 
	 * type in the type array. If the type is an object we throw an error, since each
	 * property that is an object must have a definition in the 'defenitions' object of
	 * the schema, and then the field must reference that definition through the '$ref' keyword
	 */
	parseType(typeObj) {
		let type = typeObj['type'];
		if(type == 'array') {
			if(typeObj.hasOwnProperty('items')) {
				this.parseTypeArray(typeObj.items);	
			}
		} else if(typeObj.hasOwnProperty('oneOf')) {
			this.parseTypeArray(typeObj['oneOf']);	
		} else if(typeObj.hasOwnProperty('anyOf')) {
			this.parseTypeArray(typeObj['anyOf']);	
		} else if(typeObj.hasOwnProperty('allOf')) {
			this.parseTypeArray(typeObj['allOf']);	
		} else if(type == 'object'){
			throw new TypeError("A property referring to an object must have a reference to '#/definitions/<definition>' containing the object definition");	
		}
	}
	
	parseTypeArray(arr) {
		for(var item of arr) {
			if(item.hasOwnProperty('$ref')) {
				/* if we find a reference in the type array: replace this reference by a klass */
				item['type'] = this.klassPaths[item['$ref']];
				this.currentSubKlasses.push(this.klassPaths[item['$ref']]);
				delete item['$ref'];
			} else if(item.hasOwnProperty('type') && item['type'] != 'object'){
				/* if we find a type: parse this type */
				this.parseType(item);	
			} else if(item.hasOwnProperty('format')){
				/* TO DO: format */
			} else if (typeof(item) == Object) {
				/* if the item is an object, we throw an error since an object must have a reference to a definition */
				throw new TypeError("oneOf containing objects must consist of basic types, or have a reference to '#/definitions/<definition>' containing the object definition");
			}
		}
	}
}