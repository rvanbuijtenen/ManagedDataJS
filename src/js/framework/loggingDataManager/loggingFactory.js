import * as basicFactory from "../basicDataManager/basicRecordFactory.js";
import * as loggingMObject from "./loggingMObject.js";

export class LoggingRecordFactory extends basicFactory.BasicRecordFactory {
	constructor(schema) {
		super(schema);
		this.MObj = loggingMObject.LoggingMObject;
	}
}