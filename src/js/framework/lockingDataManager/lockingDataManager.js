import * as bdm from "../basicDataManager/basicDataManager.js";



export class LockingDataManager extends bdm.BasicDataManager {
	constructor(factory, schema) {
		super(factory, schema);
	}
}

