export class SchemaInterpreter {
	parseSchema(schema) {
		if(!schema.hasOwnProperty('properties')) {
			throw new TypeError('schema must have properties');	
		}
		
		this.klasses = [schema['name']];
		this.klassSchemas = Object.create(Object);
		this.klassPaths = Object.create(Object);
		this.currentSubKlasses = [];
		let baseSchema = Object.create(Object);
		baseSchema['type'] = 'object';
		baseSchema['properties'] = schema['properties'];
		this.klassSchemas[schema['name']] = Object.create(Object);
		this.klassSchemas[schema['name']].schema = baseSchema;
		
		if(schema.hasOwnProperty('definitions')) {
			this.parseDefinitions(schema['definitions']);	
		}
		
		this.parseObject(schema, schema['name']);
		this.klassSchemas[schema['name']].subKlasses = this.currentSubKlasses;
		return {"mainKlass": schema['name'], "klassSchemas": this.klassSchemas};
	}
	
	parseDefinitions(definitions) {
		for(var definition in definitions) {
			this.klasses.push(definition);
			this.klassSchemas[definition] = Object.create(Object);
			this.klassSchemas[definition].schema = definitions[definition];
			this.klassPaths['#/definitions/'+definition] = definition;
			this.klassSchemas[definition].subKlasses = this.currentSubKlasses;
		}

		for(var definition in definitions) {		
			this.parseObject(this.klassSchemas[definition].schema, definition);
		}
	}
	
	parseObject(object, klass) {
		this.currentSubKlasses = [];
		this.currentKlass=(klass);
		this.parseProperties(object['properties']);	
	}
	
	parseProperties(properties) {
		for(var propKey in properties) {
			let property = properties[propKey];
			if(property.hasOwnProperty('type') && !property.hasOwnProperty('$ref')) {
				this.parseType(property);
			}
			if(property.hasOwnProperty('$ref')) {
				property['type'] = this.klassPaths[property['$ref']];
				this.currentSubKlasses.push(this.klassPaths[property['$ref']]);
				delete property['$ref'];
			}
			if(property.hasOwnProperty['enum']) {
				this.parseTypeArray(property['enum']);
			}
		}
	}
	
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
		console.log("parsing type array");
		console.log(arr);
		for(var item of arr) {
			if(item.hasOwnProperty('$ref')) {
				item['type'] = this.klassPaths[item['$ref']];
				console.log(this.klassPaths);
				console.log(item['$ref']);
				console.log(this.klassPaths[item['$ref']]);
				this.currentSubKlasses.push(this.klassPaths[item['$ref']]);
				delete item['$ref'];
			} else if(item.hasOwnProperty('type') && item['type'] != 'object'){
				this.parseType(item);	
			} else if(item.hasOwnProperty('format')){
				
			} else {
				throw new TypeError("oneOf containing objects must consist of basic types, or have a reference to '#/definitions/<definition>' containing the object definition");
			}
		}
	}
}