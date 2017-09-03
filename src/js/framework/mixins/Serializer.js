export let Serializer = (superclass) => class extends superclass {
	serialize() {
		console.log("Serialize")
	}

	deserialize() {
		console.log("deserialize")
	}
}