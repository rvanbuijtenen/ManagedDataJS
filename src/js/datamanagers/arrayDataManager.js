export class ArrayHandler {
	constructor(items) {
		this.items = items;
	}

	get(target, propKey, receiver) {
		
		console.log(arguments);
		if(propKey == 'push') {
			const origMethod = target[propKey];
			const items = this.items;
			return function (...args) {
				for(let arg of args) {
					console.log({"arg": arg});
					let includes = false;
					for(let item of items) {
						if(item.type == ArrayHandler.getType(arg)) {
							includes = true;
						}
					}
					if(!includes) {
						throw new TypeError("must be one of " + JSON.stringify(items));
					}
				}
	            let result = origMethod.apply(this, args);
	            return result;
	        };
		}
		return Reflect.get(target, propKey, receiver);
	}

	static getType(item) {
		if(item.hasOwnProperty('klass')) {
			return item.klass;
		} else if (item.constructor == String) {
			return 'string';
		}
	}
}