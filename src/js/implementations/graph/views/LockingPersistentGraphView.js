import LockingGraphView from "./LockingGraphView"

export default class LockingPersistentGraphView extends LockingGraphView {
	getLoadId() {
		return this.renderElement.find($("#graph-saved-graphs")).val()
	}

	getLoadOption() {
		return this.renderElement.find($("#graph-saved-graphs")).val()
	}

	renderLoadOptions(graphs) {
		let select = this.renderElement.find($("#graph-saved-graphs"))
		let graphOptions = graphs.map((graphName) => {
			select.append("<option value='"+graphName+"'>"+graphName+"</option>")
		})
		console.log(this.renderElement.find($("#graph-saved-graphs")), graphOptions.join(""))
	}
}