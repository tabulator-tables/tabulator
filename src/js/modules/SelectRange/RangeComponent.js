export default class RangeComponent {
	constructor(range) {
		this._range = range;

		return new Proxy(this, {
			get: function (target, name, receiver) {
				if (typeof target[name] !== "undefined") {
					return target[name];
				} else {
					return target._range.table.componentFunctionBinder.handle("range", target._range, name);
				}
			},
		});
	}

	getElement() {
		return this._range.element;
	}

	getData() {
		return this._range.getData();
	}

	getCells() {
		return this._range.getCells(true, true);
	}

	getModifiedCells() {
		return this._range.modifiedCells;
	}

	getStructuredCells() {
		return this._range.getStructuredCells();
	}

	getRows() {
		return this._range.getRows().map((row) => row.getComponent());
	}

	getColumns() {
		return this._range.getColumns().map((column) => column.getComponent());
	}
	
	getBounds() {
		return this._range.getBounds();
	}

	getTopEdge() {
		return this._range.rect.top;
	}

	getBottomEdge() {
		return this._range.rect.bottom;
	}

	getLeftEdge() {
		return this._range.rect.left;
	}

	getRightEdge() {
		return this._range.rect.right;
	}

	setBounds(start, end){
		if(this._range.destroyedGuard("setBounds")){
			this._range.setBounds(start ? start._cell : start, end ? end._cell : end);
		}
	}

	setStartBound(start){
		if(this._range.destroyedGuard("setStartBound")){
			this._range.setEndBound(start ? start._cell : start);
			this._range.rangeManager.layoutElement();
		}
	}

	setEndBound(end){
		if(this._range.destroyedGuard("setEndBound")){
			this._range.setEndBound(end ? end._cell : end);
			this._range.rangeManager.layoutElement();
		}
	}

	clearValues(){
		if(this._range.destroyedGuard("clearValues")){
			this._range.clearValues();
		}
	}

	setData(data){
		if(this._range.destroyedGuard("setData")){
			this._range.setData(data);
		}
	}

	fill(value){
		if(this._range.destroyedGuard("fill")){
			this._range.fill(value);
		}
	}

	remove(){
		if(this._range.destroyedGuard("remove")){
			this._range.destroy(true);
		}
	}
}
