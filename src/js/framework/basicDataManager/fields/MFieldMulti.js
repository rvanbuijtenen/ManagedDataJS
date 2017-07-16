import {MField} from "./MFieldSingle"
import {MFieldFactory} from "./MFieldFactory"

export class ArrayHandler {
	get(target, propKey, value) {
		if(typeof(propKey) == "number") {
			return target.get(propKey)
		} else {
			return Reflect.get(target, propKey, value)
		}
	}
}

/**
 * The array MField implementation is a bit different from other MField implementations.
 * An ArrayMField must act like a regular JavaScript array and therefore it forwards all
 * original ArrayMethods to the array stored within the value field and applies validation
 * where neccesary. When the array has been modified, the arrayHasChanged() callback is
 * invoked on the MObject it belongs to.
 *
 *
 * the ArrayMField always returns regular javascript values or managed objects.
 * the ArrayMField always takes regular javascript values as input.
 * the ArrayMField.value only contains objects that are instances of MFields.
 */
export class ArrayMField extends MField {
	constructor(schema, superKlass) {
		console.log("superKlass:", superKlass)
		super("array", schema, [])
		this.superKlass = superKlass
		this.itemsIdx = 0
		this.length = 0
		this[Symbol.iterator] = this.iterator
	}

	concat(...values) {
		for(let value of values) {
			if(value instanceof Array) {
				this.push(...value)
			} else {
				this.push(value)
			}
		}
	}
	
	copyWithin(target, start, end) {
		return this.value.copyWithin(target, start, end)
	}
	
	entries() {
		return this.getValues().entries()
	}
	
	every(callback, thisarg) {
		return this.getValues().every(callback, thisarg)
	}
	
	fill(value, start, end) {
		let newArr = this.getValues().fill(value)
		let {valid, error, fields} = this.validate(newArr)

		if(valid == false) {
			throw error
		} else {
			this.value = fields
			return newArr
		}
	}
	
	filter(callback, thisarg) {
		return this.getValues().filter(callback, thisarg)
	}

	find(callback, thisarg) {
		return this.getValues().find(callback, thisarg)
	}

	findIndex(callback, thisarg) {
		return this.getValues().findIndex(callback, thisarg)
	}
	
	forEach(callback, thisarg) {
		let arr = this.getValues()
		arr.forEach(callback, thisarg)

		let {valid, error, fields} = this.validate(arr)
		if(valid == false) {
			throw error
		} else {
			this.value = fields
		}
	}
	
	includes(searchElement, fromIndex) {
		if(fromIndex == undefined) {
			return this.getValues().includes(searchElement)
		} else {
			return this.getValues().includes(searchElement, fromIndex)
		}
	}

	indexOf(searchElement, fromIndex) {
		if(fromIndex == undefined) {
			return this.getValues().indexOf(searchElement)
		} else {
			return this.getValues().indexOf(searchElement, fromIndex)
		}
	}

	join(separator) {
		throw new Error("Managed Arrays cannot be joined into strings")
	}
	
	keys() {
		return this.getValues().keys()
	}

	lastIndexOf(searchElement, fromIndex) {
		if(fromIndex == undefined) {
			return this.getValues().lastIndexOf(searchElement)
		} else {
			return this.getValues().lastIndexOf(searchElement, fromIndex)
		}
	}

	map(callback, thisarg) {
		let newArr = this.getValues().map(callback, thisarg)
		let {valid, error, fields} = this.validate(newArr)

		if(valid == false) {
			throw new TypeError(errors)
		} else {
			return newArr
		}
	}
	
	pop() {
		let value = this.value.pop()
		if(value != undefined) {
			return value.getValue()
		} else {
			return value
		}
	}

	push(...elements) {
		console.log(elements)
		console.log(this.validate(elements))
		let {valid, error, fields} = this.validate(elements)

		if(valid == false) {
			throw error
		} else {
			for(let field of fields) {
				this.value.push(field)
				this.itemsIdx = (this.itemsIdx+1)%this.schema.items.length
			}
		}
	}
	
	reduce(callback, initialValue) {
		return this.getValues().reduce(callback, initialValue)
	}

	reduceRight(callback, initialValue) {
		return this.getValues().reduceRight(callback, initialValue)
	}

	reverse() {
		this.value.reverse()
		return this.getValues()
	}

	shift() {
		let element = this.value.shift()
		return element.getValue()
	}
	
	slice(begin, end) {
		return this.getValues().slice(begin, end)
	}
	
	some(callback, thisarg) {
		return this.getValues().some(callback, thisarg)
	}
	
	sort(compareFunction) {
		let sorted = this.getValues().sort(compareFunction)
		let {valid, error, fields} = this.validate(sorted)
		if(valid == false) {
			throw error
		} else {
			this.value = fields
		}

	}

	splice(start, deleteCount, ...items) {
		let {valid, error, fields} = this.validate(items)

		if(valid == false) {
			throw error
		} else {
			this.value.splice(start, deleteCount, ...fields)
		}
	}

	toLocaleString() {
		throw new TypeError("managed arrays cannot be converted to strings")
	}

	toSource() {
		throw new TypeError("managed arrays cannot be converted to strings")
	}

	toString() {
		throw new TypeError("managed arrays cannot be converted to strings")
	}
	
	unshift(...elements) {
		let {valid, error, fields} = this.validate(elements)

		if(valid == false) {
			throw new TypeError(error)
		} else {
			this.value.unshift(...fields)
		}
	}
	
	iterator() {
		return this.getValues()[Symbol.iterator]()
	}

	/** 
	 * Implementation of the validate function for ArrayMField 
	 *
	 * 		INPUT:
	 *			values: 	An array containing the values to validate
	 *		OUTPUT:
	 *			valid: 		boolean indicating whether all values where valid
	 *			fields: 	an array containing valid MFields of the given values. only when valid == true
	 *			errors: 	if there were any validation errors these are stored in errors as a string
	 */
	validate(values) {
		if(values == undefined) {
			return {true, undefined, undefined}
		}

		console.log("in validate: ", values)

		let fields = []
		let valid = true;
		let error
		let field

		if(this.schema.items instanceof Array) {
			console.log("validating array of items")
			let tmpItemsIdx = this.itemsIdx
			for(let value of values) {
				field = MFieldFactory(this.schema.items[tmpItemsIdx], this.superKlass)
				tmpItemsIdx++;

				try { 
					field.setValue(value)
				} catch (err) {
					valid = false
					error = err
					break
				}

				fields.push(field)
			}
		} else {
			console.log("validating single item")
			for(let value of values) {
				console.log(value, this.schema.items)
				field = MFieldFactory(this.schema.items, this.superKlass)
				console.log(field)
				try { 
					field.setValue(value)
				} catch (err) {
					valid = false
					error = err
					break
				}

				fields.push(field)
			}
		}
		return {valid, error, fields}
	}

	get(idx) {
		if(this.value.hasOwnProperty(idx)) {
			return this.value[idx].getValue()
		} else {
			return false
		}
	}

	/* Override of getValues of MFIeld */
	getValues() {
		let arr = []
		for(let val of this.value) {
			arr.push(val.getValue())
		}
		return arr
	}

	getValue() {
		return this
	}

	/* Overrite setValue of MField */
	setValue(values) {
		if(!(values instanceof Array)) {
			throw new TypeError("The value of an ArrayMField can only be set to that of an actual JavaScript array")
		} else {
			this.value = [];
			this.push(...values)
		}
	}
}


/**
 * Enum implementation of MField which checks the following constraints:
 *
 *		REQUIRED:
 *			value		===>	enum.includes(value)
 */
export class EnumMField extends MField {
	constructor(schema) {
		super("enum", schema, schema.enum[0])
	}

	validate(value) {
		let valid = false;
		let error
		if(!this.schema.enum.includes(value)) {
			error = new TypeError("value must be one of "+JSON.stringyfy(schema.enum))
			return {valid, error}
		} else {
			valid = true
			return {valid, error}
		}
	}
}

/**
 *	OneOF implementation of MFIeld which checks the following constraints:
 *
 *		REQUIRED:
 *			value		===>	value matches at least one schema in schema.oneOf
 */
export class OneOfMField extends MField {
	constructor(schema, superKlass) {
		console.log("constructing oneOf: ", schema, superKlass)
		super("oneOf", schema, schema.oneOf[0].klass)
		this.superKlass = superKlass


	}	

	/* OneOf implementation of validate*/
	validate(value) {
		console.log("validating value in oneof: ", value, this.schema)
		let valid = false
		let error
		let field

		for(let schema of this.schema.oneOf) {
			try{
				field = MFieldFactory(schema, this.superKlass)
				field.setValue(value)
				valid = true
				return {valid, error, field}
			} catch (err) {
				/* do nothing, try next value */
			}
		}
		console.log("invalid")
		error = new TypeError("value does not match any of the schemas defined in oneOf")
		return {valid, error, field}
	}

	/* Override of setValue defined in MField */
	setValue(value) {
		let {valid, error, field} = this.validate(value)

		if(valid == false) {
			throw error
		} else {
			this.value = field
		}
	}

	getValue() {
		return this.value.getValue()
	}
}