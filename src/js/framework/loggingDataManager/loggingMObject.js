import * as bdm from "../basicDataManager/mObject.js";

export let LoggingMObject = (superclass) => class extends superclass {
	constructor(schema, klass, subKlasses, ...otherArgs) {
		super(schema, klass, subKlasses, ...otherArgs);
		$("#logOutput").append("<p>building LoggedMObject of klass "+klass+" with schema: " + JSON.stringify(schema)+"</p>");
	}

	__set(propKey, value) {
		let result;
		try {
			result = super.__set(propKey, value);
			$("#logOutput").append("<p>set property "+propKey+" of klass "+this.klass+"</p>");
		} catch (err) {
			console.log("Error when setting property "+propKey+" of klass "+this.klass+" to value: " + value + ". Got error message: "+ err);
			$("#logOutput").append(err.stack);
			$("#logOutput").append("An error occured with message: "+err.message+". See console for more detailed information");
			throw new Error(err.message);
		}
		return result;
	}

	__get(propKey) {
		let result;
		try {
			result = super.__get(propKey);
			$("#logOutput").append("<p>getting property "+propKey+" of klass "+this.klass+"</p>");
		} catch (err) {
			$("#logOutput").append("A "+err.type+" occured: "+err.message);
			$("#logOutput").append("An error occured with message: "+err.message+". See console for more detailed information");
			throw new Error(err.message);
		}
		return result;
	}
}