import AbstractView from "../../AbstractView"

export default class DoorsView extends AbstractView {
	getEvents() {
		return this.renderElement.find($("#events")).val().split(",")
	}

	renderInfo() {
		this.renderElement.find($("#info")).append(`
			<h2>Doors state machine implementation using MD4JS</h2>
			<p>
				The doors state machine represents a door that has three states that 
				can be transitioned between by giving the state machine a sequence of events:
				<ul>
					<li>Opened</li>
					<li>Closed</li>
					<li>Locked</li>
				</ul>
			</p>
			<p>
				The input for transitions are regular strings representing the event 
				that should be executed. The doors example implements an 'open', 'close', 
				'lock' and 'unlock' transition. Multiple events can be executed in sequence by separating them by commas. 
			</p>
		`)
	}

	renderCurrentState(machine) {
		let html = [];

		html.push("<table width='100%'>")
		html.push("<tr width='100%'>")
		html.push("<td width='25%'><b>Current State:</b></td><td width='75%'>"+machine.start.name+"</td>")
		html.push("</tr><tr>")
		html.push("<td><b>Available Transitions:<b></td>")
		html.push("<td>")
		for(let transition of machine.start.transitions_out) {
			html.push(transition.from.name+" ---- "+transition.event.getValues()+" ---> "+transition.to.name+"</br>")
		}
		html.push("</td></tr></table>")
		
		this.renderElement.find($("#machine-state")).html(html.join(""))
	}

	renderMachine(machine) {
		let html = []
		html.push("<b>Machine</b>: "+machine.name)
		html.push("<b>start state</b>: "+machine.start.name)
		html.push("<b>States</b>:")
		for(let s of machine.states) {
			html.push("  "+s.name)
			html.push("    <b>transitions_in for "+ s.name+"</b>:")
			for(let t of s.transitions_in) {
				html.push("      "+t.from.name+" -> "+JSON.stringify(t.event.getValues())+" -> "+t.to.name)
			}
			html.push("    <b>transitions_out for "+ s.name+"</b>:")
			for(let t of s.transitions_out) {
				html.push("      "+t.from.name+" -> "+JSON.stringify(t.event.getValues())+" -> "+t.to.name)
			}
		}

		this.renderElement.find($("#machine-view")).html(html.join("<br/>"))
	}

	renderExecution(messages) {
		this.renderElement.find($("#machine-execution")).append(messages.join(' ---> ') + "<br/>")
	}

	resetExecution() {
		this.renderElement.find($("#machine-execution")).html("")
	}
}