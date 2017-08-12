import AbstractView from "../../AbstractView"

export default class DoorsView extends AbstractView {
	getEvents() {
		return this.renderElement.find($("#events")).val().split(",")
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
		html.push("Machine: "+machine.name)
		html.push("start state: "+machine.start.name)
		html.push("States:")
		for(let s of machine.states) {
			html.push("  "+s.name)
			html.push("    transitions_in for "+ s.name+":")
			for(let t of s.transitions_in) {
				html.push("      "+t.from.name+" -> "+JSON.stringify(t.event.getValues())+" -> "+t.to.name)
			}
			html.push("    transitions_out for "+ s.name+":")
			for(let t of s.transitions_out) {
				html.push("      "+t.from.name+" -> "+JSON.stringify(t.event.getValues())+" -> "+t.to.name)
			}
		}

		this.renderElement.find($("#machine-view")).html(html.join("<br/>"))
	}

	renderExecution(executionLog) {
		this.renderElement.find($("#machine-execution")).html(executionLog.join("<br/>"))
	}

	renderError(message) {
		this.renderElement.find($("#machine-error")).html(message)
	}
}