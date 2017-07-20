import {MField} from "./MFieldSingle"
import {MFieldFactory} from "./MFieldFactory"

/**
 * The ArrayHandler ensures that ArrayMfield[idx] returns ArrayMField.value[idx] when idx is an integer
 */
export class ArrayHandler {
	/**
	 * @param {Object} target - The target object.
	 * @param {String, Symbol} propKey - The name of the property to get.
	 * @param {Object} receiver - Either the proxy or an object that inherits from the proxy.
	 *
	 * @return {*} Either the value stored at the requested index or the result of Reflect.get()
	 */
	get(target, propKey, receiver) {
		if(typeof(propKey) == "number") {
			return target.get(propKey)
		} else {
			return Reflect.get(target, propKey, receiver)
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
	/**
	 * @param {Object} schema - A JSON schema that describes this MFields value
	 * @param {MObject} superKlass - The MObject that this field belongs to
	 */ 	
	constructor(schema, superKlass) {
		super("array", schema, [])

		/**
		 * The MObject that this ArrayMField belongs to
		 * @type {MObject}
		 */
		this.superKlass = superKlass

		/**
		 * If we have a list of items, this parameter keeps track of which item
		 * we need to use to validate the next element
		 * @type {number}
		 */
		this.itemsIdx = 0

		/**
		 * The length of the array stored in this.value
		 * @type {number}
		 */
		this.length = 0

		/**
		 * Override this[Symbol.iterator]
		 */
		this[Symbol.iterator] = this.iterator
	}

	/**
	 * See JavaScript Array documentation
	 */
	concat(...values) {
		for(let value of values) {
			if(value instanceof Array) {
				this.push(...value)
			} else {
				this.push(value)
			}
		}
	}
	
	/**
	 * See JavaScript Array documentation
	 */
	copyWithin(target, start, end) {
		return this.value.copyWithin(target, start, end)
	}
	
	/**
	 * See JavaScript Array documentation
	 */
	entries() {
		return this.getValues().entries()
	}
	
	/**
	 * See JavaScript Array documentation
	 */
	every(callback, thisarg) {
		return this.getValues().every(callback, thisarg)
	}
	
	/**
	 * See JavaScript Array documentation
	 */
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
	
	/**
	 * See JavaScript Array documentation
	 */
	filter(callback, thisarg) {
		return this.getValues().filter(callback, thisarg)
	}

	/**
	 * See JavaScript Array documentation
	 */
	find(callback, thisarg) {
		return this.getValues().find(callback, thisarg)
	}

	/**
	 * See JavaScript Array documentation
	 */
	findIndex(callback, thisarg) {
		return this.getValues().findIndex(callback, thisarg)
	}
	
	/**
	 * See JavaScript Array documentation
	 */
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
	
	/**
	 * See JavaScript Array documentation
	 */
	includes(searchElement, fromIndex) {
		if(fromIndex == undefined) {
			return this.getValues().includes(searchElement)
		} else {
			return this.getValues().includes(searchElement, fromIndex)
		}
	}

	/**
	 * See JavaScript Array documentation
	 */
	indexOf(searchElement, fromIndex) {
		if(fromIndex == undefined) {
			return this.getValues().indexOf(searchElement)
		} else {
			return this.getValues().indexOf(searchElement, fromIndex)
		}
	}

	/**
	 * See JavaScript Array documentation
	 */
	join(separator) {
		throw new Error("Managed Arrays cannot be joined into strings")
	}
	
	/**
	 * See JavaScript Array documentation
	 */
	keys() {
		return this.getValues().keys()
	}

	/**
	 * See JavaScript Array documentation
	 */
	lastIndexOf(searchElement, fromIndex) {
		if(fromIndex == undefined) {
			return this.getValues().lastIndexOf(searchElement)
		} else {
			return this.getValues().lastIndexOf(searchElement, fromIndex)
		}
	}

	/**
	 * See JavaScript Array documentation
	 */
	map(callback, thisarg) {
		let newArr = this.getValues().map(callback, thisarg)
		let {valid, error, fields} = this.validate(newArr)

		if(valid == false) {
			throw new TypeError(errors)
		} else {
			return newArr
		}
	}
	
	/**
	 * See JavaScript Array documentation
	 */
	pop() {
		let value = this.value.pop()
		if(value != undefined) {
			this.length--
			return value.getValue()
		} else {
			return value
		}
	}

	/**
	 * See JavaScript Array documentation
	 */
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
				this.length++

			}
		}
	}
	
	/**
	 * See JavaScript Array documentation
	 */
	reduce(callback, initialValue) {
		return this.getValues().reduce(callback, initialValue)
	}

	/**
	 * See JavaScript Array documentation
	 */
	reduceRight(callback, initialValue) {
		return this.getValues().reduceRight(callback, initialValue)
	}

	/**
	 * See JavaScript Array documentation
	 */
	reverse() {
		this.value.reverse()
		return this.getValues()
	}

	/**
	 * See JavaScript Array documentation
	 */
	shift() {
		let element = this.value.shift()
		return element.getValue()
	}
	
	/**
	 * See JavaScript Array documentation
	 */
	slice(begin, end) {
		return this.getValues().slice(begin, end)
	}
	
	/**
	 * See JavaScript Array documentation
	 */
	some(callback, thisarg) {
		return this.getValues().some(callback, thisarg)
	}
	
	/**
	 * See JavaScript Array documentation
	 */
	sort(compareFunction) {
		let sorted = this.getValues().sort(compareFunction)
		let {valid, error, fields} = this.validate(sorted)
		if(valid == false) {
			throw error
		} else {
			this.value = fields
		}

	}

	/**
	 * See JavaScript Array documentation
	 */
	splice(start, deleteCount, ...items) {
		let {valid, error, fields} = this.validate(items)

		if(valid == false) {
			throw error
		} else {
			this.value.splice(start, deleteCount, ...fields)
		}
	}
	
	/**
	 * See JavaScript Array documentation
	 */
	unshift(...elements) {
		let {valid, error, fields} = this.validate(elements)

		if(valid == false) {
			throw new TypeError(error)
		} else {
			this.value.unshift(...fields)
		}
	}
	
	/**
	 * @return {Iterator} Returns an iterator object for this ArrayMFields value
	 */
	iterator() {
		return this.getValues()[Symbol.iterator]()
	}

	/** 
	 * Implementation of the validate function for ArrayMField 
	 *
	 * @param {Array} values - An array containing the values to validate
	 *
	 * @return {Boolean, Error, MField} Boolean indicating whether all values where valid; if there were any validation errors we return the error. only when valid == false; An array containing valid MFields of the given values. only when valid == true
	 */
	validate(values) {
		if(values == undefined) {
			return {true, undefined, undefined}
		}

		let fields = []
		let valid = true;
		let error
		let field

		if(this.schema.items instanceof Array) {
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

	/**
	 * @param {Integer} idx - the index to retrieve from this array
	 *
	 * @return {*, Boolean} Get either returns the value on the given index or false
	 */
	get(idx) {
		if(this.value.hasOwnProperty(idx)) {
			return this.value[idx].getValue()
		} else {
			return false
		}
	}

	/**
	 * @return {Array} A regular JavaScript array containing this ArrayMFields values
	 */
	getValues() {
		let arr = []
		for(let val of this.value) {
			arr.push(val.getValue())
		}
		return arr
	}

	/**
	 * @return {ArrayMField} Since an ArrayMField works like a regular JavaScript array we return this instead of this.value
	 */
	getValue() {
		return this
	}

	/**
	 * setValue takes a value as argument and attempts to validate this value. If it was valid we set 
	 * this.value to the field returned by the validate method, otherwise we throw the error that was returned
	 * 
	 * @param {Array} values - The value that should be set in this ArrayMField
	 */
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
	/**
	 * @param {Object} schema - A JSON schema that describes this fields value
	 */
	constructor(schema) {
		super("enum", schema, schema.enum[0])
	}

	/**
	 * @param {*} value - The value that should be validated
	 *
	 * @return {Boolean, Error} Validate returns a boolean indicating whether the field is valid. If it is invalid an error is also returned
	 */
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
		super("oneOf", schema, schema.oneOf[0].klass)
		/**
		 * The MObject that this OneOfMField belongs to
		 * @type {MObject}
		 */
		this.superKlass = superKlass
	}	

	/**
	 * @param {*} value - The value that should be validated
	 *
	 * @return {Boolean, Error, MField} Validate returns a boolean indicating whether the field is valid. If it is invalid an error is also returned. If it was valid, the valid MField is returned
	 */
	validate(value) {
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
		error = new TypeError("value does not match any of the schemas defined in oneOf")
		return {valid, error, field}
	}

	/**
	 * setValue takes a value as argument and attempts to validate this value. If it was valid we set 
	 * this.value to the field returned by the validate method, otherwise we throw the error that was returned
	 * 
	 * @param {*} value - The value that should be set in this MField
	 */
	setValue(value) {
		let {valid, error, field} = this.validate(value)

		if(valid == false) {
			throw error
		} else {
			this.value = field
		}
	}
	
	/**
	 * @return {*} This OneOfMFields value
	 */
	getValue() {
		return this.value.getValue()
	}
}