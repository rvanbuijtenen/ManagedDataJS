import runMachine from "./implementations/stateMachine"
import runGraph from "./implementations/graph"


// http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/


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

//document.getElementById('test').addEventListener('click', () => {
	/*let schema = require("./implementations/relations/relations.json")

    let manager = new DataManager(schema)

    let a1 = manager.A()
    let a2 = manager.A()
    let b1 = manager.B({x: 1})
    let b2 = manager.B({x: 2})
    let d1 = manager.D()
    let d2 = manager.D()

    let e1 = manager.E()
    let e2 = manager.E()
    let e3 = manager.E()

    /** Test OneToOne **/
   /* a1.b = b1;
    console.log("a1.b == b1", a1.b === b1 && b1.a === a1)
    a2.b = b1;
    console.log("a2.b == b1", a2.b === b1 && b1.a === a2 && !(a1.b === b1))

    /** Test OneToMany **/
  /*  a1.d.push(d1)
    a1.d.push(d2)

    console.log("a1.d contains d1", a1.d.includes(d1) && d1.a === a1)

    console.log("a1.d contains d2", a1.d.includes(d2) && d2.a === a1)

    a2.d.push(d1)

    console.log("a2.d contains d1", a2.d.includes(d1) && d1.a === a2)
    console.log("not a1.d contains d1", !a1.d.includes(d1) && !(d1.a === a1))

    a1.e.push(e1,e2,e3)
    a2.e.push(e1,e2)

    console.log("a1.e contains e1, e2, e3", a1.e.includes(e1) && a1.e.includes(e2) && a1.e.includes(e3) && e1.a.includes(a1) && e2.a.includes(a1) && e3.a.includes(a1))
    console.log("a2.e contains e1, e2", a2.e.includes(e1) && a2.e.includes(e2) && e1.a.includes(a2) && e2.a.includes(a2))

    a1.e.remove(e2)

    console.log("a1.e contains e1, e3", a1.e.includes(e1) && a1.e.includes(e3) && e1.a.includes(a1) && !e2.a.includes(a1) && e3.a.includes(a1))
    console.log("a2.e contains e1, e2", a2.e.includes(e1) && a2.e.includes(e2) && e1.a.includes(a2) && e2.a.includes(a2))
*/
 /*   let schema = require("./implementations/graph/graphSchema.json")
    let manager1 = new DataManager(schema, Locking, Persistence)
    let graph = manager1.Graph()
    graph.setId("graph")
    graph.setFactory(manager1)

    let line1 = manager1.Line()
    line1.setId("line")
    line1.setFactory(manager1)
    graph.lines.push(line1)

    let point = manager1.Point({x: 5, y: 5})
    point.setId("start")
    point.setFactory(manager1)
    graph.lines[0].start = point

    let from = manager1.Point({x:5,y:5})
    from.setId("from")
    from.setFactory(manager1)

    let to = manager1.Point({x:6,y:6})
    to.setId("to")
    to.setFactory(manager1)

    let lLine = manager1.LinearLine({from: from, to: to})
    lLine.setId("linear")
    lLine.setFactory(manager1)

    graph.lines[0].segments.push(lLine)

    graph.save()

    let graph2 = manager1.Graph()
    graph2.setId("graph")
    graph2.setFactory(manager1)
    graph2.load()


    let manager2 = new DataManager(require("./test.json"))
    let t1 = manager2.Teacher()
    let t2 = manager2.Teacher()
    let t3 = manager2.Teacher()
    let p = manager2.Principal()
    let s1 = manager2.Student()
    let s2 = manager2.Student()
    let s3 = manager2.Student()
    let s = manager2.School()

    t1.students.push(s1,s2,s3)
    t2.students.push(s1,s2)
    p.is_employed_as = t3
    p.is_head_of = s

    s.teachers.push(t1,t2,t3)

    s.students.push(s1,s2,s3)


    console.log("Initial State:")
    console.log(graph2, graph)

    console.log("graph2.lines[0] === graph:", graph2.lines[0].graph === graph2)
    console.log("graph2.lines[0].segments[0].belongs_to ===  grah.lines[0]:",graph2.lines[0].segments[0].belongs_to === graph2.lines[0])
 



    console.log("graph.lines[0] === graph:", graph.lines[0].graph === graph)
    console.log("graph.lines[0].segments[0].belongs_to ===  grah.lines[0]:",graph.lines[0].segments[0].belongs_to === graph.lines[0])
    
    console.log("t1.students includes (s1,s2,s3):", t1.students.includes(s1), t1.students.includes(s2), t1.students.includes(s3))
    console.log("(s1,s2,s3).teachers includes t1:", s1.teachers.includes(t1), s2.teachers.includes(t1), s3.teachers.includes(t1))
    console.log("t2.students includes (s1,s2):", t2.students.includes(s1), t2.students.includes(s2))
    console.log("t2.students !includes (s3):", !t2.students.includes(s3))
    console.log("(s1,s2).teachers includes t2:", s1.teachers.includes(t2), s2.teachers.includes(t2))
    console.log("(s3).teachers !includes t2:", !s3.teachers.includes(t2))


    console.log("s.principal === p:", s.principal === p)
    console.log("s.teachers includes (t1,t2,t3)", s.teachers.includes(t1), s.teachers.includes(t2), s.teachers.includes(t3))
    console.log("s.students includes (s1,s2,s3)", s.students.includes(s1), s.students.includes(s2), s.students.includes(s3))
    console.log("(s1,s2,s3).studies_at === s", s1.studies_at === s, s2.studies_at === s, s3.studies_at === s)
    console.log("(t1,t2,t3).is_employed_at === s", t1.is_employed_at === s, t2.is_employed_at === s, t3.is_employed_at === s)
    console.log("p.is_head_of === s", p.is_head_of === s)
    console.log("p.is_employed_as === t3", p.is_employed_as === t3)


    console.log("Event: s1 drops out of class of t1")
    s1.teachers.remove(t1)
    console.log("Event: t1 kicks s2 out of class")
    t1.students.remove(s2)
    console.log("New state: ")

    console.log("t1.students includes (s3): =", t1.students.includes(s3))
    console.log("t1.students !includes (s1,s2):", !t1.students.includes(s1), !t1.students.includes(s2))
    console.log("(s3).teachers includes t1:", s3.teachers.includes(t1))
    console.log("(s1,s2).teachers !includes t1:", !s1.teachers.includes(t1), !s2.teachers.includes(t1))
    console.log("t2.students includes (s1,s2):", t2.students.includes(s1), t2.students.includes(s2))
    console.log("t2.students !includes (s3):", !t2.students.includes(s3))
    console.log("(s1,s2).teachers includes t2:", s1.teachers.includes(t2), s2.teachers.includes(t2))
    console.log("(s3).teachers !includes t2:", !s3.teachers.includes(t2))
});*/
