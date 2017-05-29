

export class SchemaInterpreter {
	
	isValidURL(str) {
		var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
			'((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
			'((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
			'(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
			'(\?[;&a-z\d%_.~+=-]*)?'+ // query string
			'(\#[-a-z\d_]*)?$','i'); // fragment locater
		if(!pattern.test(str)) {
			return false;
		} else {
			return true;
		}
	}
	
	parseSchema(schema) {
		// parse type: validate wheter it is an object. otherwise do not accept schema
		obj = Object.create(Object);
		if(!(schema.hasOwnProperty('type') && schema['type'] === 'object')) {
			throw new TypeError("not a valid schema: type must be object");
		}
		
		// parse definitions if they exist
		if(schema.hasOwnProperty('definitions')) {
			this.parseDefinitions(schema['definitions'];	
		}
								  
		// parse id
		let id = '';
		if(schema.hasOwnProperty['id']) {
			if(this.isValidURL(schema['id'])) {
				urlComponents = schema['id'].split('/');
				id = urlComponents.pop();
			} else {
				id = schema['id'];	
			}
		}
		
		// parse description
		let description = '';
		if(schema.hasOwnProperty['description']) {
			description = schema['description'];	
		}
		
		// parse properties
		if(!schema.hasOwnProperty['properties']) {
			throw new TypeError('Schema must have properties');	
		} else {
			this.parseProperties(schema['properties']);	
		}
	}
	
	parseProperties(properties) {
		for(var prop in properties) {
			parseObject(properties[prop]);
		}
	}
		
	parseObject(object) {
		if(object.hasOwnProperty['type']) {
			if(object['type'] === 'object') {
				// check for oneof 	
			} else {
				this.parseType(object['type']);
				// basic type	
			}
			// object
		} else if(object.hasOwnProperty['enum']) {
			// basic enum	
		} else if(object.hasOwnProperty['$ref']) {
			// reference	
		}
		
		// parse additional restrictions
	}
	
	parseType(type) {
		if(type.constructor == Array) {
			return this.parsePrimitiveType({"type": type[0]});
		} else if(type == "integer") {
			return 0;	
		} else if(type == "number") {
			return 0.0;	
		} else if(type == "string") {
			return "";	
		} else if(type == "array") {
			return [];
		} else if (type == "boolean") {
			return true;
		} else if (type == "null") {
			return null;
		} else {
			return "error: no type";
		}
	}
	// parse the definitions defined in this schema.
	parseDefinitions(definitions) {
		for(var def in definitions) {
			// store a reference to each defintions in the interpreter.defintions field such that
			// the key used to identify a definition (last part of a URI) refers to the actual 
			// definition within the schema
			this.definitions[def] = definitions[def];	
		}
	}
	
}


export class SchemaInterpreter {
	/**
	 * schema = type: object
	 * object = definitions + name + properties
	 * definitions = name: {}
	 * name = name:name
	 * properties = field: type
	 * type = basicType || object
	 */
	parseSchema(schema) {
		this.schema = schema;
		if(schema.hasOwnProperty('definitions')) {
			this.parseDefinitions(schema['definitions']);	
		}
		
		if(!schema.hasOwnProperty('name')) {
			throw new TypeError("schema must have a name");
		} else {
			this.schemaName = name;	
		}
		
		if(schema.hasOwnProperty('type')) {
			if(schema['type'] == 'object' && schema.hasOwnProperty('properties')) {
				return this.parseObject(schema['properties']);
			} else {
				throw new TypeError("schema must have a properties object");	
			}
		}
	}
	
	parseDefinitions(definitions, path) {
		for(var def in definitions) {
			if(definitions[def]['type']	== 'object') {
				let newPath = path + '/' + String(def);
				this.definitions[newPath] = definitions[def];
				console.log(newPath);
				this.parseDefinitions(definitions[def], path + '/' + String(def));	
			}
		}
	}
	
	parseObject(obj) {
		let o = {};
		for(var property in obj['properties']) {
			o[property] = this.parseProperty(obj['properties'][property]);
		}
		return o;
	}
	
	parseProperty(property) {
		if(property.hasOwnProperty('type')) {
			if(property['type'] == 'object') {
				return this.parseObject(property['properties']);	
			} else{
				return this.parsePrimitive(property['type']);	
			}
		}
		
		if(property.hasOwnProperty('$ref')) {
			return this.parseObject(this.refs[property['$ref']]);	
		}
	}

	parsePrimitive(type) {
		if(type.constructor == Array) {
			return this.parsePrimitiveType({"type": type[0]});
		} else if(type == "integer") {
			return 0;	
		} else if(type == "number") {
			return 0.0;	
		} else if(type == "string") {
			return "";	
		} else if(type == "array") {
			return [];
		} else if (type == "boolean") {
			return true;
		} else if (type == "null") {
			return null;
		} else {
			return "error: no type";
		}
	}
	
}
/*
export class SchemaInterpreter {
	
	parseDefinitions(definitions, path) {
		for(var def in definitions) {
			if(definitions[def]['type']	== 'object') {
				let newPath = path + '/' + String(def);
				this.definitions[newPath] = definitions[def];
				console.log(newPath);
				this.parseDefinitions(definitions[def], path + '/' + String(def));	
			}
		}
	}
	
	parseSchema(schema) {
		this.schema = schema;
		if(schema.hasOwnProperty('definitions')) {
			this.definitions = {};
			this.parseDefinitions(schema['definitions'], "#/definitions");
		}
		
		
		if(schema['type'] === 'object') {
			return this.parseObject(schema);
		} else {
			throw new Exception("This is not a valid schema");	
		}	
	}
	

	
	parseObject(obj) {
		return this.parseProperties(obj['properties']);
	}
	
	parseProperties(props) {
		let obj = {};
		obj.types = {};
		obj.definitions = this.schema['definitions'];
		console.log(obj.definitions);
		for(var prop in props) {
			console.log(prop);
			console.log(props[prop]);
			
			if(props[prop].hasOwnProperty('type')) { 
				obj.types[prop] = props[prop];
				console.log(obj.types);
				if(props[prop]['type'] == 'object') {
					obj[prop] = this.parseObject(props[prop]);	
				} else {
					obj[prop] = this.parsePrimitiveType(props[prop]);
				}
			} else if (props[prop].hasOwnProperty('$ref')) {
				
				let path = props[prop]['$ref'];
				console.log(path);
				obj[prop] = this.parseObject(this.definitions[path]); 
			}
		}
				/*
				console.log("ref");
				let path = props['$ref'].split('/');
				if(path[0] != '#') {
					throw new Exception('not a local path');	
				} else {
					let o = {};
					path.pop();
					for(var p in path) {
						o = this.definitions[p];
					}
					Object.defineProperty(obj, prop, {"value": this.parseObjectType(obj)});
				}
			}*/
			
	/*	return obj;
	}
	
	parsePrimitiveType(prop) {
		let type = prop['type'];
		if(type.constructor == Array) {
			return this.parsePrimitiveType({"type": type[0]});
		} else if(type == "integer") {
			return 0;	
		} else if(type == "number") {
			return 0.0;	
		} else if(type == "string") {
			return "";	
		} else if(type == "array") {
			return [];
		} else if (type == "boolean") {
			return true;
		} else if (type == "null") {
			return null;
		} else {
			return "error: no type";
		}
	}	
}*/