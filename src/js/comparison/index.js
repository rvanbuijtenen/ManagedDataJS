import {managedStateMachine} from "./ManagedStateMachine"
import {regularStateMachine} from "./RegularStateMachine"

let logLevel = "info"
let longSequence = false

function main() {
    console.log("===================================================================")
    console.log("===================================================================")
    console.log("====================== Managed State Machine ======================")
    console.log("===================================================================")
    console.log("===================================================================")
    console.log("\n")

    console.time("Managed StateMachine examples")
    managedStateMachine(logLevel, longSequence)
    console.timeEnd("Managed StateMachine examples")

    console.log("\n")
    console.log("===================================================================")
    console.log("===================================================================")
    console.log("====================== Regular State Machine ======================")
    console.log("===================================================================")
    console.log("===================================================================")
    console.log("\n")

    console.time("Regular StateMachine examples")
    regularStateMachine(logLevel, longSequence)
    console.timeEnd("Regular StateMachine examples")
}

process.argv.forEach(function (val, index, array) {
  let [k,v] = val.split("=")
  if (k == "--log-level") {
    logLevel = v
  }
  if(k == "--long") {
    longSequence = true
  }
});

main()