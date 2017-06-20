import * as basicFactory from "../basicDataManager/basicRecordFactory.js"
import * as lockingMObject from "./lockingMObject.js";

export class LockingRecordFactory extends basicFactory.BasicRecordFactory {
	constructor(schema) {
		super(schema);
		this.MObj = lockingMObject.LockingMObject;
	}
}