import TabulatorFull from "../../../src/js/core/TabulatorFull.js";

// A custom groupHeader survives a locale change:
// https://github.com/tabulator-tables/tabulator/issues/4720
describe("GroupRows header and locale", function(){
	let table, element;

	const data = [
		{id:1, name:"Alice", group:"a", sub:"x"},
		{id:2, name:"Bob", group:"a", sub:"y"},
		{id:3, name:"Carol", group:"b", sub:"x"},
	];

	const langs = {
		es:{
			groups:{
				item:"artículo",
				items:"artículos",
			},
		},
	};

	// jsdom reports every element as 0x0, so Helpers.elVisible() returns false and no group
	// header is rendered. Give elements a size for the duration of this file.
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

	function custom(value, count){
		return value + " has " + count;
	}

	function buildTable(options){
		element = document.createElement("div");
		document.body.appendChild(element);

		let built = new TabulatorFull(element, Object.assign({
			data:data,
			columns:[{title:"Name", field:"name"}],
			groupBy:"group",
			langs:langs,
		}, options));

		return new Promise(resolve => built.on("tableBuilt", () => resolve(built)));
	}

	function headerTexts(groups){
		return groups.map(group => group.getElement().textContent);
	}

	afterEach(function(){
		if(table){
			table.destroy();
			table = null;
		}

		if(element){
			element.remove();
			element = null;
		}
	});

	test.each([
		["a function", () => custom],
		["an array", () => [custom]],
	])("keeps a custom groupHeader given as %s after setLocale and a regroup", async function(name, groupHeader){
		table = await buildTable({groupHeader:groupHeader()});

		table.setLocale("es");
		await table.setData(data);

		expect(headerTexts(table.getGroups())).toEqual(["a has 2", "b has 1"]);
	});

	test("does not write to the groupHeader array passed in", async function(){
		let headers = [custom];

		table = await buildTable({groupHeader:headers});

		table.setLocale("es");

		expect(headers).toEqual([custom]);
		expect(headers[0]).toBe(custom);
	});

	test("keeps both levels of a nested custom groupHeader", async function(){
		function inner(value, count){
			return "sub " + value + " has " + count;
		}

		table = await buildTable({groupBy:["group", "sub"], groupHeader:[custom, inner]});

		table.setLocale("es");
		await table.setData(data);

		let groups = table.getGroups();

		expect(headerTexts(groups)).toEqual(["a has 2", "b has 1"]);
		expect(headerTexts(groups[0].getSubGroups())).toEqual(["sub x has 1", "sub y has 1"]);
	});

	test("the default group header follows the locale after a regroup", async function(){
		table = await buildTable();

		table.setLocale("es");
		await table.setData(data);

		expect(headerTexts(table.getGroups())).toEqual(["a(2 artículos)", "b(1 artículo)"]);
	});

	test("setGroupHeader(false) after a custom header restores the default, which follows the locale", async function(){
		table = await buildTable({groupHeader:custom});

		table.setGroupHeader(false);
		table.setLocale("es");
		await table.setData(data);

		expect(headerTexts(table.getGroups())).toEqual(["a(2 artículos)", "b(1 artículo)"]);
	});
});
