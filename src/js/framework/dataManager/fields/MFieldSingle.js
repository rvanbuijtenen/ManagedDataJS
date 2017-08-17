import {MObject} from "../MObject"

/**
 * The basic MField class privides the API for data managers that
 * want to use the MFields values. By default we can invoke:
 *		
 * getValue		returns the internal value of the MField.
 * setValue		used to set the internal value of the MField.
 * getType			returns the type of the value stored in the MField.4
 * toString		returns a string representing this fields value
 *
 * Each class that extends MField must provide the validate(value) function
 * which returns true iff the given parameter matches the schema for this MField.
 */
export class MField {
	/**
	 * @param {String} type - A string representing the type of this MField
	 * @param {Object} schema - A JSON schema that describes this fields value
	 * @param {*} value - The value that should be used to initialize this MField
	 */
	constructor(type, schema, value) {
		/**
		 * String representing the type of the MField's value
		 * @type {String}
		 */
		this.type = type

		/**
		 * The schema describing this value
		 * @type {Schema}
		 */
		this.schema = schema

		/**
		 * The initial value for this MField
		 * @type {*}
		 */
		this.value = value
	}

	/**
	 * setValue takes a value as argument and attempts to validate this value. If it was valid we set 
	 * this.value to the value, and otherwise we throw the error returned by the validate method
	 * 
	 * @param {*} value - The value that should be set in this MField
	 */
	setValue(value) {
		let {valid, error} = this.validate(value)
		if(valid == false) {
			throw error
		} else {
			this.value = value
		}
	}

	/**
	 * @return {*} This MFields value
	 */
	getValue() {
		return this.value
	}

	/**
	 * @return {String} A string representing this MFields type
	 */
	getType() {
		return this.type
	}

	/**
	 * @return String representing this MFields value
	 */
	toString() {
		return this.type
	}

	validate(value) {
		let valid = true
		let error

		if(value === undefined) {
			valid = false
			error = new TypeError("Cannot validate 'undefined' in MField of type "+this.type)
		}
		return {valid, error}
	}

	is(other) {
		if(other.getValue() === this.value) {
			return true
		} else {
			return false
		}
	}
}

/**
 * Number implementation of MField which checks various schema constraint. See validate method.
 *
 */
export class NumberMField extends MField {
	/**
	 * @param {Object} schema - A JSON schema that describes this MFields value
	 */ 
	constructor(schema) {
		if(schema.hasOwnProperty("minimum")) {
			super("number", schema, schema.minimum)
		} else {
			super("number", schema, 0)
		}
	}

	/**
	 * Validate checks if the type of the value is a number. If it is, and additional constraints are present within the schema these are checked as well.
	 * See the schema reference for more information on the constraints.
	 * 
	 * @param {*} value - The value that should be validated
	 *
	 * @return {Boolean, Error} Validate returns a boolean indicating whether the field is valid. If it is invalid an error is also returned
	 */ 
	validate(value) {
		let {valid, error} = super.validate(value)

		if(valid == false) {
			return {valid, error}
		}

		if(typeof(value) == "number") {
			if( this.schema.hasOwnProperty("exclusiveMinimum") && this.schema.hasOwnProperty("minimum") && value <= this.schema.minimum) {
				error = new TypeError("Value assigned to "+this.type+"MField must be greater than "+this.schema.minimum)
				valid = false
				return {valid, error}
			} else if(this.schema.hasOwnProperty("minimum") && value < this.schema.minimum) {
				error = new TypeError("value assigned to "+this.type+"MField must be greater than or equal to "+this.schema.minimum)
				valid = false
				return {valid, error}
			}

			if(this.schema.hasOwnProperty("exclusiveMaximum") && this.schema.hasOwnProperty("maximum") && value >= this.schema.maximum) {
				error = new TypeError("value assigned to "+this.type+"MField must be less than "+this.schema.maximum)
				valid = false
				return {valid, error}
			} else if (this.schema.hasOwnProperty("maximum") && value > this.schema.maximum) {
				error = new TypeError("value assigned to "+this.type+"MField must be less than or equal to "+this.schema.maximum)
				valid = false
				return {valid, error}
			}

			if(this.schema.hasOwnProperty("multipleOf") && value%this.schema.multipleOf != 0) {
				error = new TypeError("value assigned to "+this.type+"MField must be a multiple of " + this.schema.multipleOf)
				valid = false
				return {valid, error}
			}


			valid = true
		} else {
			error = new TypeError("value assigned to "+this.type+"MField must be of type "+this.schema.type)
		}
		return {valid, error}
	}
}


/**
 * Integer implementation of MField that builds on top of the number field.
 */
export class IntegerMField extends NumberMField {
	/**
	 * @param {Object} schema - A JSON schema that describes this MFields value
	 */ 
	constructor(schema) {
		super(schema)
		/**
		 * Override NumberMFields type
		 * @type {String}
		 */
		this.type = "integer"
	}

	/**
	 * Method that checks whether the given value is a number, and also an integer.
	 * 
	 * @param {*} value - The value that should be validated
	 *
	 * @return {Boolean, Error} Validate returns a boolean indicating whether the field is valid. If it is invalid an error is also returned
	 */
	validate(value) {
		let {valid, error} = super.validate(value)
		if(valid == true) {
			if(value%1 == 0) {
				valid = true
			} else {
				valid = false
				error = new TypeError("value assigned to "+this.type+"MField must be of type "+this.schema.type)
			}
		}
		return {valid, error}
	}
}


 /**
 *	String implementation of MField.
 */
export class StringMField extends MField {
	/**
	 * @param {Object} schema - A JSON schema that describes this MFields value
	 */ 
	constructor(schema) {
		super("string", schema, "")
	}


	/**
	 * Method that checks whether the given value is a string. If it is, additonal constraints are checked
	 * if they are present in this fields schema.
	 *
	 * @param {*} value - The value that should be validated
	 *
	 * @return {Boolean, Error} Validate returns a boolean indicating whether the field is valid. If it is invalid an error is also returned
	 */
	validate(value) {
		let {valid, error} = super.validate(value)

		if(!typeof(value) === "string") {
			error = new TypeError("value assigned to "+this.schema.type+"MField must be a String")
			return {valid, error}
		}

		if(this.schema.hasOwnProperty("minLength") && value.length < this.schema.minLength) {
			error = new TypeError("value assigned to "+this.schema.type+"MField is shorter than the minimum length of "+this.schema.minLength)
			return {valid, error}
		}

		if(this.schema.hasOwnProperty("maxLength") && value.length > this.schema.maxLength + exclMax) {
			error = new TypeError("value assigned to "+this.schema.type+"MField is longer than the maximum length of "+this.schema.maxLength)
			return {valid, error}
		}

		if(this.schema.hasOwnProperty("pattern") ** value.match(this.schema.pattern) == null) {
			error = new TypeError("value assigned to "+this.schema.type+"MField does not match the pattern "+this.schema.pattern);
			return {valid, error}
		}

		if(this.schema.hasOwnProperty("format")) {
			if(this.schema.format == "date-time") {
				if(Date.parse(value) == NaN) {
					error = new TypeError("value assigned to "+this.schema.type+"MField does not match the date-time format")
					return {valid, error}
				}
			} else if (this.schema.format == "email") {
				if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value) == false) {
					error = new TypeError("value assigned to "+this.schema.type+"MField does not match the email format")
					return {valid, error}
				}
			} else if (this.schema.format == "hostname") {
				if(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(value) == false) {
					error = new TypeError("value assigned to "+this.schema.type+"MField does not match the hostname format")
					return {valid, error}
				}
			} else if (this.schema.format == "ipv4") {
				if(/^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/.test(value) == false) {
					error = new TypeError("value assigned to "+this.schema.type+"MField does not match the ipv4 format")
					return {valid, error}
				}
			} else if (this.schema.format == "ipv6") {
				if(/^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/.test(value) == false) {
					error = new TypeError("value assigned to "+this.schema.type+"MField does not match the ipv6 format")
					return {valid, error}
				}
			} else if (this.schema.format == "uri") {
				if(/^([a-z][a-z0-9+.-]*):(?:\/\/((?:(?=((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*))(\3)@)?(?=(\[[0-9A-F:.]{2,}\]|(?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*))\5(?::(?=(\d*))\6)?)(\/(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\8)?|(\/?(?!\/)(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\10)?)(?:\?(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\11)?(?:#(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\12)?$/.test(value) == false) {
					error = new TypeError("value assigned to "+this.schema.type+"MField does not match the uri format")
					return {valid, error}
				}
			}
		}

		valid = true;
		return {valid, error}
	}
}

/**
 * Boolean implementation of MField.
 */
export class BooleanMField extends MField {
	/**
	 * @param {Object} schema - A JSON schema that describes this MFields value
	 */ 
	constructor(schema) {
		super("boolean", schema, false)
	}

	/**
	 * Checks if the given value is boolean
	 *
	 * @param {*} value - The value that should be validated
	 *
	 * @return {Boolean, Error} Validate returns a boolean indicating whether the field is valid. If it is invalid an error is also returned
	 */
	validate(value) {
		let valid, error = super.validate(value)
		if(value === false || value === true) {
			return {valid, error}
		} else {
			valid = false;
			error = new TypeError("value assigned to "+this.schema.type+"MField must be a Boolean")
			return {valid, error}
		}
	}
}

/**
 * MObject implementation of MField. Besides validating, an MObjectMField also manages relations with other
 * fields 
 */
export class MObjectMField extends MField {
	/**
	 * @param {Object} schema - A JSON schema that describes this MFields value
	 * @param {MObject} superKlass - The MObject that this field belongs to
	 */ 	
	constructor(schema, superKlass) {
		super("object", schema, null)

		/**
		 * The MObject that this OneOfMField belongs to
		 * @type {MObject}
		 */
		this.superKlass = superKlass
	}

	/**
	 * Validates whether the given value is an MObject of a klass matching its schema
	 *
	 * @param {*} value - The value that should be validated
	 *
	 * @return {Boolean, Error} Validate returns a boolean indicating whether the field is valid. If it is invalid an error is also returned
	 */
	validate(value) {
		let {valid, error} = super.validate(value)
		if(value == null) {
			return {valid, error}
		}

		/* Validate that the given value is an MObject and that it is of the right Klass */
		if(!(value instanceof MObject && value.getKlass() == this.schema.klass)) {
			console.log(value, value instanceof MObject, value.getKlass() == this.schema.klass, this.schema)
			error = new TypeError("value assigned to "+this.schema.type+"MField must be managed data")
			valid = false;
			return {valid, error}
		}

		valid = true
		return {valid, error}
	}

	/**
	 * setValue checks if the object has any relations, and if it does this object is added
	 * to the related object.
	 *
	 * @param {MObject} value - An MObject that should be set as value of this MField
	 */
	setValue(value) {
		super.setValue(value)

		if(value == null) {
			return
		}
		if(this.schema.hasOwnProperty("inverseKey")) {
			if(this.schema.inverseType == "object") {
				if(this.value[this.schema.inverseKey] != this.superKlass)
				value[this.schema.inverseKey] = this.superKlass
			} else {
				if(!(this.value[this.schema.inverseKey].includes(this.superKlass))) {
					this.value[this.schema.inverseKey].push(this.superKlass)
				}
			}
		}
	}
}