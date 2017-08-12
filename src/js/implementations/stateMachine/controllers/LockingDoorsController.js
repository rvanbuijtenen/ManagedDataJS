import DoorsController from "./DoorsController"

export default class LockingDoorsController extends DoorsController {
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
}