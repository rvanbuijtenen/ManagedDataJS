import {mix} from "../dataManager/DataManager"
import {Serializer} from "./Serializer"

export let ApiSynchronizer = (superclass) => class extends mix(superclass).with(Serializer) {
	INDEX() {
		super.deserialize()
		console.log("INDEX")
	}

	SHOW() {
		super.deserialize()
		console.log("SHOW")
	}

	CREATE() {
		super.serialize()
		console.log("CREATE")
	}

	UPDATE() {
		super.serialize()
		console.log("UPDATE")
	}

	DELETE() {
		super.deserialize()
		console.log("DELETE")
	}


}