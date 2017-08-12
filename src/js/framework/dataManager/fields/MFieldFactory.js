import {IntegerMField, NumberMField, StringMField, BooleanMField, MObjectMField} from "./MFieldSingle"
import {ArrayHandler, ArrayMField, EnumMField, OneOfMField} from "./MFieldMulti"

/**
 * MField is a factory function that returns one of the following managed fields
 * based on the given schema:
 * 		IntegerMField
 *		NumberMField
 *		StringMField
 *		BooleanMField
 *		MObjectMField
 *		ArrayMField
 *		EnumMField
 *		OneOfMField
 *
 * This function abstracts the MField implementation away from the user
 * as all outside functionality is provided by the base MField class
 * Note that there is one exception: The array MField, which has some additionional
 * Behaviour.
 *
 * @param {Object} schema - A (partial) JSON schema that describes the field that should be constructed
 * @param {MObject} superKlass - The MObject that this field belongs to
 *
 * @return {MField} An MField that ensures its value property matches the given schema
 */
export function MFieldFactory(schema, superKlass) {
	if(schema.hasOwnProperty("enum")) {
		return new EnumMField(schema)
	}

	if(schema.hasOwnProperty("oneOf")) {
		console.log("building oneOf field")
		return new OneOfMField(schema, superKlass)
	}

	if(schema.hasOwnProperty("type")) {
		switch(schema.type) {
			case "integer": {
				return new IntegerMField(schema)
				break
			}
			case "number": {
				return new NumberMField(schema)
				break
			}
			case "string": {
				return new StringMField(schema)
				break
			}
			case "boolean": {
				return new BooleanMField(schema)
				break 
			}
			case "object": {
				return new MObjectMField(schema, superKlass)
				break
			}
			case "array": {
				let array = new Proxy(new ArrayMField(schema, superKlass), new ArrayHandler())
				array.setThisProxy(array)
				return array
				break
			}
		}
	}
}