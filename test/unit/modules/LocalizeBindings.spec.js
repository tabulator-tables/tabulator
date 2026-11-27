import TabulatorFull from "../../../src/js/core/TabulatorFull.js";

// A localization binding is released when the element it updates is replaced or removed:
// https://github.com/tabulator-tables/tabulator/issues/5028
describe("Localize bindings", function(){
	let table, element;

	const data = [
		{id:1, name:"Alice", age:30, group:"a"},
		{id:2, name:"Bob", age:25, group:"a"},
		{id:3, name:"Carol", age:35, group:"b"},
		{id:4, name:"Dave", age:40, group:"b"},
		{id:5, name:"Eve", age:28, group:"c"},
		{id:6, name:"Frank", age:33, group:"c"},
	];

	const columns = [
		{title:"ID", field:"id"},
		{title:"Name", field:"name"},
	];

	const langs = {
		es:{
			groups:{
				item:"artículo",
				items:"artículos",
			},
			pagination:{
				page_title:"Mostrar página",
				all:"Todas",
				counter:{
					showing:"Mostrando",
					of:"de",
					rows:"filas",
					pages:"páginas",
				},
			},
			headerFilters:{
				columns:{
					name:"Filtrar nombre",
				},
			},
		},
		fr:{
			columns:{
				name:"Nom",
			},
		},
	};

	function buildTable(options){
		element = document.createElement("div");
		document.body.appendChild(element);

		let built = new TabulatorFull(element, Object.assign({
			data:data,
			columns:columns,
			langs:langs,
		}, options));

		return new Promise(resolve => built.on("tableBuilt", () => resolve(built)));
	}

	function count(path){
		let bindings = table.modules.localize.bindings[path];

		return bindings ? bindings.length : 0;
	}

	function countPrefix(prefix){
		return Object.keys(table.modules.localize.bindings).reduce((total, path) => {
			return path.indexOf(prefix) === 0 ? total + count(path) : total;
		}, 0);
	}

	function headerTitle(field){
		let titleElement = table.getColumn(field).getElement().querySelector(".tabulator-col-title");
		let editor = titleElement.querySelector("input");

		return editor ? editor.value : titleElement.textContent;
	}

	afterEach(function(){
		jest.useRealTimers();

		if(table){
			table.destroy();
			table = null;
		}

		if(element){
			element.remove();
			element = null;
		}
	});

	describe("Localize.bind", function(){
		test("returns a function that removes the binding", async function(){
			table = await buildTable();

			let callback = jest.fn();
			let unbind = table.modules.localize.bind("groups|item", callback);

			expect(typeof unbind).toBe("function");

			unbind();

			expect(table.modules.localize.bindings["groups|item"]).not.toContain(callback);

			callback.mockClear();
			table.setLocale("es");

			expect(callback).not.toHaveBeenCalled();
		});

		test("removes only its own binding when several are bound to a path", async function(){
			table = await buildTable();

			let first = jest.fn();
			let second = jest.fn();
			let unbindFirst = table.modules.localize.bind("groups|item", first);

			table.modules.localize.bind("groups|item", second);

			expect(typeof unbindFirst).toBe("function");

			unbindFirst();

			expect(table.modules.localize.bindings["groups|item"]).not.toContain(first);
			expect(table.modules.localize.bindings["groups|item"]).toContain(second);

			table.setLocale("es");

			expect(second).toHaveBeenLastCalledWith("artículo", table.modules.localize.lang);
		});

		test("does nothing when the returned function is called twice", async function(){
			table = await buildTable();

			let first = jest.fn();
			let second = jest.fn();
			let unbindFirst = table.modules.localize.bind("groups|item", first);

			table.modules.localize.bind("groups|item", second);

			let before = count("groups|item");

			expect(typeof unbindFirst).toBe("function");

			unbindFirst();
			unbindFirst();

			expect(count("groups|item")).toBe(before - 1);
			expect(table.modules.localize.bindings["groups|item"]).toContain(second);
		});

		test("langBind returns the function bind returns", async function(){
			table = await buildTable();

			let callback = jest.fn();
			let unbind = table.module("page").langBind("pagination|page_title", callback);

			expect(callback).toHaveBeenCalledWith("Show Page", table.modules.localize.lang);
			expect(typeof unbind).toBe("function");

			unbind();

			expect(table.modules.localize.bindings["pagination|page_title"]).not.toContain(callback);
		});
	});

	describe("pagination", function(){
		const pages = [2, 3, 4, 5, 6, 1, 2, 3, 4, 5];

		function counterText(){
			return element.querySelector(".tabulator-page-counter").textContent;
		}

		test("keeps one pagination|page_title binding per page button after page changes", async function(){
			table = await buildTable({pagination:true, paginationSize:1});

			expect(count("pagination|page_title")).toBe(5);

			for(let page of pages){
				await table.setPage(page);
			}

			expect(count("pagination|page_title")).toBe(5);

			table.setLocale("es");

			let buttons = Array.from(element.querySelectorAll(".tabulator-pages .tabulator-page"));

			expect(buttons.map(button => button.getAttribute("title"))).toEqual(["Mostrar página 2", "Mostrar página 3", "Mostrar página 4", "Mostrar página 5", "Mostrar página 6"]);
		});

		test.each([
			["rows", "Mostrando 5-5 de 6 filas"],
			["pages", "Mostrando 5 de 6 páginas"],
		])("keeps three pagination|counter bindings with the %s counter after page changes", async function(counter, text){
			table = await buildTable({pagination:true, paginationSize:1, paginationCounter:counter});

			expect(countPrefix("pagination|counter|")).toBe(3);

			for(let page of pages){
				await table.setPage(page);
			}

			expect(countPrefix("pagination|counter|")).toBe(3);

			table.setLocale("es");

			expect(counterText()).toBe(text);
		});

		test("keeps three pagination|counter bindings with no rows after the data is replaced", async function(){
			table = await buildTable({data:[], pagination:true, paginationSize:1, paginationCounter:"rows"});

			await table.setData([]);
			await table.setData([]);

			expect(countPrefix("pagination|counter|")).toBe(3);

			table.setLocale("es");

			expect(counterText()).toBe("Mostrando 0 filas");
		});

		test("a custom counter that binds once to an element it reuses still follows the locale after a page change", async function(){
			let counterElement = null;

			table = await buildTable({pagination:true, paginationSize:1, paginationCounter:function(){
				if(!counterElement){
					counterElement = document.createElement("span");

					this.langBind("pagination|counter|showing", (value) => {
						counterElement.textContent = value;
					});
				}

				return counterElement;
			}});

			await table.setPage(2);

			table.setLocale("es");

			expect(counterText()).toBe("Mostrando");
		});

		test("a custom counter that reuses the element the stock counter built still follows the locale after a page change", async function(){
			let counterElement = null;

			table = await buildTable({pagination:true, paginationSize:1, paginationCounter:function(pageSize, currentRow, currentPage, totalRows, totalPages){
				if(!counterElement){
					counterElement = this.constructor.pageCounters.rows.call(this, pageSize, currentRow, currentPage, totalRows, totalPages);
				}

				return counterElement;
			}});

			await table.setPage(2);
			await table.setPage(3);

			expect(countPrefix("pagination|counter|")).toBe(3);

			table.setLocale("es");

			expect(counterText()).toBe("Mostrando 1-1 de 6 filas");
		});

		test("a custom counter that calls the stock counter on every render but returns the element it cached first still follows the locale after a page change", async function(){
			let counterElement = null;

			table = await buildTable({pagination:true, paginationSize:1, paginationCounter:function(pageSize, currentRow, currentPage, totalRows, totalPages){
				let built = this.constructor.pageCounters.rows.call(this, pageSize, currentRow, currentPage, totalRows, totalPages);

				if(!counterElement){
					counterElement = built;
				}

				return counterElement;
			}});

			for(let page of pages){
				await table.setPage(page);
			}

			expect(countPrefix("pagination|counter|")).toBe(3);

			table.setLocale("es");

			expect(counterText()).toBe("Mostrando 1-1 de 6 filas");
		});

		test("a stock counter called directly on a table that also renders a counter keeps following the locale after a page change", async function(){
			table = await buildTable({pagination:true, paginationSize:1, paginationCounter:"rows"});

			let counter = table.module("page").constructor.pageCounters.rows.call(table.module("page"), 10, 1, 1, 100, 10);

			await table.setPage(2);

			table.setLocale("es");

			expect(counter.textContent).toBe("Mostrando 1-10 de 100 filas");
			expect(counterText()).toBe("Mostrando 2-2 de 6 filas");
		});

		test("clears the counter sink when a counter throws", async function(){
			let calls = 0;
			let error = null;

			table = await buildTable({pagination:true, paginationSize:1, paginationCounter:function(pageSize, currentRow, currentPage, totalRows, totalPages){
				calls++;

				if(calls === 2){
					throw new Error("counter failed");
				}

				return this.constructor.pageCounters.rows.call(this, pageSize, currentRow, currentPage, totalRows, totalPages);
			}});

			try{
				await table.setPage(2);
			}catch(e){
				error = e;
			}

			expect(error && error.message).toBe("counter failed");
			expect(table.module("page").pageCounterSink).toBeNull();

			let counter = table.module("page").constructor.pageCounters.rows.call(table.module("page"), 10, 1, 1, 100, 10);

			await table.setPage(3);

			table.setLocale("es");

			expect(counter.textContent).toBe("Mostrando 1-10 de 100 filas");
			expect(counterText()).toBe("Mostrando 3-3 de 6 filas");
		});

		test("a counter that triggers a redraw keeps the bindings of the element it returns", async function(){
			let redrawn = false;

			table = await buildTable({pagination:true, paginationSize:1, paginationCounter:function(pageSize, currentRow, currentPage, totalRows, totalPages){
				let counter = this.constructor.pageCounters.rows.call(this, pageSize, currentRow, currentPage, totalRows, totalPages);

				if(currentPage === 3 && !redrawn){
					redrawn = true;
					this.trigger();
				}

				return counter;
			}});

			await table.setPage(2);
			await table.setPage(3);

			expect(redrawn).toBe(true);
			expect(countPrefix("pagination|counter|")).toBe(3);

			table.setLocale("es");

			expect(counterText()).toBe("Mostrando 3-3 de 6 filas");
		});

		test("a stock counter shown in a side element in the document follows the locale after a page change", async function(){
			let side = document.createElement("div");

			document.body.appendChild(side);

			try{
				table = await buildTable({pagination:true, paginationSize:1, paginationCounter:function(pageSize, currentRow, currentPage, totalRows, totalPages){
					side.replaceChildren(this.constructor.pageCounters.pages.call(this, pageSize, currentRow, currentPage, totalRows, totalPages));

					return this.constructor.pageCounters.rows.call(this, pageSize, currentRow, currentPage, totalRows, totalPages);
				}});

				for(let page of pages){
					await table.setPage(page);
				}

				expect(countPrefix("pagination|counter|")).toBe(6);

				table.setLocale("es");

				expect(side.textContent).toBe("Mostrando 5 de 6 páginas");
				expect(counterText()).toBe("Mostrando 5-5 de 6 filas");
			}finally{
				side.remove();
			}
		});

		test.each([
			["rows", "Mostrando 5-5 de 6 filas"],
			["pages", "Mostrando 5 de 6 páginas"],
		])("keeps three pagination|counter bindings after page changes on a table attached to the document with the %s counter", async function(counter, text){
			table = await buildTable({pagination:true, paginationSize:1, paginationCounter:counter});

			expect(element.isConnected).toBe(true);

			for(let page of pages){
				await table.setPage(page);
			}

			expect(countPrefix("pagination|counter|")).toBe(3);

			table.setLocale("es");

			expect(counterText()).toBe(text);
		});

		test("a custom counter that wraps a new stock counter in the same element keeps three bindings", async function(){
			let wrapper = document.createElement("span");

			table = await buildTable({pagination:true, paginationSize:1, paginationCounter:function(pageSize, currentRow, currentPage, totalRows, totalPages){
				wrapper.replaceChildren(this.constructor.pageCounters.rows.call(this, pageSize, currentRow, currentPage, totalRows, totalPages));

				return wrapper;
			}});

			for(let page of pages){
				await table.setPage(page);
			}

			expect(countPrefix("pagination|counter|")).toBe(3);

			table.setLocale("es");

			expect(counterText()).toBe("Mostrando 5-5 de 6 filas");
		});

		test("keeps one pagination|all binding after page size changes", async function(){
			table = await buildTable({pagination:true, paginationSize:1, paginationSizeSelector:[1, 2, true]});

			expect(count("pagination|all")).toBe(1);

			await table.setPageSize(2);
			await table.setPageSize(10);
			await table.setPageSize(1);

			expect(count("pagination|all")).toBe(1);

			table.setLocale("es");

			expect(element.querySelector(".tabulator-page-size option[value='true']").textContent).toBe("Todas");
		});

		test("a rebuilt table starts at its build count", async function(){
			table = await buildTable({pagination:true, paginationSize:1});

			await table.setPage(2);
			await table.setPage(3);

			table.destroy();
			element.remove();

			table = await buildTable({pagination:true, paginationSize:1});

			expect(count("pagination|page_title")).toBe(5);
		});
	});

	describe("column titles", function(){
		test.each([
			["a plain title", [{title:"ID", field:"id"}, {title:"Name", field:"name"}]],
			["an editable title", [{title:"ID", field:"id"}, {title:"Name", field:"name", editableTitle:true}]],
			["a column group", [{title:"Person", columns:[{title:"ID", field:"id"}, {title:"Name", field:"name"}]}]],
			["a nested field", [{title:"Name", field:"name"}, {title:"City", field:"address.city"}]],
		])("keeps one title binding per column after setColumns with %s", async function(name, definitions){
			table = await buildTable({columns:definitions});

			table.setColumns(definitions);
			table.setColumns(definitions);

			expect(count("columns|name")).toBe(1);

			table.setLocale("fr");

			expect(headerTitle("name")).toBe("Nom");
		});

		test("releases the title binding of a redefined column", async function(){
			table = await buildTable();

			await table.updateColumnDefinition("name", {title:"Full name"});

			expect(count("columns|name")).toBe(1);

			table.setLocale("fr");

			expect(headerTitle("name")).toBe("Nom");
		});

		test("releases the title binding of a deleted column", async function(){
			table = await buildTable();

			await table.addColumn({title:"Age", field:"age"});

			expect(count("columns|age")).toBe(1);

			await table.deleteColumn("age");

			expect(count("columns|age")).toBe(0);
		});
	});

	describe("header filters", function(){
		const filterColumns = [
			{title:"ID", field:"id"},
			{title:"Name", field:"name", headerFilter:"input"},
		];

		function placeholder(){
			return table.getColumn("name").getElement().querySelector("input").getAttribute("placeholder");
		}

		test.each([
			["setHeaderFilterValue", () => table.setHeaderFilterValue("name", "a")],
			["reloadHeaderFilter", () => table.getColumn("name").reloadHeaderFilter()],
			["clearHeaderFilter", () => table.clearHeaderFilter()],
		])("keeps one header filter binding after the filter is rebuilt by %s", async function(name, rebuild){
			table = await buildTable({columns:filterColumns});

			rebuild();
			rebuild();

			expect(count("headerFilters|columns|name")).toBe(1);

			table.setLocale("es");

			expect(placeholder()).toBe("Filtrar nombre");
		});

		test("keeps one header filter binding per column after setColumns, and none after deleteColumn", async function(){
			table = await buildTable({columns:filterColumns});

			table.setColumns(filterColumns);
			table.setColumns(filterColumns);

			expect(count("headerFilters|columns|name")).toBe(1);

			table.setLocale("es");

			expect(placeholder()).toBe("Filtrar nombre");

			await table.deleteColumn("name");

			expect(count("headerFilters|columns|name")).toBe(0);
		});
	});

	describe("header tooltips", function(){
		test("releases a header tooltip's binding when the tooltip closes", async function(){
			table = await buildTable({columns:[{title:"ID", field:"id"}, {title:"Name", field:"name", headerTooltip:true}]});

			jest.useFakeTimers();

			let header = table.getColumn("name").getElement();

			for(let i = 0; i < 10; i++){
				header.dispatchEvent(new MouseEvent("mousemove", {bubbles:true}));
				jest.advanceTimersByTime(table.options.tooltipDelay);

				expect(count("columns|name")).toBe(2);
			}

			table.setLocale("fr");

			expect(document.body.querySelector(".tabulator-tooltip").textContent).toBe("Nom");

			header.dispatchEvent(new MouseEvent("mousemove", {bubbles:true}));

			expect(count("columns|name")).toBe(1);
		});
	});

	describe("group rows", function(){
		test.each([
			["setGroupBy", () => table.setGroupBy("group")],
			["setGroupValues", () => table.setGroupValues([["a", "b", "c"]])],
			["setGroupStartOpen", () => table.setGroupStartOpen(false)],
		])("keeps one groups|item binding after the grouping is reconfigured by %s", async function(name, reconfigure){
			table = await buildTable({groupBy:"group"});

			reconfigure();
			reconfigure();

			expect(count("groups|item")).toBe(1);
		});

		test("leaves no groups|item binding with a custom header and one again without", async function(){
			table = await buildTable({groupBy:"group"});

			table.setGroupHeader((value) => value);

			expect(count("groups|item")).toBe(0);

			table.setGroupHeader(false);

			expect(count("groups|item")).toBe(1);
		});
	});

	describe("collapsed rows", function(){
		// jsdom reports every element as 0x0, so rows are never rendered and no column is
		// collapsed. Give elements a size for this block: the table, 0 wide, collapses "name".
		const sizedElement = {configurable:true, get(){ return 20; }};
		let originalWidth, originalHeight;

		beforeAll(function(){
			originalWidth = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "offsetWidth");
			originalHeight = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "offsetHeight");

			Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", sizedElement);
			Object.defineProperty(window.HTMLElement.prototype, "offsetHeight", sizedElement);
		});

		afterAll(function(){
			if(originalWidth){
				Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", originalWidth);
			}

			if(originalHeight){
				Object.defineProperty(window.HTMLElement.prototype, "offsetHeight", originalHeight);
			}
		});

		async function buildCollapsed(){
			table = await buildTable({
				renderVertical:"basic",
				responsiveLayout:"collapse",
				data:data.slice(0, 3),
				columns:[{title:"ID", field:"id", responsive:0}, {title:"Name", field:"name"}],
			});

			expect(table.modules.responsiveLayout.hiddenColumns.map(column => column.field)).toEqual(["name"]);

			// one for the header title, one per collapsed row
			expect(count("columns|name")).toBe(4);
		}

		function collapsedTitles(){
			return table.getRows().map(row => row.getElement().querySelector(".tabulator-responsive-collapse strong").textContent);
		}

		test("collapsed row titles keep one binding per hidden column after a row update", async function(){
			await buildCollapsed();

			await table.updateData([{id:1, name:"Alicia"}]);
			await table.updateData([{id:1, name:"Alice"}]);

			expect(count("columns|name")).toBe(4);

			table.setLocale("fr");

			expect(collapsedTitles()).toEqual(["Nom", "Nom", "Nom"]);
		});

		test("collapsed row titles are released when the data is replaced", async function(){
			await buildCollapsed();

			await table.setData(data.slice(3, 6));
			await table.setData(data.slice(0, 3));

			expect(count("columns|name")).toBe(4);

			table.setLocale("fr");

			expect(collapsedTitles()).toEqual(["Nom", "Nom", "Nom"]);
		});
	});
});
