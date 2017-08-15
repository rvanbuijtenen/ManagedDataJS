import AbstractController from "../../AbstractController"

export default class DocumentationController extends AbstractController {
	constructor(model, view, manager) {
		super(model, view, manager)
		this.initModel()
	}

	initModel() {
		let dm = this.manager.Module({indexTemplate: "dataManager/index.html", name: "dataManager"})
		let c = this.manager.Class({template: "dataManager/DataManager.html", name: "dataManager.DataManager"})
		let f = this.manager.Function({template: "dataManager/factory.html", name: "dataManager.factory"})
		dm.members.push(c,f)
		this.model.modules.push(dm)
	}

	viewLoaded() {
		this.view.renderTemplate("index.html")	
	}

	handleLink(to) {
		to
		let modules = this.model.modules.map((module) => {
			let obj = {}
			obj[module.name] = module.indexTemplate
			return obj
		}).reduce((obj, acc) => {
			return {...obj, ...acc}
		})

		console.log(modules, modules[to], to)

		if(modules.hasOwnProperty(to)) {
			this.view.renderTemplate(modules[to].indexTemplate)
		} else {
			let templates = this.model.modules.map((module) => {
				return module.members.map((member) => {
					let obj = {}
					obj[member.name] = member.template
					return obj
				})
			}).reduce((arr, acc) => {
					acc.concat(arr)
			}).reduce((obj, acc) => {
				return {...obj, ...acc}
			})

			console.log(templates)

			if(templates.hasOwnProperty(to)) {
				this.view.renderTemplate(templates[to].template)
			} else {
				this.view.renderTemplate("404.html")
			}

		}
	}
}