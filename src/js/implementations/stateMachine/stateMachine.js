export let makeDoors = function(manager) {
	let doors = new manager.machine({"name": "doors"})

	let stateOpened = manager.state({"name": "opened", "belongs_to": doors})
	let stateClosed = manager.state({"name": "closed", "belongs_to": doors})
	let stateLocked = manager.state({"name": "locked", "belongs_to": doors})

	let transOpen = manager.transition({
		"event": ["open"], 
		"from": stateClosed, 
		"to": stateOpened
	})
	
	let transClose = manager.transition({
		"event": ["close"],
		"from": stateOpened,
		"to": stateClosed
	})

	let transLock = manager.transition({
		"event": ["lock"],
		"from": stateClosed,
		"to": stateLocked
	})

	let transUnlock = manager.transition({
		"event": ["unlock"],
		"from": stateLocked,
		"to": stateClosed
	})

	doors.start = stateClosed

	return doors
}


export let makeValidator = function(manager) {
	let validator = new manager.machine({"name": "validator"}, manager, "validator")

	let start = manager.state({"name": "start", "belongs_to": validator}, manager, "start")
	let prefix = manager.state({"name": "prefix", "belongs_to": validator}, manager, "prefix")
	let at = manager.state({"name": "@", "belongs_to": validator}, manager, "@")
	let g = manager.state({"name": "g", "belongs_to": validator}, manager, "g")
	let m = manager.state({"name": "m", "belongs_to": validator}, manager, "m")
	let a = manager.state({"name": "a", "belongs_to": validator}, manager, "a")
	let i = manager.state({"name": "i", "belongs_to": validator}, manager, "i")
	let l = manager.state({"name": "l", "belongs_to": validator}, manager, "l")
	let dot = manager.state({"name": ".", "belongs_to": validator}, manager, ".")
	let c = manager.state({"name": "c", "belongs_to": validator}, manager, "c")
	let o = manager.state({"name": "o", "belongs_to": validator}, manager, "o")
	let mEx = manager.state({"name": "m", "belongs_to": validator}, manager, "mEx")

	let transStart = manager.transition({
		"event": ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0",], 
		"from": start, 
		"to": prefix
		},
		manager,
		"transitionStart"
	)

	let transPrefix = manager.transition({
		"event": ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0",], 
		"from": prefix, 
		"to": prefix
		},
		manager,
		"transitionPrefix"
	)

	let transAt = manager.transition({
		"event": ["@"],
		"from": prefix,
		"to": at
		},
		manager,
		"transition@"
	)

	let transG = manager.transition({
		"event": ["g"],
		"from": at,
		"to": g
		},
		manager,
		"transitionG"
	)

	let transM = manager.transition({
		"event": ["m"],
		"from": g,
		"to": m
		},
		manager,
		"transitionM"
	)

	let transA = manager.transition({
		"event": ["a"],
		"from": m,
		"to": a
		},
		manager,
		"transitionA"
	)

	let transI = manager.transition({
		"event": ["i"],
		"from": a,
		"to": i
		},
		manager,
		"transitionI"
	)

	let transL = manager.transition({
		"event": ["l"],
		"from": i,
		"to": l
		},
		manager,
		"transitionL"
	)

	let transDot = manager.transition({
		"event": ["."],
		"from": l,
		"to": dot
		},
		manager,
		"transition."
	)

	let transC = manager.transition({
		"event": ["c"],
		"from": dot,
		"to": c
		},
		manager,
		"transitionC"
	)

	let transO = manager.transition({
		"event": ["o"],
		"from": c,
		"to": o
		},
		manager,
		"transitionO"
	)

	let transMEx = manager.transition({
		"event": ["m"],
		"from": o,
		"to": mEx
		},
		manager,
		"transitionMEx"
	)

	validator.start = start

	return validator
}

export let execute = function(machine, events, print) {
	console.log(print)
	let start = machine.start
	console.log("machine: ",machine)
	for(let event of events) {
		let succes = false
		for(let trans of machine.start.transitions_out) {
			if(trans.event.getValues().includes(event)) {
				machine.start = trans.to
				print("Executed transition from state " + trans.from.name + " to state " + trans.to.name + " with event " + event)
				succes = true
			}
		}
		if(succes == false) {
			print("State " + machine.start.name + " has no outgoing transitions with event " + event)
			return false
		}
	}
	return true
}

export let printMachine = function(machine, print) {
	print("Machine: "+machine.name)
	print("start state: "+machine.start.name)
	print("States:")
	for(let s of machine.states) {
		print("  "+s.name)
		print("    transitions_in for "+ s.name+":")
		for(let t of s.transitions_in) {
			print("      "+t.from.name+" -> "+JSON.stringify(t.event.getValues())+" -> "+t.to.name)
		}
		print("    transitions_out for "+ s.name+":")
		for(let t of s.transitions_out) {
			print("      "+t.from.name+" -> "+JSON.stringify(t.event.getValues())+" -> "+t.to.name)
		}
	}
}