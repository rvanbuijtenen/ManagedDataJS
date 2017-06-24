export function executeDoors() {
	let schema = require("./machineSchema.json");

	let manager = new BasicDataManager();
	
	let factory = new basicFactory.BasicRecordFactory(schema);
	let doors = new doors.DoorsMachine(factory);

	let 
}