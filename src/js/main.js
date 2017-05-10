
import * as Point from "./pointSchema.js";
import * as BasicRecord from "./basicRecord.js";

let Ajv = require('ajv');
let ajv = Ajv({allErrors: true});

class Main { 
    constructor(principal, years, rate) {	
		let pointSchema = Point.pointSchema;
		var rec = new BasicRecord.BasicRecord(pointSchema);
		
		console.log("DEBUG INFO: assigning float to x (type must be integer)");
		rec.x = 1.2;
		
		console.log("\n\nDEBUG INFO: assigning integer to x (type must be integer)");
		rec.x = 1;
			
		console.log("\n\nDEBUG INFO: assigning string to y (type must be integer)");
		rec.y = 'test';
		
		console.log("\n\nDEBUG INFO: assigning int to y (type must be integer)");
		rec.y = 2;
		
		console.log("\n\nDEBUG INFO: assigning value of an unknown field to z");
		rec.z = rec.unknownField;
    }
}

document.getElementById('test').addEventListener('click', () => {
    let x = new Main();
});