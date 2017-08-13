import AbstractController from "../../AbstractController"

export default class GraphController extends AbstractController {
	viewLoaded() {
		super.viewLoaded()
		this.view.makeCanvas()
	}

	addLine() {
		let {name, points, width, color} = this.view.getLineParams()

		if(name != this.model.name) {
			this.model.name = name
		}

		let line = this.manager.Line({width: width, color: color})
		
		points.map(this.addSegment.bind(this,line))

		this.model.lines.push(line)
		this.view.draw(this.model)
	}

	addSegment(line, coordinates) {
		let from, to, control1, control2
		switch (coordinates.length) {
			case 4: {
				from = this.manager.Point({x: coordinates[0], y: coordinates[1]})
				to = this.manager.Point({x: coordinates[2], y: coordinates[3]})

				line.segments.push(this.manager.LinearLine({from, to}))
				break;
			}
			case 6: {
				from = this.manager.Point({x: coordinates[0], y: coordinates[1]})
				control1 = this.manager.Point({x: coordinates[2], y: coordinates[3]})
				to = this.manager.Point({x: coordinates[4], y: coordinates[5]})

				line.segments.push(this.manager.QuadraticLine({from, control1, to}))
				break;
			}
			case 8: {
				from = this.manager.Point({x: coordinates[0], y: coordinates[1]})
				control1 = this.manager.Point({x: coordinates[2], y: coordinates[3]})
				control2 = this.manager.Point({x: coordinates[4], y: coordinates[5]})
				to = this.manager.Point({x: coordinates[6], y: coordinates[7]})
				
				line.segments.push((this.manager.BezierLine({from, control1, control2, to})))
				break;
			}
		}
	}

	reset() {
		this.model = this.manager.Graph({"name": ""})
		this.view.draw(this.model)
	}
}