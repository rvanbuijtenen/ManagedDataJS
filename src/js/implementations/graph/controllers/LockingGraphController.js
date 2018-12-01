import GraphController from "./GraphController"

export default class LockingGraphController extends GraphController {
	viewLoaded() {
		super.viewLoaded()
		this.view.renderLock(this.model.isLocked())
	}

	lock() {
		this.model.lock()
		this.view.renderLock(this.model.isLocked())
	}

	addLine() {
		try {
			super.addLine()
		} catch (e) {
			console.log(e)
		}
	}

	addSegment(line, coordinates) {
		try {
			super.addSegment(line, coordinates)
		} catch (e) {
			console.log(e)
		}
	}

	unlock() {
		this.model.unlock()
		this.view.renderLock(this.model.isLocked())
	}

	reset() {
		try {	
			super.reset()
			this.view.renderLock(this.model.isLocked())
		} catch (e) {
			console.log(e)
		}
	}
}