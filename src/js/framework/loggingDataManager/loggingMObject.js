import * as bdm from "../basicDataManager/mObject.js";

export let LoggingMObject = (superclass) => class extends superclass {
	constructor(schema, klass, subKlasses, ...otherArgs) {
		super(schema, klass, subKlasses, ...otherArgs);
		console.log("building LoggedMObject of klass "+klass+" with schema: " + JSON.stringify(schema));
	}

	__set(propKey, value) {
		let result;
		try {
			result = super.__set(propKey, value);
			console.log("set property "+propKey+" of klass "+this.klass);
		} catch (err) {
			console.log("Error when setting property "+propKey+" of klass "+this.klass+" to value: " + value + ". Got error message: "+ err);
			console.log(err.stack);
			console.log("An error occured with message: "+err.message+". See console for more detailed information");
			throw new Error(err.message);
		}
		return result;
	}

	__get(propKey) {
		//console.log(propKey, this);
		let result;
		try {
			result = super.__get(propKey);
			console.log("getting property "+propKey+" of klass "+this.klass);
		} catch (err) {
			console.log("A "+err.type+" occured: "+err.message);
			console.log(err.stack);
			console.log("An error occured with message: "+err.message+". See console for more detailed information");
			throw new Error(err.message);
		}
		return result;
	}
}