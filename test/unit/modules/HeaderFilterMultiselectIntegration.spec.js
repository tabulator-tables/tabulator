import TabulatorFull from "../../../src/js/core/TabulatorFull.js";

describe("Header filter - list editor with multiselect", () => {
	let table;

	// Regression tests for #4868
	// https://github.com/tabulator-tables/tabulator/issues/4868
	//
	// Selecting values in a multiselect `list` header filter only committed the
	// filter when the header filter lost focus. With live filtering enabled the
	// table is now updated as soon as an item is selected.

	const setupTable = async (columnOptions = {}) => {
		document.body.innerHTML = '<div id="test-table"></div>';

		table = new TabulatorFull("#test-table", {
			data: [
				{ id: 1, name: "John", location: "London" },
				{ id: 2, name: "Jane", location: "Paris" },
				{ id: 3, name: "Bob", location: "London" },
			],
			columns: [
				{ title: "ID", field: "id" },
				{ title: "Name", field: "name" },
				{
					title: "Location",
					field: "location",
					headerFilter: "list",
					headerFilterFunc: "in",
					headerFilterParams: { values: ["London", "Paris"], multiselect: true },
					...columnOptions,
				},
			],
		});

		await new Promise(resolve => table.on("tableBuilt", resolve));

		return table;
	};

	// Opens the popup list of the header filter and returns the rendered items.
	const openHeaderFilterList = async () => {
		const column = table.columnManager.findColumn("location");
		const input = column.modules.filter.headerElement;

		input.dispatchEvent(new Event("focus"));

		//list generation and rendering is promise based
		await new Promise(resolve => setTimeout(resolve, 0));
		await new Promise(resolve => setTimeout(resolve, 0));

		return Array.from(document.querySelectorAll(".tabulator-edit-list-item"));
	};

	const clickItem = (items, label) => {
		const item = items.find(el => el.textContent === label);

		item.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	};

	beforeEach(() => {
		//jsdom does not implement scrollIntoView, which focusing a list item uses
		Element.prototype.scrollIntoView = jest.fn();
	});

	afterEach(() => {
		if(table){
			table.destroy();
			table = null;
		}

		document.body.innerHTML = "";
	});

	it("applies the header filter as soon as an item is selected", async () => {
		await setupTable();

		const items = await openHeaderFilterList();

		clickItem(items, "London");

		//no blur has happened, the filter should already be applied
		expect(table.getHeaderFilters()).toEqual([{ field: "location", type: "in", value: ["London"] }]);

		//the filtered rows are refreshed on the next cycle
		await new Promise(resolve => setTimeout(resolve, 20));

		expect(table.getData("active").map(row => row.id)).toEqual([1, 3]);
	});

	it("applies further selections and clears the filter again", async () => {
		await setupTable();

		const items = await openHeaderFilterList();

		clickItem(items, "London");
		clickItem(items, "Paris");

		expect(table.getHeaderFilters()).toEqual([{ field: "location", type: "in", value: ["London", "Paris"] }]);

		await new Promise(resolve => setTimeout(resolve, 20));

		expect(table.getData("active").map(row => row.id)).toEqual([1, 2, 3]);

		//deselecting every item should remove the header filter again
		clickItem(items, "London");
		clickItem(items, "Paris");

		expect(table.getHeaderFilters()).toEqual([]);

		await new Promise(resolve => setTimeout(resolve, 20));

		expect(table.getData("active").map(row => row.id)).toEqual([1, 2, 3]);
	});

	it("defers the header filter until blur when live filtering is disabled", async () => {
		await setupTable({ headerFilterLiveFilter: false });

		const items = await openHeaderFilterList();

		clickItem(items, "London");

		expect(table.getHeaderFilters()).toEqual([]);

		await new Promise(resolve => setTimeout(resolve, 20));

		expect(table.getData("active").map(row => row.id)).toEqual([1, 2, 3]);
	});

	it("sends one remote request when setting an array of initial values", async () => {
		const requests = [];

		document.body.innerHTML = '<div id="test-table"></div>';

		table = new TabulatorFull("#test-table", {
			filterMode: "remote",
			ajaxURL: "http://example.com/data",
			ajaxRequestFunc: (url, config, params) => {
				requests.push(params.filter);

				return Promise.resolve([
					{ id: 1, name: "John", location: "London" },
					{ id: 2, name: "Jane", location: "Paris" },
					{ id: 3, name: "Bob", location: "London" },
				]);
			},
			columns: [
				{ title: "ID", field: "id" },
				{ title: "Name", field: "name" },
				{
					title: "Location",
					field: "location",
					headerFilter: "list",
					headerFilterFunc: "in",
					headerFilterParams: { values: ["London", "Paris", "Oslo"], multiselect: true },
				},
			],
		});

		await new Promise(resolve => table.on("tableBuilt", resolve));
		await new Promise(resolve => setTimeout(resolve, 0));

		//ignore the request made while building the table
		requests.length = 0;

		table.setHeaderFilterValue("location", ["Oslo", "London"]);

		await new Promise(resolve => setTimeout(resolve, 0));

		expect(requests).toEqual([[{ field: "location", type: "in", value: ["Oslo", "London"] }]]);
	});

	it("keeps the header filter removed when the list is closed with no selections", async () => {
		await setupTable({ headerFilterFunc: (value, rowValue) => value.includes(rowValue) });

		const items = await openHeaderFilterList();

		//the popup binds its blur handlers 100ms after it is shown
		await new Promise(resolve => setTimeout(resolve, 150));

		clickItem(items, "London");

		await new Promise(resolve => setTimeout(resolve, 20));

		expect(table.getData("active").map(row => row.id)).toEqual([1, 3]);

		clickItem(items, "London");

		expect(table.getHeaderFilters()).toEqual([]);

		//closing the list resolves the value again
		document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		expect(table.getHeaderFilters()).toEqual([]);

		await new Promise(resolve => setTimeout(resolve, 20));

		expect(table.getData("active").map(row => row.id)).toEqual([1, 2, 3]);
	});
});
