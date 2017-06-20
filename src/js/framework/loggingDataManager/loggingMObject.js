import * as bdm from "../basicDataManager/mObject.js";

export class LoggingMObject extends bdm.MObject {
	constructor(schema, klass, subKlasses) {
		super(schema, klass, subKlasses);
		console.log("\nbuilding LoggedMObject of klass "+klass+"with schema:");
		console.log(schema);
	}

	__set(propKey, value) {
		let result = super.__set(propKey, value);
		console.log("\nset property "+propKey+" of klass "+this.klass+" to value:");
		console.log(value);
		return result;
	}

	__get(propKey) {
		let result = super.__get(propKey);
		console.log("\ngetting property "+propKey+" of klass "+this.klass+" value = ");
		console.log(result);
		return result;
	}
}