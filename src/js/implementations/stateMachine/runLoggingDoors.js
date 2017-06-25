import * as run from "./runDoors.js";

import * as loggingMObject from "../../framework/loggingDataManager/loggingMObject.js";

export class RunLoggingDoors extends run.RunDoors {
	initFactory() {
		this.factory = this.manager.factory(this.schema, loggingMObject.LoggingMObject);
	}
}