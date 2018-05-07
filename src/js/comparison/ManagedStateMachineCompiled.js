import { DataManager } from "../framework/dataManager/Datamanager.js";

machineSchema = {
    "name": "Machine",
    "type": "object",
    "properties": {
        "name": { "type": "string" },
        "start": {
            "type": "object",
            "$ref": "#/definitions/State"
        }
    },
    "relations": {
        "oneToMany": [{
            "$ref": "#/definitions/State",
            "referrer": "states",
            "referred": "machine"
        }]
    },
    "definitions": {
        "State": {
            "properties": {
                "name": { "type": "string" }
            },
            "relations": {
                "oneToMany": [{
                    "$ref": "#/definitions/Transition",
                    "referrer": "transitions_in",
                    "referred": "to"
                }, {
                    "$ref": "#/definitions/Transition",
                    "referrer": "transitions_out",
                    "referred": "from"
                }]
            }
        },
        "Transition": {
            "properties": {
                "event": {
                    "type": "array",
                    "items": { "type": "string" }
                }
            }
        }
    }
};

let Logging = superclass => class extends superclass {
    constructor(schema) {
        super(schema);
    }

    set(propKey, value) {
        let result;
        try {
            result = super.set(propKey, value);
            console.log("set property " + propKey + " of klass " + this.schema.getKlass() + " to value: " + JSON.stringify(value));
        } catch (err) {
            console.log("An error occured when setting property " + propKey + " of klass " + this.schema.getKlass() + " to value: " + JSON.stringify(value));
            throw err;
        }
        return result;
    }

    notifyArray(method, args, array) {
        args = super.notifyArray(method, args, array);
        console.log("invoked " + method + " on ManagedArray in object " + this.schema.getKlass() + " with arguments " + args.toString());
        return args;
    }
};

let Locking = superclass => class extends superclass {
    constructor(schema, ...otherArgs) {
        super(schema, ...otherArgs);
        this.locked = false;
    }

    set(propKey, value) {
        if (this.locked) {
            throw new TypeError("object is locked");
        }
        return super.set(propKey, value);
    }

    lock() {
        this.locked = true;
    }

    unlock() {
        this.locked = false;
    }

    notifyArray(method, args, array) {
        args = super.notifyArray(method, args, array);
        let methodsWithSideEffects = ["push", "splice", "pop", "shift", "unshift"];

        if (this.locked && methodsWithSideEffects.includes(method)) {
            throw TypeError("object is locked");
        }
        return args;
    }
};

function makeDoors(manager) {
    let doors = manager.Machine({ "name": "doors" });

    let stateOpened = manager.State({ "name": "opened" });
    let stateClosed = manager.State({ "name": "closed" });
    let stateLocked = manager.State({ "name": "locked" });

    doors.start = stateClosed;
    doors.states.push(stateOpened, stateClosed, stateLocked);

    let transOpen = manager.Transition({ "event": ["open"] });
    let transClose = manager.Transition({ "event": ["close"] });
    let transLock = manager.Transition({ "event": ["lock"] });
    let transUnlock = manager.Transition({ "event": ["unlock"] });

    stateOpened.transitions_in.push(transOpen);
    stateOpened.transitions_out.push(transClose);

    stateClosed.transitions_in.push(transClose, transUnlock);
    stateClosed.transitions_out.push(transOpen, transLock);

    stateLocked.transitions_in.push(transLock);
    stateLocked.transitions_out.push(transUnlock);

    return doors;
}

function execute(machine, events) {
    errrCnt = 0;
    executionLog = [];

    events.map(event => {
        let transition = machine.start.transitions_out.map(transition => {
            return {
                success: transition.events.includes(event),
                from: transition.from,
                to: transition.to
            };
        }).reduce((acc, item) => {
            return item.success ? item : acc;
        }, { success: false, from: machine.start });
        if (transition.success) {
            machine.start = transition.to;
            executionLog.push("Executed transition from " + transition.from.name + " to " + transition.to.name + " with event " + event);
        } else {
            errorCnt++;
            executionLog.push("State " + transition.from.name + " has no outgoing transitions with event " + event);
        }
    });
    return {
        errorCnt,
        executionLog: executionLog.join("\n")
    };
}

function main() {
    doors = makeDoors();
    events = ["open", "close", "lock", "unlock", "open"];
    initialStart = doors.start;

    /* Run a successful sequence of events */
    let result = execute(doors, events);
    console.log("\n=============== Regular Machine Output ===============");
    console.log(result.errorCnt + " errors occurred while executing the doors statemachine");
    console.log("Executed events:");
    console.log(result.executionLog);
    console.log("============= End Regular Machine Output =============\n");

    doors.start = initialStart;
    events = ["open", "close", "close", "open", "close", "lock"];

    /* Run a failing sequence of events */
    result = execute(doors, events);
    console.log("\n=============== Failing Machine Output ===============");
    console.log(result.errorCnt + " errors occurred while executing the doors statemachine");
    console.log("Executed events:");
    console.log(result.executionLog);
    console.log("============= End Failing Machine Output =============\n");

    /* Run some events, then lock the machine */
    doors.start = initialStart;
    events = ["open", "close", "lock"];
    result = execute(doors, events);
    doors.lock();
    result2 = execute(doors, ["unlock"]);
    console.log("\n============== Immutable Machine Output ==============");
    console.log(result.errorCnt + result2.errorCnt + " errors occurred while executing the doors statemachine");
    console.log("Executed events:");
    console.log(result.executionLog + "\n" + result2.executionLog);
    console.log("============ End Immutable Machine Output ============\n");
}

process.argv.forEach(function (val, index, array) {
    let [k, v] = val.split("=");
    if (k == "--log-level") {
        loglevel = v;
    }
});

main();
