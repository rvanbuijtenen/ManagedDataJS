import DoorsView from "./DoorsView"

export default class LockingDoorsView extends DoorsView {
	renderLock(state) {
		this.renderElement.find($("#machine-locked")).html(
			"<table width='100%'><tr width='100%'><td width='25%'><b>machine is locked:</b></td><td width='75%'>"+state+"</td></tr></table>"
		)
	}
}