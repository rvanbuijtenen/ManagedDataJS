export class ArrayHandler {
	constructor(items) {
		this.items = items;
	}

	get(target, propKey, receiver) {
		if(propKey == 'push' && this.items.length > 0) {
			const origMethod = target[propKey];
			const items = this.items;
			return function (...args) {
				for(let arg of args) {
					let includes = false;

					let type = ArrayHandler.getType(arg);
					for(let item of items) {
						if(item.hasOwnProperty("enum")) {
							for(let enumItem of item.enum) {
								if(enumItem.type == type) {
									includes = true;
								} else if (type == 'integer' && enumItem.type == 'number') {
									includes = true;
								}
							}
						} else {
							if(item.type == type) {
								includes = true;
							} else if (type == 'integer' && item.type == 'number') {
								includes = true;
							}
						}
					}

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