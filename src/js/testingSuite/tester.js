
import * as MD4JS from "../datamanagers/basicDataManager.js";
import * as interpreter from "../schemaInterpreter/schemaInterpreter.js";

let errors = [];

let assertSucces = function(f, val) {
	try {
		let retVal = f.apply();

		if(retVal.constructor == Array) {
			let noErrors = true;
			for(let item of retVal) {
				if(!val.includes(item)) {
					noErrors = false;
				}
			}
			if(!noErrors) {
				return "Expected '" + val + "' but got '" + retVal + "'";	
			}
		} else if(retVal != val) {
			return "Expected '" + val + "' but got '" + retVal + "'";
		}
	} catch (err) {
		return "got error: '" + err.message + "'";
	}
}

let assertError = function (f, mssg) {
	try {
		let retVal = f.apply();
		if(retVal) {
			return "Expected error: '" + mssg+"'";
		}
	} catch (err) {
		if(err.message != mssg) {
			return "Expected error: '" + mssg + "' but got '" + err.message+"'";
		}
	}
}

export class TestBasicRecord {
	static testAll() {
		TestBasicRecord.testString();
		TestBasicRecord.testInteger();
		TestBasicRecord.testNumber();
		TestBasicRecord.testArray();

		let i = 0;
		for(let item of errors) {
			if(item != undefined) {
				console.log("ERROR ["+i+']    ' + item);
				i++;
			}
		}
		console.log("\n\n" + errors.length - i + " tests passed, " + i + " tests failed");
		console.log("\nA total of "+ i + ' errors occured while testing');
	}
	
	static testString () {
		let schema = require('./testSchemas/stringSchema.json');
		let br = new MD4JS.BasicRecordFactory(schema);

		let f = '';
		let str = '';
		/**
		 * REGULAR STRING
		 **/
		str = "This is a string";
		f = function() {
			let stringRecord = new br.string({"basicString": str});
			return stringRecord.basicString;
		}
		errors.push(assertSucces(f, str));

		str = "Déjà vu";
		f = function() {
			let stringRecord = new br.string({"basicString": str});
			return stringRecord.basicString;
		}
		errors.push(assertSucces(f, str));

		str = "42";
		f = function() {
			let stringRecord = new br.string({"basicString": str});
			return stringRecord.basicString;
		}
		errors.push(assertSucces(f, str));

		str = 42;
		f = function() {
			let stringRecord = new br.string({"basicString": str});
			return stringRecord.basicString;
		}
		errors.push(assertError(f, "field basicString is of type string but parameter is of type number"));


		/**
		 * MIN AND MAX LENGTH OF STRING
		 **/

		str = "A";
		f = function() {
			let stringRecord = new br.string({"stringLength": str});
			return stringRecord.stringLength;
		}
		errors.push(assertError(f, "String A is too short: minLength = 2"));

		str = "AB";
		f = function() {
			let stringRecord = new br.string({"stringLength": str});
			return stringRecord.stringLength;
		}
		errors.push(assertSucces(f, str));

		str = "ABC";
		f = function() {
			let stringRecord = new br.string({"stringLength": str});
			return stringRecord.stringLength;
		}
		errors.push(assertSucces(f, str));

		str = "ABCD";
		f = function() {
			let stringRecord = new br.string({"stringLength": str});
			return stringRecord.stringLength;
		}
		errors.push(assertError(f, "String ABCD exceeds the maximum length: maxLength = 3"));


		/**
		 * REGULAR EXPRESSION
		 **/
		str = "555-1212"
		f = function() {
			let stringRecord = new br.string({"regex": str});
			return stringRecord.regex;
		}
		errors.push(assertSucces(f, str));

		str = "(888)555-1212"
		f = function() {
			let stringRecord = new br.string({"regex": str});
			return stringRecord.regex;
		}
		errors.push(assertSucces(f, str));

		str = "(888)555-1212 ext. 532"
		f = function() {
			let stringRecord = new br.string({"regex": str});
			return stringRecord.regex;
		}
		errors.push(assertError(f, "String (888)555-1212 ext. 532 does not match ^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$"));

		str = "(800)FLOWERS"
		f = function() {
			let stringRecord = new br.string({"regex": str});
			return stringRecord.regex;
		}
		errors.push(assertError(f, "String (800)FLOWERS does not match ^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$"));
	}

	static testInteger() {
		let schema = require('./testSchemas/integerSchema.json');
		let br = new MD4JS.BasicRecordFactory(schema);

		let f = '';
		let int = 0;

		/**
		 *	REGULAR INTEGERS
		 **/
		int = 42;
		f = function() {
			let integerRecord = new br.integer({"integer": int});
			return integerRecord.integer;
		}
		errors.push(assertSucces(f, int));

		int = -1;
		f = function() {
			let integerRecord = new br.integer({"integer": int});
			return integerRecord.integer;
		}
		errors.push(assertSucces(f, int));

		int = 3.14;
		f = function() {
			let integerRecord = new br.integer({"integer": int});
			return integerRecord.integer;
		}
		errors.push(assertError(f, "field integer is of type integer but parameter is of type number"));
		
		int = "42";
		f = function() {
			let integerRecord = new br.integer({"integer": int});
			return integerRecord.integer;
		}
		errors.push(assertError(f, "field integer is of type integer but parameter is of type string"));
		
		/**
		 * MULTIPLE OF
		 **/
		int = 10;
		f = function() {
			let integerRecord = new br.integer({"multiple": int});
			return integerRecord.multiple;
		}
		errors.push(assertSucces(f, int));

		int = 42;
		f = function() {
			let integerRecord = new br.integer({"multiple": int});
			return integerRecord.mutltple;
		}
		errors.push(assertError(f, "field multiple must be a multiple of 10"));

		/**
		 * INTEGER RANGES
		 **/
		int = 0;
		f = function() {
			let integerRecord = new br.integer({"range": int});
			return integerRecord.range;
		}
		errors.push(assertSucces(f, int));

		int = 100;
		f = function() {
			let integerRecord = new br.integer({"range": int});
			return integerRecord.range;
		}
		errors.push(assertSucces(f, int));

		int = -1;
		f = function() {
			let integerRecord = new br.integer({"range": int});
			return integerRecord.range;
		}
		errors.push(assertError(f, "field range has a minimum value of 0, but the passed value is -1"));
		
		int = 101;
		f = function() {
			let integerRecord = new br.integer({"range": int});
			return integerRecord.range;
		}
		errors.push(assertError(f, "field range has a maximum value of 100, but the passed value is 101"));	
	}

	static testNumber() {
		let schema = require('./testSchemas/numberSchema.json');
		let br = new MD4JS.BasicRecordFactory(schema);
		let num = 0;

		let f = '';

		num = 42;
		f = function() {
			let numberRecord = new br.number({"number": num});
			return numberRecord.number;
		}
		errors.push(assertSucces(f, num));

		num = 42.0;
		f = function() {
			let numberRecord = new br.number({"number": num});
			return numberRecord.number;
		}
		errors.push(assertSucces(f, num));

		num = 2.99792458e8;
		f = function() {
			let numberRecord = new br.number({"number": num});
			return numberRecord.number;
		}
		errors.push(assertSucces(f, num));

		num = "42";
		f = function() {
			let numberRecord = new br.number({"number": num});
			return numberRecord.number;
		}
		errors.push(assertError(f, "field number is of type number but parameter is of type string"));

		/**
		 * MULTIPLE OF
		 **/
		num = 10;
		f = function() {
			let numberRecord = new br.number({"multiple": num});
			return numberRecord.multiple;
		}
		errors.push(assertSucces(f, num));

		num = 42;
		f = function() {
			let numberRecord = new br.number({"multiple": num});
			return numberRecord.mutltple;
		}
		errors.push(assertError(f, "field multiple must be a multiple of 10"));

		/**
		 * number RANGES
		 **/
		num = 0;
		f = function() {
			let numberRecord = new br.number({"range": num});
			return numberRecord.range;
		}
		errors.push(assertSucces(f, num));

		num = 100;
		f = function() {
			let numberRecord = new br.number({"range": num});
			return numberRecord.range;
		}
		errors.push(assertSucces(f, num));

		num = -1;
		f = function() {
			let numberRecord = new br.number({"range": num});
			return numberRecord.range;
		}
		errors.push(assertError(f, "field range has a minimum value of 0, but the passed value is -1"));
		
		num = 100.1;
		f = function() {
			let numberRecord = new br.number({"range": num});
			return numberRecord.range;
		}
		errors.push(assertError(f, "field range has a maximum value of 100, but the passed value is 100.1"));	
	}

	static testArray() {
		let schema = require("./testSchemas/arraySchema.json");
		let br = new MD4JS.BasicRecordFactory(schema);

		let f = '';
		let arr = [];

		arr = ["str", 42, {}];
		f = function() {
			let arrayRecord = new br.array({"arr": arr});
			return arrayRecord.arr;
		}
		errors.push(assertSucces(f, arr));

		arr = "str";
		f = function() {
			let arrayRecord = new br.array({"arr": arr});
			return arrayRecord.arr;
		}
		errors.push(assertError(f, "field arr is of type array but parameter is of type string"));
		
		arr = ["string", 42];
		f = function() {
			let arrayRecord = new br.array({"arrWithItems": arr});
			return arrayRecord.arrWithItems;
		}
		errors.push(assertSucces(f, arr));

		arr = ["string", 42, false];
		f = function() {
			let arrayRecord = new br.array({"arrWithItems": arr});
			return arrayRecord.arrWithItems;
		}
		errors.push(assertError(f, "items in this array must be one of [integer,string]"));
		
		arr = [new br.point({"x": 6})];
		f = function() {
			let arrayRecord = new br.array({"arrWithRef": arr});
			return arrayRecord.arrWithRef;
		}
		errors.push(assertSucces(f, arr));
		
		arr = ["another value"];
		f = function() {
			let arrayRecord = new br.array({"arrWithRef": arr});
			return arrayRecord.arrWithRef;
		}
		errors.push(assertError(f, "items in this array must be one of [point]"));
		
		arr = ["NW", "NE", "SW", "SE"];
		f = function() {
			let arrayRecord = new br.array({"arrWithEnum": arr});
			return arrayRecord.arrWithEnum;
		}
		errors.push(assertSucces(f, arr));

		arr = ["another value"];
		f = function() {
			let arrayRecord = new br.array({"arrWithEnum": arr});
			return arrayRecord.arrWithEnum;
		}
		errors.push(assertError(f, "items in this array must be one of [NW,NE,SW,SE]"));
		
	}
}