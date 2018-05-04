class Logger {
    logSet(property, object_type, object_name, value) {
        console.log("setting property " + property + " of " + object_type + " " + object_name + " to value:")
        console.log(value)
    }

    logInit(object_type, initial_values) {
        console.log("initializing object of type " + object_type + " with initial values:")
        console.log(initial_values)
    }

    logException(property, object_type, object_name, message) {
        console.log("exception occurred for property " + property + " in " + object_type + " " + object_name + ":")
        console.log(message)
    }
}

class StateMachine extends Logger {
    constuctor(name) {
        if(!name) {
            this.logException("name", "StateMachine", null, "the name attribute is required")
            throw error("the name attribute is required")
        }

        if(!name instanceof String) {
            this.logException("name", "StateMachine", null, "name must be a String")
            throw error("name must be a String")
        }

        this.name = name
        this.states = []
        this.setStartState(start)
        this.addState(state)
        this.locked = false

        this.logInit("StateMachine", {
            name: this.name,
            states: this.states,
            start: this.start,
            locked: this.locked
        })
    }

    lock() {
        this.locked = true
    }

    unlock() {
        this.locked = false
    }

    setStartState(start) {
        if(this.locked) {
            this.logException("start", "StateMachine", this.name, "the machine is locked!")
            throw error("the machine is locked!")
        }

        if(!start instanceof State) {
            this.logException("start", "StateMachine", this.name, "start must be instance of State")
            throw error("start must be instance of State")
        }

        this.logSet("start", "StateMachine", this.name, start)
        this.start = start
    }

    addState(state) {
        if(this.locked) {
            this.logException("states", "StateMachine", this.name, "the machine is locked!")
            throw error("the machine is locked!")
        }

        if(!state instanceof State) {
            this.logException("states", "StateMachine", this.name, "state must be instance of State")
            throw error("state must be instance of State")   
        }


        state.setMachine(this)
        this.states.push(state)
        this.logSet("states", "StateMachine", this.name, this.states)
    }
}

class State extends Logger {
    constructor(name) {
        if(!name) {
            this.logException("name", "State", null, "the name attribute is required")
            throw error("the name attribute is required")       
        }

        if(!name instanceof String) {
            this.logException("name", "State", null, "name must be a String")
            throw error("name must be a String")
        }

        this.name = name
        this.transitions_in = []
        this.transitions_out = []
        this.locked = false

        this.logInit("State", {
            name: this.name,
            transitions_in: this.transitions_in,
            transitions_out: this.transitions_out,
            locked: this.locked
        })
    }

    lock() {
        this.locked = true
    }

    unlock() {
        this.locked = false
    }

    setMachine(machine) {
        if(this.locked) {
            this.logException("machine", "State", this.name, "the state is locked!")
            throw error("the state is locked!")
        }

        if(!machine instanceof StateMachine) {
            this.logException("machine", "State", this.name, "machine must be instance of StateMachine")
            throw error("machine must be instance of StateMachine")
        }

        this.logSet("machine", "State", this.name, machine)
        this.machine = machine
    }

    addTransitionIn(transition) {
        if(this.locked) {
            this.logException("transitions_in", "State", this.name, "the state is locked!")
            throw error("the state is locked!")
        }

        if(!transition instanceof Transition) {
            this.logException("transitions_in", "State", this.name, "transition must be instance of Transition")
            throw error("transition must be instance of Transition")
        }

        transition.setTo(this)
        this.transitions_in.push(transition)
        this.logSet("transitions_in", "StateMachine", this.name, this.transitions_in)
    }

    addTransitionOut(transition) {
        if(this.locked) {
            this.logException("transitions_out", "State", this.name, "the state is locked!")
            throw error("the state is locked!")
        }

        if(!transition instanceof Transition) {
            this.logException("transitions_out", "State", this.name, "transition must be instance of Transition")
            throw error("transition must be instance of Transition")
        }

        transition.setFrom(this)
        this.transitions_out.push(transition)
        this.logSet("transitions_out", "StateMachine", this.name, this.transitions_out)
    }
}

class Transition extends Logger {
    constructor(events) {
        if(!events instanceof Array) {
            this.logException("events", "Transition", null, "events must be an instance of Array")
            throw error("events must be an instance of Array")
        }

        for(event in events) {
            if(!event instanceof String) {
            this.logException("events", "Transition", null, "each event must be of type String")
                throw error("each event must be of type String")
            }
        }

        this.events = events
        this.locked = false

        this.logInit("Transition", {
            events: this.events,
            locked: this.locked
        })
    }

    lock() {
        this.locked = true
    }

    unlock() {
        this.locked = false
    }

    setFrom(state) {
        if(this.locked) {
            this.logException("from", "Transition", null, "the transition is locked!")
            throw error("the transition is locked!")
        }

        if(!state instanceof State) {
            this.logException("from", "Transition", null, "state must be instanceof State")
            throw error("state must be instanceof State")
        }

        this.logSet("from", "Transition", null, state)
        this.from = state
    }

    setTo(state) {
        if(this.locked) {
            this.logException("to", "Transition", null, "the transition is locked!")
            throw error("the transition is locked!")
        }

        if(!state instanceof State) {
            this.logException("to", "Transition", null, "state must be instanceof State")
            throw error("state must be instanceof State")
        }

        this.logSet("from", "Transition", null, to)
        this.to = state
    }
}

function makeDoors() {
    let doors = new StateMachine("doors")

    let stateOpened = new State("opened")
    let stateClosed = new State("closed")
    let stateLocked = new State("locked")

    doors.setStart(stateClosed)
    doors.addState(stateClosed)
    doors.addState(stateOpened)
    doors.addState(stateLocked)

    let transOpen = Transition(["open"])
    let transClose = Transition(["close"])
    let transLock = Transition(["lock"])
    let transUnlock = Transition(["unlock"])

    stateOpened.addTransitionIn(transOpen)
    stateClosed.addTransitionOut(transClosed)

    stateClosed.addTransitionIn(transClose)
    stateClosed.addTransitionIn(transUnlock)
    stateClosed.addTransitionOut(transOpen)
    stateClosed.addTransitionOut(transLock)

    stateLocked.addTransitionIn(transLock)
    stateLocked.addTransitionOut(transUnlock)

    return doors
}

function execute(machine, events) {
    errrCnt = 0
    executionLog = []

    events.map((event) => {
        let transition = machine.start.transitions_out.map((transition) => {
            return {
                success: transition.events.includes(event),
                from: transition.from,
                to: transition.to
            }
        }).reduce((acc, item) => {
            return item.success ? item : acc
        }, {success: false, from: this.model.start})
        if(transition.success) {
            machine.start = transition.to
            executionLog.push("Executed transition from "+transition.from.name+" to "+transition.to.name+" with event "+event)
        } else {
            errorCnt++
            executionLog.push("State "+transition.from.name+" has no outgoing transitions with event "+event)
        }
    })
    return {
        errorCnt,
        executionLog: executionLog.join("\n")
    }
}

function main() {
    doors = makeDoors()
    events = ["open", "close", "lock", "unlock", "open"]
    initialStart = doors.start
    
    /* Run a successful sequence of events */
    let {errorCnt, executionLog} = execute(doors, events)
    console.log(errorCnt + " errors occurred while executing the doors statemachine")
    console.log("\nExecuted events:")
    console.log(executionLog)

    doors.setStart(initialStart)
    events = ["open", "close", "close", "open", "close", "lock"]

    /* Run a failing sequence of events */ 
    {errorCnt, executionLog} = execute(doors, events)
    console.log(errorCnt + " errors occurred while executing the doors statemachine")
    console.log("\nExecuted events:")
    console.log(executionLog)

    /* Run some events, then lock the machine */
    doors.setStart(initialStart)
    events = ["open", "close", "lock"]
    {errorCnt, executionLog} = execute(doors, events)
    doors.lock()
    let {errorCnt2, executionLog2} = execute(doors, ["unlock"])
    console.log((errorCnt + errorCnt2) + " errors occurred while executing the doors statemachine")
    console.log("\nExecuted events:")
    console.log(executionLog + "\n" + executionLog2)
}