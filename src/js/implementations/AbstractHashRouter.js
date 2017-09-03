const pushUrl = (href) => {
	history.pushState({}, '', href);
	window.dispatchEvent(new Event('popstate'));
};

export default class AbstractHashRouter {
	constructor(hostName, model, manager, renderElement) {
		this.hostName = hostName + "/#"
		this.model = model
		this.manager = manager
		this.renderElement = renderElement
		this.controllers = []
		this.views = []
		this.initRoutes()

		$(document).ready(() => {
			this.match(window.location.href)
		})
		window.addEventListener('popstate', () => {
			this.match(window.location.href)
		});
	}

	initRoutes() {
		this.routes = {}
	}

	match(path) {
		let routes = []
		path = path.replace(new RegExp(this.hostName), '')
		console.log("path: ", path)
		for(let route in this.routes) {
			let match = path.match(new RegExp(route))
				console.log(route, match)
			if(match != null && match[0] == path) {
				match = match
				let controllers = [...this.routes[route].controllers]
				this.unload(controllers)
				let views = [...this.routes[route].views].reverse()
				let templates = [...this.routes[route].templates].reverse()
				let params = []
				if(this.routes[route].hasOwnProperty("params")) {
					params = [...this.routes[route].params]
				}
				controllers.map((controller) => {
					let result = {}
					let matchCpy = [...match]
					result.controller = controller
					result.view = views.pop()
					result.template = templates.pop()
					result.params = {}
					for(let param of params) {
						result.params[param] = matchCpy.pop()
					}
					routes.push(result)
				})
			}
		}
		routes.map((mvc) => {
			let exists = false
			this.views.map((view) => {
				if(view instanceof mvc.view) {
					exists = true
					view.load()
				}
			})

			if(exists == false) {
				let view = new mvc.view(mvc.template, this.renderElement)
				let controller = new mvc.controller(this.model, view, this.manager)
				controller.setParams(mvc.params)
				this.views.push(view)
				this.controllers.push(controller)
			} else {
				this.controllers.map((controller) => {
					if(controller instanceof mvc.controller) {
						controller.setParams(mvc.params)
					}
				})
			}
		})
	}

	unload(loaded) {
		this.controllers.map((controller) => {
			if(!loaded.includes(controller)) {
				controller.view.unload()
			}
		})
	}
}