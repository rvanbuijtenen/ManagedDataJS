import DoorsController from "./controllers/DoorsController"
import LockingDoorsController from "./controllers/LockingDoorsController"
import GmailValidatorController from "./controllers/GmailValidatorController"


import DoorsView from "./views/DoorsView"
import LockingDoorsView from "./views/LockingDoorsView"
import GmailValidatorView from "./views/GmailValidatorView"

import {DataManager} from "../../framework/dataManager/DataManager"
import {Logging,Locking} from "../../framework/mixins"

export default function runMachine(type, viewElement) {
	let manager, model, view, controller

	let schema = require("./schemas/machineSchema")

	switch(type) {
		case "doors": {
			manager = new DataManager(schema)

			model = makeDoors(manager)
			view = new DoorsView("stateMachine/doors.html", viewElement)
			controller = new DoorsController({}, view, manager)
			break;
		}
		case "loggingDoors": {
			manager = new DataManager(schema, Logging)

			model = makeDoors(manager)
			view = new DoorsView("stateMachine/doors.html", viewElement)
			controller = new DoorsController(model, view, manager)
			break;
		}
		case "lockingDoors": {
			manager = new DataManager(schema, Locking)

			model = makeDoors(manager)
			view = new LockingDoorsView("stateMachine/lockingDoors.html", viewElement)
			controller = new LockingDoorsController(model, view, manager)
			break;
		}
		case "loggingLockingDoors": {
			manager = new DataManager(schema, Logging, Locking)

			model = makeDoors(manager)
			view = new LockingDoorsView("stateMachine/lockingDoors.html", viewElement)
			controller = new LockingDoorsController(model, view, manager)
			break;
		}
		case "gmailValidator": {
			manager = new DataManager(schema, Logging)

			model = makeGmailValidator(manager)
			view = new GmailValidatorView("stateMachine/gmailValidator.html", viewElement)
			controller = new GmailValidatorController(model, view, manager)
			break;
		}
		default: {
			throw new TypeError("Unknown machine type: "+type)
		}
	}
}

function makeGmailValidator(manager) {
	let validator = new manager.Machine({"name": "validator"})

	let start = manager.State({"name": "start"})
	let prefix = manager.State({"name": "prefix"})
	let at = manager.State({"name": "@"})
	let g = manager.State({"name": "g"})
	let m = manager.State({"name": "m"})
	let a = manager.State({"name": "a"})
	let i = manager.State({"name": "i"})
	let l = manager.State({"name": "l"})
	let dot = manager.State({"name": "."})
	let c = manager.State({"name": "c"})
	let o = manager.State({"name": "o"})
	let mExtension = manager.State({"name": "mExtension"})

	let transStart = manager.Transition({
		"event": ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0",]
	})

	let transPrefix = manager.Transition({
		"event": ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0",], 
	})

	let transAt = manager.Transition({
		"event": ["@"],
	})

	let transG = manager.Transition({
		"event": ["g"],
	})

	let transM = manager.Transition({
		"event": ["m"],
	})

	let transA = manager.Transition({
		"event": ["a"],
	})

	let transI = manager.Transition({
		"event": ["i"],
	})

	let transL = manager.Transition({
		"event": ["l"],
	})

	let transDot = manager.Transition({
		"event": ["."],
	})

	let transC = manager.Transition({
		"event": ["c"],
	})

	let transO = manager.Transition({
		"event": ["o"],
	})

	let transMExtension = manager.Transition({
		"event": ["m"],
	})

	validator.start = start
	validator.states.push(start, prefix, at, g, m, a, i, l, dot, c, o, mExtension)

	start.transitions_out.push(transStart)

	prefix.transitions_in.push(transStart, transPrefix)
	prefix.transitions_out.push(transPrefix, transAt)

	at.transitions_in.push(transAt)
	at.transitions_out.push(transG)

	g.transitions_in.push(transG)
	g.transitions_out.push(transM)

	m.transitions_in.push(transM)
	m.transitions_out.push(transA)

	a.transitions_in.push(transA)
	a.transitions_out.push(transI)

	i.transitions_in.push(transI)
	i.transitions_out.push(transL)

	l.transitions_in.push(transL)
	l.transitions_out.push(transDot)

	dot.transitions_in.push(transDot)
	dot.transitions_out.push(transC)

	c.transitions_in.push(transC)
	c.transitions_out.push(transO)

	o.transitions_in.push(transO)
	o.transitions_out.push(transMExtension)

	mExtension.transitions_in.push(transMExtension)

	return validator
}

function addPersistentParameters(manager, gmailValidator, baseId) {
	gmailValidator.setId(baseId)
	gmailValidator.setManager(manager)

	let i = 0;
	for(let state of gmailValidator.states) {
		state.setId(baseId+"state"+i)
		state.setManager(manager)

		let j = 0;
		for(let transition of state.transitions_in) {
			transition.setId(baseId+"state"+i+"transition"+j)
			transition.setManager(manager)
		}
		i++
	}
}