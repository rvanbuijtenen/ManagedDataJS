import * as basicManager from "./framework/basicDataManager/basicDataManager.js";

import * as loggingObject from "./framework/loggingDataManager/loggingMObject.js";
import * as lockingObject from "./framework/lockingDataManager/lockingMObject.js";
import * as persistentObject from "./caseStudies/graph/persistentManagedGraph/persistentMObject.js";

import * as run from "./implementations/graph/runGraph.js";

import * as runPersistent from "./caseStudies/graph/persistentManagedGraph/runPersistentGraph.js";



// http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
class Main { 
    constructor() {
        
    }
}

document.getElementById('persistentGraph').addEventListener('click', () => {
    let rpg = new runPersistent.RunPersistentGraph();
});

document.getElementById('graph').addEventListener('click', () => {
    let rg = new run.RunGraph();
});