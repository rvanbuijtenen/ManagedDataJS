import * as basicFactory from "../../../framework/basicDataManager/basicRecordFactory.js"
;import * as persistentObject from "./persistentMObject.js";

export class PersistentFactory extends basicFactory.BasicRecordFactory {
	constructor(schema) {
		super(schema);

		this.MObj = persistentObject.PersistentMObject;
		this.otherInits.factory = this;
	}
}