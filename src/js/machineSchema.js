export let machineSchema = {
	"$schema": "http://json-schema.org/draft-06/schema#",
	"title": "Machine",
	"type": "object",
	"properties": {
		"start": {"$ref": "#/state"},
		"states": {"items": {"$ref": "#/state"}}
	},
	"state": {
		"properties": {
			"name": {"type": "string"},
			"transitions": {"items": {"$ref": "#/transition"}}
		}
	},	
	"transition": {
		"properties": {
			"event": {"type": "string"},
			"from": {"$ref": "#/baseState"},
			"to": {"$ref": "#/baseState"}
		}
	},
	"baseState": {
		"properties": {
			"name": {"type": "string"}	
		}
	}
}