import * as factory from "./basicRecordFactory.js";

/**
 * The FactoryHandler appends the klass name of the klass that should be constructed
 * to the end of the arguments list, and then forwards this call to the appropriate
 * constructor function assigned to the property with that same klass name.
 */
export class BasicDataManager {
	constructor(factory, schema) {
		this.factory = new factory(schema);
		console.log(this.factory);
	}
}




