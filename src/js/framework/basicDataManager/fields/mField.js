export class MField {
	constructor(schema, defaultValue) {
		this.schema = schema;
		this.value = defaultValue;
	}

	setValue(value) {
		if(this.validate(value)) {
			this.value = value;
		}
	}

	getValue() {
		return this.value;
	}

	getType() {
		return this.type;
	}
}

export class MObjectMField extends MField {
	constructor(schema, superKlass, superSchema) {
		super(schema, {"klass": schema.klass});

		if(superKlass !== undefined && superSchema !==  undefined) {
			
			if(!(superKlass instanceof MField)) {
				this.superKlass = MFieldFactory.MField(superSchema)
				this.superKlass.setValue(superKlass);
			} else {
				this.superKlass = superKlass;
			}
		}
		this.type = "MObject";
	}

	setValue(value) {
		super.setValue(value);
		if(this.schema.hasOwnProperty('inverse')) {
			if("getKlass" in value && value.getKlass() == this.getKlass()) {
				if(value[this.schema.inverse] instanceof ArrayMField) {
					
					value[this.schema.inverse].push(this.superKlass);
				} else {
					value[this.schema.inverse] = this.superKlass;
				}
			}
		}
	}

	getKlass() {
		return this.schema.klass;
	}

	validate(value) {
		console.log()
		if(!("getKlass" in value) && !(value instanceof MField)) {
			console.log(value, this.schema);
			throw new TypeError("Object must be of klass "+this.schema.klass+" but value is not managed data");
		} else {
			if(!value.getKlass() == this.schema.klass) {
				throw new TypeError("Object must be of klass "+this.schema.klass+"but value is of klass "+value.getKlass());
			}
		}
		return true;
	}
}

export class FinalMField extends MField {
	constructor(schema) {
		super(schema, schema);
		this.type = "final";
	}

	validate(value) {
		if(value != schema) {
			throw new TypeError("Value must be " + this.schema);
		}
		return true;
	}
}

export class MultiMField extends MField {
	constructor(schema) {
		super(schema, null);
		this.items = {};
		this.type = "multi";
		let items = [];
		if(schema.hasOwnProperty("enum")) {
			items = schema.enum;
		} else if (schema.hasOwnProperty("oneOf")) {
			items = schema.oneOf;
		}
		for(let item of items) {
			let field = MFieldFactory.MField(item);
			let type = field.getType();
			if(type == "final") {
				if(!this.items.hasOwnProperty("final")) {
					this.items.final = [];
				}
				this.items.final.push(field);
			} else if(type == "MObject") {
				if(!this.items.hasOwnProperty("object")) {
					this.items.object = [];
				}
				this.items.object.push(field);
			} else {
				this.items[type] = field;
			}
		}
	}

	validate(value) {
		let type = typeof(value);
		let klass = "";

		if(type == "object") {
			if(value instanceof Array) {
				type = "array";
			} else if ("getKlass" in value) {
				type = "object";
				klass = value.getKlass();
			}
		}
		if(this.items.hasOwnProperty(type)) {
			if(type == "object") {
				for(let obj of this.items[type]) {
					if(obj.getKlass() == klass) {
						return true;
					}
				}
			} else {
				this.items[type].validate(value);
			}
		} else if (this.items.hasOwnProperty("multi")) {
			this.items.multi.validate(value);
		} else if (this.items.hasOwnProperty("final")) {
			for(let item of this.items.final) {
				if(item.getValue() == value) {
					return true;
				}
			}
			throw new TypeError("Invalid final value of enum");
		}
		return true;
	}
}

export class ArrayMField extends MField {
	constructor(schema, superKlass) {
		super(schema, []);
		this.superKlass = superKlass;
		this.type = schema.type;
		//this.proxy = new Proxy(this, arrayHandler);
		if(schema.hasOwnProperty("items")) {
			if(schema.items instanceof Array) {
				this.items = schema.items;
			} else {
				this.items = [schema.items];
			}
		}
		this[Symbol.iterator] = this.getIterator;
	}

	validate(value) {
		if(!value instanceof Array) {
			throw new TypeError("Value "+value+" must be an array but its type is "+typeof(value));
		}
		
		if(this.hasOwnProperty("items")) {
			let length = 0;
			for(let item of value) {
				let field = MFieldFactory.MField(this.items[length%this.items.length]);
				try{ 
					field.validate(item);
				} catch(err) {

					console.log(item, value);
					throw new TypeError("Item assigned to array is of an invalid type");
				}
				length++;
			}	
		}
		return true;
	}

	push(...values) {
		if(!this.validate(values)) {
			throw new TypeError("error in push");
		}
		for(let value of values) {
			if(value instanceof MField) {
				this.value.push(value.getValue());
			} else {
				this.value.push(value);
			}
		}
		this.superKlass.notifyArrayChanged(this);
	}

	find(idx) {
		if(idx > this.value.length || idx < 0) { 
			throw new TypeError("index "+idx+" is out of bounds");
		} else {
			return this.value[idx].getValue();
		}
	}

	getIterator() {
		return this.getValues()[Symbol.iterator]();
	}

	getValues() {
		let arr = [];
		for(let value of this.value) {
				arr.push(value);
			
		}
		return arr;
	}

	getValue() {
		return this;
	}
}

export class StringMField extends MField {
	constructor(schema) {
		super(schema, "");
		this.type = schema.type;
	}

	validate(value) {
		if(!typeof(value) === "string") {
			throw new TypeError("Value "+value+" should be a string but its type is "+typeof(value));
		}

		if(this.schema.hasOwnProperty("minLength") && value.length < this.schema.minLength) {
			throw new TypeError("String "+value+" is shorter than the minimum length of "+this.schema.minLength)
		}

		let exclMax = 0;
		if(this.schema.hasOwnProperty("exclusiveMaximum") && this.schema.exclusiveMaximum == true) {
			exlMax = 1;
		}

		if(this.schema.hasOwnProperty("maxLength") && value.length > this.schema.maxLength + exclMax) {
			throw new TypeError("String "+value+" is longer than the maximum length of "+this.schema.maxLength)
		}

		if(this.schema.hasOwnProperty("pattern") ** value.match(this.schema.pattern) == null) {
			throw new TypeError("String "+value+" does not match the pattern "+this.schema.pattern);
		}

		return true;
	}
}

export class BooleanMField extends MField {
	constructor(schema) {
		super(schema, false);
		this.type = schema.type;
	}

	validate(value) {
		if(typeof(value) !== "boolean") {
			throw new TypeError("Value "+value+" should be a boolean but its tye is "+typeof(value));
		}
		return true;
	}
}

export class NumberMField extends MField {
	constructor(schema) {
		super(schema, 0);
		this.type = schema.type;
	}

	validate(value) {
		if(typeof(value) !== "number") {
			throw new TypeError("Value "+value+" should be a number but its type is "+typeof(value));
		}
		return true;
	}
}

export class IntegerMField extends NumberMField {
	constructor(schema) {
		super(schema);
		this.type = schema.type;
	}

	validate(value) {
		super.validate(value);
		if(value%1 != 0) {
			throw new TypeError("Value "+value+ " is a number but not an integer");
		}
		return true;
	}


}

export class MFieldFactory {
	static MField(schema, superKlass, superSchema) {
		if(schema.hasOwnProperty("type")) {
			let type = schema.type;
			if(type == "integer") {
				return new IntegerMField(schema);
			} else if (type == "number") {
				return new NumberMField(schema);
			} else if (type == "string") {
				return new StringMField(schema);
			} else if (type == "boolean") {
				return new BooleanMField(schema);
			} else if (type == "array") {
				return new ArrayMField(schema, superKlass);
			} else if (type == "object") {
				return new MObjectMField(schema, superKlass, superSchema);
			}
		} else if (schema.hasOwnProperty("enum") || schema.hasOwnProperty("oneOf")) {
			return new MultiMField(schema);
		} else {
			return new FinalMField(schema);
		}
	}
}