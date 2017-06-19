import * as bdm from "./basicDataManager.js"

/*
 * The ArrayHandler acts as a protective layer between javascripts Array class
 * and ManagedData. This is neccesary to preserve array.push(item) syntax while performing
 * type checking against the schema.
 */
export class ArrayHandler {
	constructor(items) {
		this.items = items;
	}

	get(target, propKey, receiver) {
		/* We only want to modify the behaviour of push when there are restrictions defined in items */
		if(propKey == 'push' && this.items.length > 0) {
			const origMethod = target[propKey];
			const items = this.items;
			/*
			 * Return a function that performs the type validation and then pushes the item on
			 * the target array if the check was succesful.
			 */
			return function (...args) {
				/* for each argument: */
				for(let arg of args) {
					let includes = false;

					/* Check if the type of the argument is included in the items property */
					let type = ArrayHandler.getType(arg);
					for(let item of items) {
						if(item.hasOwnProperty("enum")) {
							if(item.enum.includes(arg)) {
								includes = true;
							}
						} else {
							if(item.type == type) {
								includes = true;
							} else if (type == 'integer' && item.type == 'number') {
								includes = true;
							}
						}
					}

					/* if the type is not included: construct an error message and throw a typeError */
					if(!includes) {
						let msg = "["
						for(let item of items) {
							if(item.hasOwnProperty('type')) {
								msg = msg + item.type + ",";
							} else if (item.hasOwnProperty('enum')) {
								for(let enumItem of item.enum) {
									msg = msg + enumItem + ",";
								}
							}
						}
						msg = msg.substring(0, msg.length-1) + "]";

						throw new TypeError("items in this array must be one of " + msg);
					}
				}
				/* At this point validation was succesful, so we apply the originally called method and return the result */
	            let result = origMethod.apply(this, args);
	            return result;
	        };
		}
		/* Another method than push was invoked, so we simply forward the call to the target using Reflect */
		return Reflect.get(target, propKey, receiver);
	}

	/* A method that returns a string describing the type of an item */
	static getType(item) {
		if(item.hasOwnProperty('klass')) {
			return item.klass;
		} else if (item.constructor == String) {
			return 'string';
		} else if (item.constructor == Number) {
			if(item%1 == 0) {
				return 'integer';
			} else {
				return 'number';
			}
		} else if (typeof(item) === 'boolean') {
			return 'boolean';
		} 
	}
}