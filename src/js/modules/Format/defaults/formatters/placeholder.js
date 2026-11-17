export default function(cell, formatterParams, onRendered){
	var placeholder;

	if(formatterParams){
		if(typeof formatterParams === "object" && !(formatterParams instanceof Node)){
			placeholder = typeof formatterParams.placeholder !== "undefined" ? formatterParams.placeholder : formatterParams.value;
		}else{
			placeholder = formatterParams;
		}
	}

	if(typeof placeholder === "undefined"){
		var col = cell.getColumn ? cell.getColumn()._column : (cell.column || null);
		if(col && this && this.getPlaceholder){
			placeholder = this.getPlaceholder(col);
		}
	}

	if(typeof placeholder === "undefined"){
		placeholder = cell.getValue();
	}

	if(this && this.formatPlaceholder){
		return this.formatPlaceholder(cell, placeholder, onRendered);
	}else{
		var el = cell.getElement ? cell.getElement() : cell.element;

		if(el && el.classList){
			el.classList.add("tabulator-cell-placeholder");
		}

		if(typeof placeholder === "function"){
			placeholder = placeholder.call(this, cell, onRendered);
		}

		return placeholder;
	}
}
