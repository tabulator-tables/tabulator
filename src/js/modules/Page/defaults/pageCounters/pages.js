export default function(pageSize, currentRow, currentPage, totalRows, totalPages){

	var el = document.createElement("span"),
	showingEl = document.createElement("span"),
	valueEl = document.createElement("span"),
	ofEl = document.createElement("span"),
	totalEl = document.createElement("span"),
	rowsEl = document.createElement("span"),
	bindings = [];
	
	//the Page module releases these bindings once the element is no longer shown
	// https://github.com/tabulator-tables/tabulator/issues/5028
	bindings.push(this.table.modules.localize.langBind("pagination|counter|showing", (value) => {
		showingEl.innerHTML = value;
	}));
	
	valueEl.innerHTML = " " + currentPage + " ";
	
	bindings.push(this.table.modules.localize.langBind("pagination|counter|of", (value) => {
		ofEl.innerHTML = value;
	}));
	
	totalEl.innerHTML = " " + totalPages + " ";
	
	bindings.push(this.table.modules.localize.langBind("pagination|counter|pages", (value) => {
		rowsEl.innerHTML = value;
	}));
	
	el.appendChild(showingEl);
	el.appendChild(valueEl);
	el.appendChild(ofEl);
	el.appendChild(totalEl);
	el.appendChild(rowsEl);
	
	// https://github.com/tabulator-tables/tabulator/issues/5028
	if(this.pageCounterSink){
		this.pageCounterSink.set(el, bindings);
	}
	
	return el;
}