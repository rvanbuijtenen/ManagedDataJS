let RandExp = require('randexp');

export class SchemaInterpreter {
	parseSchema(schema) {
		console.log("parsing schema");
		// extract metaData (always defined within 'root' of schema
		//let metaData = this.parseMetaData(schema);
		if(schema.hasOwnProperty('definitions')) {
			this.parseDefinitions(schema['definitions'], '#/definitions');	
		}
		// parse the rest of this schema as an object
		if(schema.hasOwnProperty('type') && schema.type == 'object') {
			return this.parseObject(schema)
		}
	}
	
	parseDefinitions(definitions, path) {
		this.definitionsMap = Object.create(Object);
		this.definitionPaths = Object.create(Object);
		for(var object in definitions) {
			// store the definition in a map that maps the name of the definition to the definition itself
			this.definitionsMap[object] = definitions[object];
			// append /<object> to the path and map the path to the definition 
			let p = path + '/' + String(object);
			this.definitionPaths[p] = this.definitionsMap[object];
		}
	}
	
	parseObject(object) {
		console.log("parsing object");
		//let obj = Object.create(Object);
		if(object.hasOwnProperty('properties')) {
			return this.parseProperties(object['properties']);
		}
		
		if(object.hasOwnProperty('oneOf') || object.hasOwnProperty['anyOf']) {
			// parse oneOf. In the case of anyOf initialization is the same, so no need to add a new function
			return this.parseOneOf(object['oneOf']);
		}
		   
		if(object.hasOwnProperty('allOf')) {
			return this.parseAllOf(object['allOf']);
			// parse allOf	
		}
		
		if(object.hasOwnProperty('type') && object['type'] != 'object') {
			console.log(object);
			return this.parsePrimitive(object);	
		}
		
		if(object.hasOwnProperty('format')) {
			return this.parseFormat(object);	
		}
	}
	
	parseProperties(properties) {
		console.log("parsing properties");
		//console.log(properties);
		let obj = Object.create(Object);
		for(var propKey in properties) {
			if(properties[propKey].hasOwnProperty('type')) {
				let type = properties[propKey].type;
				//console.log(type);
				if(type == 'object') {
					obj[propKey] = this.parseObject(properties[propKey]);	
				} else {
					obj[propKey] = this.parsePrimitive(properties[propKey]);	
				}
			} else if (properties[propKey].hasOwnProperty('$ref')) {
				
				obj[propKey] = this.parseReference(properties[propKey]);	
			} else if (properties[propKey].hasOwnProperty('enum')) {
				obj[propKey] = this.parseEnum(properties[propKey]);	
			}
		}
		return obj;
	}
	
	parseEnum(enumObj) {
		let arr = enumObj['enum'];
		if(arr.length > 0) {
			return arr[0];
		} else {
			throw new TypeError("invalid enum: empty");
		}
	}
	
	parseReference(ref) {
		// ToDo: extend to accept urls to local and external files
		return this.parseObject(this.definitionPaths[ref['$ref']]);	
	}
	
	parseArray(arrayType) {
		let arr = [];
		let minItems = 0;
		if(arrayType.hasOwnProperty('minItems')) {
			minItems = arrayType['minItems']
		}
		console.log(minItems);
		if(arrayType.hasOwnProperty('items')) {
			for(var i=0; i<minItems; i++) {
				arr[i] = this.parseObject(arrayType['items']);
			}
		}
		return arr;
	}
	
	parseInteger(intType) {
		let value = 0;
		if(intType.hasOwnProperty('minimum')) {
			value = intType['minimum'];
			if(intType.hasOwnProperty('exclusiveMinimum') && intType['exclusiveMinimum'] == true) {
				value += 1;	
			}
		} else if(intType.hasOwnProperty('maximum')) {
			value = intType['maximum'];			
			if(intType.hasOwnProperty('exclusiveMaximum') && intType['exclusiveMaximum'] == true) {
				value -= 1;	
			}
		}
		
		if(intType.hasOwnProperty('multipleOf')) {
			value += intType['multipleOf'] - (value % intType['multipleOf']);
		}
		return value;
	}
	
	parseNumber(numberType) {
		let value = 0;
		if(numberType.hasOwnProperty('minimum')) {
			value = numberType['minimum'];
			if(numberType.hasOwnProperty('exclusiveMinimum') && numberType['exclusiveMinimum'] == true) {
				value += 1;	
			}
		} else if(numberType.hasOwnProperty('maximum')) {
			value = numberType['maximum'];			
			if(numberType.hasOwnProperty('exclusiveMaximum') && numberType['exclusiveMaximum'] == true) {
				value -= 1;	
			}
		}
		
		if(numberType.hasOwnProperty('multipleOf')) {
			value += numberType['multipleOf'] - (value % numberType['multipleOf']);
		}
		return value;	
	}
	
	parseString(stringType) {
		console.log(stringType);
		let str = '';
		if(stringType.hasOwnProperty('oneOf')) {
			str = this.parseOneOf(stringType['oneOf']);
		} else if(stringType.hasOwnProperty('pattern')) {
			if(stringType.hasOwnProperty('maxLength') && stringType.hasOwnProperty('minLength')) {
				throw new TypeError("It is not allowed to use both maxLength and minLength properties in combination with a regexp pattern");
			}
			let randexp = new RandExp(stringType['pattern']);
			randexp.max = 1;
			str = randexp.gen();
			if(stringType.hasOwnProperty('minLength')) {
				while(str.length < stringType['minLength']) {
					randexp.max++;
					str = randexp.gen();
				}
			} else if(stringType.hasOwnProperty('maxLength')) {
				while(str.length >= stringType['maxLength']) {
					str = randexp.gen();
				}
			}
		} else if(stringType.hasOwnProperty('minLength')) {
			for(var i = 0; i < stringType['minLength']; i++) {
				str = str + 'a';	
			}
		}
		return str;
	}
	
	parsePrimitive(typeObj) {
		let type = typeObj.type;
		if(type.constructor == Array) {
			return this.parsePrimitive({"type": type[0]});
		} else if(type == "integer") {
			return this.parseInteger(typeObj);	
		} else if(type == "number") {
			return this.parseNumber(typeObj);	
		} else if(type == "string") {
			return this.parseString(typeObj);
		} else if(type == "array") {
			return this.parseArray(typeObj);
		} else if (type == "boolean") {
			return true;
		} else if (type == "null") {
			return null;
		} else {
			return "error: no type";
		}
	}
	
	parseOneOf(oneOf) {
		console.log("parsing oneOf");
		for(var option in oneOf) {
			if(oneOf[option].hasOwnProperty('$ref')) {
				// by default we return the first oneOf option. 
				//Any other options of oneOf will simply be validated by a basic data manager. 
				//All we need to do here is to ensure a valid property exists within the data.
				return this.parseReference(oneOf[option]);
			} else if(oneOf[option].hasOwnProperty('format')){
				console.log("-----calling parse format-----");
				return this.parseFormat(oneOf[option]);
			}
		}
	}
	
	parseAllOf(allOf) {
		let target = Object.create(Object);
		// loop over all the options
		for(var option in allOf) {
			if(allOf[option].hasOwnProperty('$ref')){
			   	// parse the reference
				let one = this.parseReference(allOf[option]);
				
				// loop over the resulting object
				for(var prop in one) {
					if(!target.hasOwnProperty(prop)) {
						// if the target object does not have the property in the resulting object: merge it into target
						target[prop] = one[prop];
					}
				}
			}
		}
		return target;
	}
	
	parseFormat(format) {
		console.log(format);
		let f = format['format'];
		if(f == 'date-time') {
			return '1970-01-01 00:00:00';
		}
		
		if(f == 'email') {
			return 'a@a.aa';	
		}
		
		if(f == 'host-name') {
			return 'a';	
		}
		
		if(f == 'ipv4') {
			return '0.0.0.0'	
		}
		
		if(f == 'ipv6') {
			return '0:0:0:0:0:0:0:0';	
		}
		
		if(f == 'uri') {
			return 'http://a.a';	
		}
	}
}