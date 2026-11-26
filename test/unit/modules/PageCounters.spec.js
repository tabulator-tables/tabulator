import TabulatorFull from '../../../src/js/core/TabulatorFull.js';
import Page from '../../../src/js/modules/Page/Page.js';
import pageCounters from '../../../src/js/modules/Page/defaults/pageCounters.js';

describe('Page counter defaults', function(){
	let table, element;

	const tableData = Array(100).fill().map((_, index) => ({
		id:index + 1,
		name:`Name ${index + 1}`
	}));

	const columns = [
		{title:"ID", field:"id"},
		{title:"Name", field:"name"}
	];

	const langs = {
		es:{
			pagination:{
				counter:{
					showing:"Mostrando",
					of:"de",
					rows:"filas",
					pages:"páginas"
				}
			}
		}
	};

	function buildTable(options){
		element = document.createElement("div");
		document.body.appendChild(element);

		let built = new TabulatorFull(element, Object.assign({
			data:tableData,
			columns:columns,
			pagination:true,
			paginationSize:10,
			langs:langs
		}, options));

		return new Promise(resolve => built.on("tableBuilt", () => resolve(built)));
	}

	function parts(counterElement){
		return Array.from(counterElement.children).map(child => child.innerHTML);
	}

	function counterText(){
		return element.querySelector(".tabulator-page-counter").textContent;
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

	test('registers the counters "rows" and "pages" on the Page module', function(){
		expect(Object.keys(pageCounters)).toEqual(["rows", "pages"]);
		expect(Page.pageCounters).toBe(pageCounters);
	});

	describe('counter "rows"', function(){
		let rows = pageCounters.rows;

		test('builds a span of five parts: showing, the row range, of, the total, rows', async function(){
			table = await buildTable();

			let counter = rows.call(table.module("page"), 10, 1, 1, 100, 10);

			expect(counter.tagName).toBe("SPAN");
			expect(parts(counter)).toEqual(["Showing", " 1-10 ", "of", " 100 ", "rows"]);
		});

		test('caps the range at the total on a last page shorter than the page size', async function(){
			table = await buildTable();

			let counter = rows.call(table.module("page"), 20, 101, 6, 110, 6);

			expect(parts(counter)).toEqual(["Showing", " 101-110 ", "of", " 110 ", "rows"]);
		});

		test('shows the whole range on a single page', async function(){
			table = await buildTable();

			let counter = rows.call(table.module("page"), 10, 1, 1, 10, 1);

			expect(parts(counter)).toEqual(["Showing", " 1-10 ", "of", " 10 ", "rows"]);
		});

		test('shows 0 and no "of" part when there are no rows', async function(){
			table = await buildTable();

			let counter = rows.call(table.module("page"), 0, 0, 1, 0, 1);

			expect(parts(counter)).toEqual(["Showing", " 0 ", "rows"]);
		});

		test('updates its localized parts when the locale changes', async function(){
			table = await buildTable();

			let counter = rows.call(table.module("page"), 10, 1, 1, 100, 10);

			table.setLocale("es");

			expect(parts(counter)).toEqual(["Mostrando", " 1-10 ", "de", " 100 ", "filas"]);
		});
	});

	describe('counter "pages"', function(){
		let pages = pageCounters.pages;

		test('builds a span of five parts: showing, the page, of, the page count, pages', async function(){
			table = await buildTable();

			let counter = pages.call(table.module("page"), 10, 1, 1, 100, 10);

			expect(counter.tagName).toBe("SPAN");
			expect(parts(counter)).toEqual(["Showing", " 1 ", "of", " 10 ", "pages"]);
		});

		test('shows the last page of the count', async function(){
			table = await buildTable();

			let counter = pages.call(table.module("page"), 20, 101, 6, 110, 6);

			expect(parts(counter)).toEqual(["Showing", " 6 ", "of", " 6 ", "pages"]);
		});

		test('keeps all five parts when there are no rows', async function(){
			table = await buildTable();

			let counter = pages.call(table.module("page"), 0, 0, 1, 0, 1);

			expect(parts(counter)).toEqual(["Showing", " 1 ", "of", " 1 ", "pages"]);
		});

		test('updates its localized parts when the locale changes', async function(){
			table = await buildTable();

			let counter = pages.call(table.module("page"), 10, 1, 1, 100, 10);

			table.setLocale("es");

			expect(parts(counter)).toEqual(["Mostrando", " 1 ", "de", " 10 ", "páginas"]);
		});
	});

	describe('paginationCounter', function(){
		test('"rows" shows the range of the current page in the footer', async function(){
			table = await buildTable({paginationCounter:"rows"});

			expect(counterText()).toBe("Showing 1-10 of 100 rows");

			await table.setPage(10);

			expect(counterText()).toBe("Showing 91-100 of 100 rows");
		});

		test('"pages" shows the current page and the page count in the footer', async function(){
			table = await buildTable({paginationCounter:"pages"});

			expect(counterText()).toBe("Showing 1 of 10 pages");

			await table.setPage(3);

			expect(counterText()).toBe("Showing 3 of 10 pages");
		});

		test('"rows" and "pages" with no data', async function(){
			table = await buildTable({paginationCounter:"rows", data:[]});

			expect(counterText()).toBe("Showing 0 rows");

			table.destroy();
			element.remove();

			table = await buildTable({paginationCounter:"pages", data:[]});

			expect(counterText()).toBe("Showing 1 of 1 pages");
		});

		test('follows a locale change', async function(){
			table = await buildTable({paginationCounter:"rows"});

			table.setLocale("es");

			expect(counterText()).toBe("Mostrando 1-10 de 100 filas");
		});

		test('uses the table locale from the start', async function(){
			table = await buildTable({paginationCounter:"pages", locale:"es"});

			expect(counterText()).toBe("Mostrando 1 de 10 páginas");
		});
	});
});
