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

	unlock() {
		this.model.unlock()
		this.view.renderLock(this.model.isLocked())
	}

	reset() {
		super.reset()
		this.view.renderLock(this.model.isLocked())
	}
}