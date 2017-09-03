import HashRouter from "./router"
import {DataManager} from "../../framework/dataManager/DataManager"
import {ApiSynchronization} from "../../framework/mixins"


export default function runForum(viewElement) {
	let schema = require("./schemas/blogSchema.json")
	let manager = new DataManager(schema, ApiSynchronization)
	let blog = new manager.Blog()
	blog.posts.push(new manager.Post({title: "The Blog Example", author: "Remco", id: 1, content: `	Welcome to the Blog example. Blog demonstrates how the framework built on top of Managed Data is used to build an application that allows users to create blog posts or leave a comment on other users´ posts. This example uses the ApiSynchronization mixin to handle the communication between our models and the backend database. We also introduce the routing feature from the front-end framework. This allows us to match routes and parameters from the url like "http://host.domain/controller1/param1/controller2/param2/" and map these routes to the correct views and controllers.`, date: new String(new Date())}))
	let router = new HashRouter("http://localhost:8080", blog, manager, viewElement)
}