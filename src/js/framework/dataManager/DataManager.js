import {MObject, MObjectHandler} from "./MObject";
import {parseSchema} from "./Schema";

/**
 * mix is an anonymous function that returns a new MixinBuilder for the given superclass
 *
 * @param {Class} superclass - an ES6 class definition that should be extended with mixins
 * @return {MixinBuilder} An instance of MixinBuilder for the given superclass
 */
let mix = (superclass) => new MixinBuilder(superclass);

/**
 * MixinBuilder is a class that dynamically constructs a prototype chain for the superclass
 * given to its constructor. This is done by reducing a list of mixins, where a mixin is a 
 * function taking that takes a class as argument and returns a dynamic extension of that class.
 */
class MixinBuilder {  

	/**
	 * @param {Class} superclass - an ES6 class definition that should be extended with mixins
	 */
	constructor(superclass) {
		/**
		 * @type {Class}
		 */
		this.superclass = superclass;
	}

	/**
	 * with takes an arbitrary number of mixins as argument. A mixin is defined as follows:
	 *
	 * (superclass) => class extends superclass {}
	 *
	 * This definition results in an anonymous class that extends the given superclass. This way
	 * we can reduce an array of mixins starting with this mixinBuilder's  superclass.
	 *
	 * @param {Function} mixin1,mixin...,mixinN - an arbitrary number of mixins that the superclass should be extended with
	 *
	 * @return {Class} this mixinBuilders superclass extended with all given mixins
	 */
	with(...mixins) {
		return mixins.reduce((c, mixin) => mixin(c), this.superclass);
	}
}

/**
 * The FactoryHandler traps constructor calls and converts this to a regular function call.
 * This is done in order to allow the 'new' syntax to be used when created MObjects from the
 * DataManager
 */
class FactoryHandler {
	construct(target, argumentsList, newTarget) {
		return target.apply(target, null, argumentsList)
	}
}

/**
 * The DataManager provides the main interface for ManagedData. When given a schema (and optionally a number of mixins)
 * the data manager provides factory functions for each Klass defined in the schema. These factory functions are accessible
 * under a string or symbol that is equal to the Klass. Example:
 *
 * let manager = new DataManager(schema, mixin1, mixin2)
 * let obj = new manager.Klass(inits) */
export class DataManager {
	/**
	 * @param {Object} schema - A raw JSON schema describing the objects that should be constructed by this data manager
	 * @param {...Function} [mixin1,mixin...,mixinN] - an arbitrary number of mixins that should be used to extend managed
	 * objects constructed by the basic data manager
	 */
	constructor(schema, ...mixins) {
		/**
		 * An array of mixins for the managed objects created by this data manager
		 * @type {Array}
		 */
		this.mixins = []

		/* set mixins for the factory function. If the basic data manager did not receive
		 * any mixins we set it to an empty array */
		if(mixins.length > 0 && mixins[0] != undefined) {
			this.mixins = mixins;
		}

		/**
		 * The schema property holds the parsed schema that can be used by the factory function
		 * @type {Schema}
		 */
		this.schema = parseSchema(schema);

		for(let klass in this.schema.klasses) {
			/**
			 * Strings and Symbols corresponding with a klass defined in the DataManager's
			 * schema map to DataManager.factory
			 * @type {Function}
			 */
			this[klass] = new Proxy(this.factory.bind({
				schema: this.schema.getKlassByName(klass),
				mixins: this.mixins,
				klass: klass
			}), new FactoryHandler())
		}
	}

	/**
	 * @param {Object} inits - An object containing initial values for the MObject
	 * @return MObject - A proxied MObject
	 */
	factory(inits) {
		let mobjClass = {};
		if(this.mixins.length > 0) {
			mobjClass = (class extends mix(MObject).with(...this.mixins){});
		} else {
			mobjClass = (class extends MObject {});
		}

		let mobj = new mobjClass(this.schema);
		let mObjProxy = new Proxy(mobj, new MObjectHandler());

		/* The MObject needs a pointer to its own proxy for when an inverse field is found */
		mObjProxy.setThisProxy(mObjProxy);
		mObjProxy.init(inits);
			
		return mObjProxy;
	}
}