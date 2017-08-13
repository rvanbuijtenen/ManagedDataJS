import GraphView from "./GraphView"

export default class LockingGraphView extends GraphView {
	renderLock(state) {
		this.renderElement.find($("#graph-locked")).html("<h2>Graph is locked: <b>"+state+"</b>")
	}
}