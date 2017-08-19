import GraphView from "./GraphView"

export default class LockingGraphView extends GraphView {
	renderInfo() {
		super.renderInfo()
		this.renderElement.find($("#info")).append(`
			<p>
				A locking graph implements the Locking mixin, which allows locking and 
				unlocking the graph from read and write access
			</p>`)
	}
	renderLock(state) {
		this.renderElement.find($("#graph-locked")).html("<h2>Graph is locked: <b>"+state+"</b>")
	}
}