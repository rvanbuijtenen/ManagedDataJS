
import * as run from "./implementations/graph/runGraph.js";
import * as runPersistent from "./implementations/graph/runPersistentGraph.js";
import * as runLogging from "./implementations/graph/runLoggingGraph.js";
import * as runPersistentLoggingLocking from "./implementations/graph/runPersistentLoggingLockingGraph.js";

import * as doors from "./implementations/stateMachine/runDoors.js";
import * as loggingDoors from "./implementations/stateMachine/runLoggingDoors.js";
import * as lockingDoors from "./implementations/stateMachine/runLockingDoors.js";
import * as loggingGmailValidator from "./implementations/stateMachine/runLoggingGmailValidator.js";


// http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/


document.getElementById('persistentGraph').addEventListener('click', () => {
    let graph = new runPersistent.RunPersistentGraph();
});

document.getElementById('loggingGraph').addEventListener('click', () => {
    let graph = new runLogging.RunLoggingGraph();
});

document.getElementById('graph').addEventListener('click', () => {
    let graph = new run.RunGraph();
});

document.getElementById('persistentLoggingLockingGraph').addEventListener('click', () => {
    let graph = new runPersistentLoggingLocking.RunPersistentLoggingLockingGraph();
});


document.getElementById('doors').addEventListener('click', () => {
    let graph = new doors.RunDoors();
});

document.getElementById('loggingDoors').addEventListener('click', () => {
    let graph = new loggingDoors.RunLoggingDoors();
});

document.getElementById('lockingDoors').addEventListener('click', () => {
    let graph = new lockingDoors.RunLockingDoors();
});

document.getElementById('loggingGmailValidator').addEventListener('click', () => {
    let graph = new loggingGmailValidator.RunLoggingGmailValidator();
});