import AbstractView from "../../AbstractView"

export default class GraphView extends AbstractView {
	makeCanvas() {
		this.renderElement.find($("#graph-canvas")).append(`
			<canvas id='graph-draw-canvas' style='width:100%; height:100%;'/>`)
	}

	getLineParams() {
		let name = this.renderElement.find($("#name")).val()
		let values = this.renderElement.find($("#line")).val()

		let points = JSON.parse("["+values+"]")

		let width = this.renderElement.find($("#width")).val()
		let color = this.renderElement.find($("#color")).val()
		return {name, points, width, color}
	}

	renderInfo() {
		this.renderElement.find($("#info")).append(`
			<h1>
				Graph implementation using MD4JS
			</h1>
			<p>
				The Graph example is a small single-page application that uses ManagedData 
				to implement its model. It is capable of drawing lines that consist of any combination of:
				<ul>
					<li>Linear line segments</li>
					<li>Quadratic curve segments</li>
					<li>Bezier curve segments</li>
				</ul>
			</p>
			<p>
				A new graph can be created by filling in the form and then pressing the 'Add Line' button. If the program's 
				current graph's name does not match the entered name a new graph will be created for the line, otherwise the line will be added
				to the existing graph.
			</p>
			<p>
				A line can be created by entering the coordinates of its segments. Coordinates should be enclodes by square brackets [] and separated by commas.
				When multiple segments are given these should be separated by commas as well. Any other characters like spaces or strings are not allowed. Some example inputs:
				<ul>
					<li>Linear line from (0,0) to (1,1):<br>
						[0,0,1,1]
					<li>Quadratic curve from (0,0) to (1,1) through the control point (1,0):<br>
						[0,0,1,0,1,1]
					<li>Bezier curve from (0,0) to (1,0) through the control points (0,1) and (1,1):<br>
						[0,0,0,1,1,1,1,0]
				</ul>
			</p>`)
	}

	renderGraphName(name) {
		this.renderElement.find($("#graph-name")).html(name)
	}

	draw(graph) {
		let canvas = this.renderElement.find($("#graph-draw-canvas"))[0]
		let context = canvas.getContext("2d")
		context.clearRect(0,0, canvas.width, canvas.height)
		

		let {min_x, min_y, max_x, max_y} = this.findMinMax(graph)
		let scale_x = canvas.width / (max_x - min_x)
		let scale_y = canvas.height / (max_y - min_y)

		
		graph.lines.map((line) => {		
			line.segments.map((segment) => {
				context.beginPath();
				context.strokeStyle = segment.belongs_to.color
				context.lineWidth = segment.belongs_to.width
				context.moveTo(segment.from.x*scale_x, canvas.height-segment.from.y*scale_y)
				switch(segment.getKlass()) {
					case "LinearLine": {
						context.lineTo(
							segment.to.x*scale_x, 
							canvas.height-segment.to.y*scale_y) 
						break
					}
					case "QuadraticLine": {
						context.quadraticCurveTo(
							segment.control1.x*scale_x,
							canvas.height-segment.control1.y*scale_y,
							segment.to.x*scale_x,
							canvas.height-segment.to.y*scale_y) 
						break
					}
					case "BezierLine": {
						context.bezierCurveTo(
							segment.control1.x*scale_x,
							canvas.height-segment.control1.y*scale_y,
							segment.control2.x*scale_x,
							canvas.height-segment.control2.y*scale_y,
							segment.to.x*scale_x,
							canvas.height-segment.to.y*scale_y)
						break
					}
				}
				context.stroke()
			})
		})
	}

	findMinMax(graph) {
		/* extract all points from the lines in graph */
		let points = graph.lines.map((line) => {
			return line.segments.map((segment) => {
				switch(segment.getKlass()) {
					case "LinearLine": return [segment.from, segment.to]
					case "QuadraticLine": return [segment.from, segment.control1, segment.to]
					case "BezierLine": return [segment.from, segment.control1, segment.control2, segment.to]
				}
			})
		})

		/* concatenate the array of arrays into a single array */
		points = points.reduce((acc, items) => {
			return acc.concat(...items)
		}, [])

		/* determine the minimum and maximum for all points */
		let min_x = 9999999, min_y = 9999999, max_x = -9999999, max_y = -9999999
		points.map((point) => {
			min_x = point.x < min_x ? point.x : min_x
			max_x = point.x > max_x ? point.x : max_x
			min_y = point.y < min_y ? point.y : min_y
			max_y = point.y > max_y ? point.y : max_y
		})
		return {min_x, min_y, max_x, max_y}
	}
}