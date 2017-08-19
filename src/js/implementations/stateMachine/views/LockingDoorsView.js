import DoorsView from "./DoorsView"

export default class LockingDoorsView extends DoorsView {
	renderInfo() {
		super.renderInfo()
		this.renderElement.find($("info")).append(`
			<p>
				The locking doors example implements the Locking mixin, giving it 
				the interface to be protected from read and write operations. This 
				locking behaviour provides an alternative way to lock the door, 
				technically making the locked state obsolete.</p>
		`)
	}

	renderLock(state) {
		this.renderElement.find($("#machine-locked")).html(
			"<table width='100%'><tr width='100%'><td width='25%'><b>machine is locked:</b></td><td width='75%'>"+state+"</td></tr></table>"
		)
	}
}