export default class Helpers{

	static elVisible(el){
		return !(el.offsetWidth <= 0 && el.offsetHeight <= 0);
	}

	static elOffset(el){
		var box = el.getBoundingClientRect();

		return {
			top: box.top + window.pageYOffset - document.documentElement.clientTop,
			left: box.left + window.pageXOffset - document.documentElement.clientLeft
		};
	}

	static retrieveNestedData(separator, field, data){
		var structure = separator ? field.split(separator) : [field],
		length = structure.length,
		output;

		for(let i = 0; i < length; i++){

			data = data[structure[i]];

			output = data;

			if(!data){
				break;
			}
		}

		return output;
	}

	static deepClone(obj, clone, list = []){
		var objectProto = {}.__proto__,
		arrayProto = [].__proto__;

		if (!clone){
			clone = Object.assign(Array.isArray(obj) ? [] : {}, obj);
		}

		for(var i in obj) {
			let subject = obj[i],
			match, copy;

			if(subject != null && typeof subject === "object" && (subject.__proto__ === objectProto || subject.__proto__ === arrayProto)){
				match = list.findIndex((item) => {
					return item.subject === subject;
				});

				if(match > -1){
					clone[i] = list[match].copy;
				}else{
					copy = Object.assign(Array.isArray(subject) ? [] : {}, subject);

					list.unshift({subject, copy});

					clone[i] = this.deepClone(subject, copy, list);
				}
			}
		}

		return clone;
	}

	static getCorrectedDimensions(element, dimension) {
		if (!element) return 0;
		const rect = element.getBoundingClientRect();
		const scaleFactors = Helpers.getTransformScaleFactors(element);

		switch(dimension) {
			case 'height':
				return Math.ceil(rect.height / scaleFactors.y);
			case 'width':
				return Math.ceil(rect.width / scaleFactors.x);
			default:
				return rect;
		}
	}

	static getTransformScaleFactors(element) {
		let scaleX = 1, scaleY = 1;
		let current = element;

		while (current && current !== document.body) {
			const style = window.getComputedStyle(current);
			const transform = style.transform;

			if (transform && transform !== 'none') {
				const matrix = transform.match(/matrix\(([^)]+)\)/);
				const matrix3d = transform.match(/matrix3d\(([^)]+)\)/);

				if (matrix) {
					const values = matrix[1].split(',').map(parseFloat);
					scaleX *= values[0] || 1;
					scaleY *= values[3] || 1;
				} else if (matrix3d) {
					const values = matrix3d[1].split(',').map(parseFloat);
					scaleX *= values[0] || 1;
					scaleY *= values[5] || 1;
				}
			}
			current = current.parentElement;
		}

		return { x: scaleX, y: scaleY };
	}

	static getCorrectedRect(element) {
		if (!element) return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };

		const rect = element.getBoundingClientRect();
		const scaleFactors = getTransformScaleFactors(element);

		return {
			top: rect.top,
			bottom: rect.top + rect.height / scaleFactors.y,
			left: rect.left,
			right: rect.left + rect.width / scaleFactors.x,
			width: rect.width / scaleFactors.x,
			height: rect.height / scaleFactors.y
		};
	}
}
