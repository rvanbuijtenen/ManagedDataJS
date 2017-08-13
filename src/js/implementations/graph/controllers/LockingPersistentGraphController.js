import LockingGraphController from "./LockingGraphController"

export default class LockingPersistentGraphController extends LockingGraphController {
	constructor(model, view, manager) {
		super(model, view, manager)
		this.lineCnt = 0;
		this.segmentCnt = 0;
		this.pointCnt = 0;
	}

	viewLoaded() {
		super.viewLoaded()
		let savedGraphs = JSON.parse(localStorage.getItem("stored-graphs"))
		if(savedGraphs === null) {
			savedGraphs = []
			localStorage.setItem("stored-graphs", JSON.stringify(savedGraphs))
		}
		this.view.renderLoadOptions(savedGraphs)
	}

	addLine() {
		super.addLine()

		let name = this.model.name
		this.model.setId(name)
		console.log("length: ",this.model.lines.length)
		let line = this.model.lines[this.model.lines.length-1]
		let lineId = name + "/line"+this.lineCnt
		line.setId(lineId)
		line.setFactory(this.manager)
		this.segmentCnt = 0
		line.segments.map((segment, idx) => {
			this.pointCnt = 0;
			let segmentId = lineId + "/segment"+this.segmentCnt
			segment.setId(segmentId);
			segment.setFactory(this.manager)

			segment.from.setId(segmentId + "/point"+this.pointCnt)
			segment.from.setFactory(this.manager)
			this.pointCnt++
			switch(segment.getKlass()) {
				case "LinearLine": {
					segment.to.setId(segmentId + "/point"+this.pointCnt)
					segment.to.setFactory(this.manager)
					this.pointCnt++
					break
				}
				case "QuadraticLine": {
					segment.control1.setId(segmentId + "/point"+this.pointCnt)
					segment.control1.setFactory(this.manager)
					this.pointCnt++
					segment.to.setId(segmentId + "/point"+this.pointCnt)
					segment.to.setFactory(this.manager)
					this.pointCnt++
					break
				}
				case "BezierLine": {
					segment.control1.setId(segmentId + "/point"+this.pointCnt)
					segment.control1.setFactory(this.manager)
					this.pointCnt++
					segment.control2.setId(segmentId + "/point"+this.pointCnt)
					segment.control2.setFactory(this.manager)
					this.pointCnt++
					segment.to.setId(segmentId + "/point"+this.pointCnt)
					segment.to.setFactory(this.manager)
					this.pointCnt++
					break
				}
			}
			this.segmentCnt++;
		})
	}

	save() {
		let savedGraphs = JSON.parse(localStorage.getItem("stored-graphs"))
		if(!(savedGraphs.includes(this.model.name))) {
			savedGraphs.push(this.model.name)
		}
		this.model.save()
		this.view.renderLoadOptions(savedGraphs)
		localStorage.setItem("stored-graphs", JSON.stringify(savedGraphs))
	}

	load() {
		let graphId = this.view.getLoadOption()
		this.model.setId(graphId)
		this.model.load()

		this.lineCnt = this.model.lines.map((line) => {
			return parseInt(line.getId().match(/\d+$/).pop())
		}).reduce((id, max) => {return id > max ? id : max}, 0) + 1

		this.view.draw(this.model)
	}

	reset() {
		super.reset()
		this.model.setId("")
		this.model.setFactory(this.manager)
	}
}