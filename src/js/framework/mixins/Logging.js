/**
 * A mixin that logs get, set and array change events
 * Please refer to source for documentation on this Mixin. The documentation
 * generator does not work properly with mixin definition
 */
export let Logging = (superclass) => class extends superclass {
	constructor(schema, klass, ...otherArgs) {
		super(schema, klass, ...otherArgs);
		console.log("building LoggedMObject of klass "+klass+" with schema: " + JSON.stringify(schema));
	}

	set(propKey, value) {
		let result;
		try {
			result = super.set(propKey, value);
			console.log("set property "+propKey+" of klass "+this.klass);
		} catch (err) {
			console.log("Error when setting property "+propKey+" of klass "+this.klass+" to value: " + value + ". Got error message: "+ err);
			console.log(err.stack);
			console.log("An error occured with message: "+err.message+". See console for more detailed information");
			throw new Error(err.message);
		}
		return result;
	}

	get(propKey) {
		//console.log(propKey, this);
		let result;
		try {
			result = super.get(propKey);
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