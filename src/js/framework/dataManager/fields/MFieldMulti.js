import {MField} from "./MFieldSingle"
import {MFieldFactory} from "./MFieldFactory"

/**
 * The ArrayHanlder implements a get trap for the managed arrays that has two tasks:
 *
 *		- if the property is a number, we treat it as an index of the contained array by invoking "get" on the target
 *		- if the property is a function we return a function that invokes the notifyArray method on the target's superKlass.
 *		  It then applies the method with the returned list of arguments.
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
		if(!(typeof(propKey)=="symbol") && !isNaN(propKey)) {
			target.superKlass.beforeArray(propKey, [], target.proxy)
			try {
				result = target.get(parseInt(propKey))
			} catch (e) {
				target.superKlass.arrayError(propKey, err)
				return
			}
			target.superKlass.afterArray(propKey, target.proxy)
			return result
		} else {
			let propValue = target[propKey]
			if(typeof(propValue) == "function" && !(typeof(propKey) == "symbol")) {
				return function() {
					/* invoke notifyArray on target's superKlass */
					let argsArray = [...arguments]
					argsArray = target.superKlass.beforeArray(propKey, argsArray, target.proxy)
					/* remove the old arguments, add the new arguments and then apply the original method */
					//while(arguments.length > 0) {
					//	console.log("length:", arguments.length, arguments)
					//	Array.prototype.shift(arguments)
					//}
					
					//Array.prototype.unshift(arguments, ...argsArray)
					try {
						result = propValue.apply(target, argsArray, propKey)
						target.afterArray(propKey, target.proxy)
						return result
					} catch (err) {
						target.superKlass.arrayError(propKey, err)
						return
					}
				}
			}
		}
		return Reflect.get(target, propKey, receiver)
	}
}

/**
 * The array MField implementation is a bit different from other MField implementations.
 * An ArrayMField must act like a regular JavaScript array and therefore it forwards all
 * original ArrayMethods to the array stored within the value field and applies validation
 * where neccesary. When the array has been modified, the arrayHasChanged() callback is
 * invoked on the MObject it belongs to.
 *
 * We use three simple conventions for managed arrays:
 *		<ul><li>the ArrayMField never returns a Field when one of its values is returned, except when that field itself is a managedArray.</li>
 *		<li>the ArrayMField always takes regular javascript values as input, except when the value is a managed array.</li>
 *		<li>the ArrayMField.value only contains objects that are instances of MFields.</li></ul>
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

	setThisProxy(proxy) {
		this.proxy = proxy
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
	includes(searchElement, fromIndex = 0) {
		return this.getValues().includes(searchElement, fromIndex)
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
		return this.getValues().join(separator)
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
		return newArr
	}
	
	/**
	 * See JavaScript Array documentation
	 */
	pop() {
		let field = this.value.pop()
		if(field != undefined) {
			this.length = this.value.length
			if(this.schema.hasOwnProperty("inverseKey")) {
				field.value[this.schema.inverseKey] = null
			}
			return field.getValue()
		} else {
			return field
		}
	}

	/**
	 * See JavaScript Array documentation
	 */
	push(...elements) {
		let {valid, error, fields} = this.validate(elements)
		

		if(valid == false) {
			throw error
		} else {
			for(let field of fields) {
				this.value.push(field)
				if(this.schema.hasOwnProperty("inverseKey")) {
					if(this.schema.inverseType == "object") {
						if(field.getValue()[this.schema.inverseKey] != this.superKlass) {
							field.getValue()[this.schema.inverseKey] = this.superKlass
						}
					} else {
						if(!field.getValue()[this.schema.inverseKey].includes(this.superKlass)) {
							field.getValue()[this.schema.inverseKey].push(this.superKlass)
						}
					}
				}
				this.itemsIdx = (this.itemsIdx+1)%this.schema.items.length
				this.length = this.value.length
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
		if(this.schema.hasOwnProperty("inverseKey")) {
			if(this.schema.inverseType == "object") {
				element[this.schema.inverseKey] = null
			} else {
				element[this.schema.inverseKey].remove(this.superKlass)
			}
		}

		this.length = this.value.length
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
	splice(start, deleteCount=0, ...items) {
		let {valid, error, fields} = this.validate(items)

		if(valid == false) {
			throw error
		} else {
			let removed_values = []
			if(deleteCount > 0) {
				for(let i = start; i<(start+deleteCount)%this.value.length; i++) {
					removed_values.push(this.value[i].getValue())
				}
			}

			this.value.splice(start, deleteCount, ...fields)

			if(this.schema.hasOwnProperty("inverseKey")) {
				for(let value of removed_values) {
					if(this.schema.inverseType == "object") {
						value[this.schema.inverseKey]=null
					} else {
						if(value[this.schema.inverseKey].includes(this.superKlass)) {
							value[this.schema.inverseKey].remove(this.superKlass)
						}
					}
				}
				for(let field of fields) {
					if(this.schema.inverseType == "array") {
						if(field.value[this.schema.inverseKey] != this.superKlass) {
							field.value[this.schema.inverseKey] = this.superKlass
						}
					} else {
						if(!field.value[this.schema.inverseKey].includes(this.superKlass)) {
							field.value[this.schema.inverseKey].push(this.superKlass)
						}
					}
				}
			}
		}

		this.length = this.value.length
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
			
			if(this.schema.hasOwnProperty("inverseKey")) {
				for(let field of fields) {
					if(this.schema.inverseType == "object") {
						if(field.value[this.schema.inverseKey] != this.superKlass) {
							field.value[this.schema.inverseKey] = this.superKlass
						}
					} else {
						if(!field.value[this.schema.inverseKey].includes(this.superKlass)) {
							field.value[this.schema.inverseKey].push(this.superKlass)
						}
					}
				}
			}
		}

		this.length = this.value.length
	}
	
	/**
	 * @return {Iterator} Returns an iterator object for this ArrayMFields value
	 */
	iterator() {
		return this.getValues()[Symbol.iterator]()
	}

	addRelatedObject(other) {
		this.push(other)
	}

	remove(other) {
		let idx = this.indexOf(other)
		if(idx != null) {
			this.splice(idx, 1)
		}
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
			return {valid: true, error: undefined, fields: undefined}
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
				field = MFieldFactory(this.schema.items, this.superKlass)
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
	 * @return {*} Get either returns the value on the given index or false
	 */
	get(idx) {
		if(!this.value.hasOwnProperty(idx)) {
			return undefined
		}
		return this.value[idx].getValue()
	}

	/**
	 * @return {String} A string representing this array
	 */
	toString() {
		return this.getValues().toString()
	}

	/**
	 * getValues returns an actual javascript array containing this ArrayMFields values
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
		return this.proxy
	}

	/**
	 * setValue takes a value as argument and attempts to validate this value. If it was valid we set 
	 * this.value to the field returned by the validate method, otherwise we throw the error that was returned
	 * 
	 * @param {Array} values - The value that should be set in this ArrayMField
	 */
	setValue(values) {
		if(!(values instanceof Array)) {
			throw new TypeError("value assigned to "+this.schema.type+"MField can only be set to that of an actual JavaScript array")
		} else {
			this.value = [];
			this.push(...values)
		}
	}
}


/**
 * An enum can contain only one of its schemas values. Values defined within an enum can only be primitive types.
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
		let {valid, error} = super.validate(value)
		if(!this.schema.enum.includes(value)) {
			valid = false
			error = new TypeError("value assigned to "+this.schema.type+"MField must be one of "+JSON.stringyfy(schema.enum))
			return {valid, error}
		} else {
			return {valid, error}
		}
	}
}

/**
 * A OneOf field can contain at most one of the klasses defined in its schema. These klasses
 * are stored within an MObjectField.  
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
	 * @param {MObject} value - The value that should be validated
	 *
	 * @return {Boolean, Error, MField} Validate returns a boolean indicating whether the field is valid. If it is invalid an error is also returned. If it was valid, the valid MField is returned
	 */
	validate(value) {
		let {valid, error} = super.validate(value)
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
		valid = false
		error = new TypeError("value assigned to "+this.schema.type+"MField does not match any of the schemas defined in oneOf")
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