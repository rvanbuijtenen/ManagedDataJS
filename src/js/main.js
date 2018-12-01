import runMachine from "./implementations/stateMachine"
import runGraph from "./implementations/graph"
import runDocumentation from "./implementations/documentation"

document.getElementById('graph').addEventListener('click', () => {
    runGraph("graph", $("#content"))
});

document.getElementById('loggingGraph').addEventListener('click', () => {
    runGraph("loggingGraph", $("#content"))
});

document.getElementById('lockingGraph').addEventListener('click', () => {
    runGraph("lockingGraph", $("#content"))
});

document.getElementById('loggingLockingGraph').addEventListener('click', () => {
    runGraph("loggingLockingGraph", $("#content"))
});

document.getElementById('loggingLockingPersistentGraph').addEventListener('click', () => {
    runGraph("loggingLockingPersistentGraph", $("#content"))
});


document.getElementById('doors').addEventListener('click', () => {
    runMachine("doors", $("#content"))
});

document.getElementById('loggingDoors').addEventListener('click', () => {
    runMachine("loggingDoors", $("#content"))
});

document.getElementById('lockingDoors').addEventListener('click', () => {
    runMachine("lockingDoors", $("#content"))
});

document.getElementById('loggingLockingDoors').addEventListener('click', () => {
    runMachine("loggingLockingDoors", $("#content"))
});

document.getElementById('loggingGmailValidator').addEventListener('click', () => {
    runMachine("gmailValidator", $("#content"))
});
