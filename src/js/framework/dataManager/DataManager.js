import {MObject, MObjectHandler} from "./MObject";
import {parseSchema} from "./Schema";

/**
 * mix is an anonymous function that returns a new MixinBuilder for the superclass
 *
 * @param {Class} superclass - an ES6 class definition that should be extended with mixins
 * @return {MixinBuilder} An instance of MixinBuilder for the given superclass
 */
let mix = (superclass) => new MixinBuilder(superclass);

/**
 * MixinBuilder is a class that dynamically constructs a prototype chain for the superclass
 * given to its constructor.
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
 * The factory function constructs a new instance of an MObject with the appropriate
 * mixins applied to it.
 *
 * @param {String} klass - A string representing the klass of the managed object.
 * @param {Object} inits - An object containing initial values for the managed object
 * @param {*} [otherArg1,otherArg...,otherArgN] - Any other parameters passed to the factory are 
 * considered other arguments. These other arguments are passed to the constructor of the managed object 
 * and are meant to be used by mixins. Each mixin can then extract its required extra parameters from the otherArgs
 *
 * @return {MObject} A proxied managed object that matches the schema and implements all mixin functionality
 */ 
class FactoryHandler {
	construct(target, argumentsList, newTarget) {
		return target.apply(target, null, argumentsList)
	}
}

/**
 * The DataManager consists of a constructor that receives a schema and optionally a number of mixins as input.
 *
 * The schema is parsed and for each klass a factory function is assigned to this[klassName]
 *
 * Finally a proxy is wrapped around this instance of the basicRecord factory that
 * ensures factory.klassName(inits, args) call is forwarded to the factory function as
 * factory(klassName, inits, args)
 */
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