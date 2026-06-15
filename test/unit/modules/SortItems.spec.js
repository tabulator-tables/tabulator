import Sort from "../../../src/js/modules/Sort/Sort";
import numberSorter from "../../../src/js/modules/Sort/defaults/sorters/number";
import stringSorter from "../../../src/js/modules/Sort/defaults/sorters/string";

// Correctness coverage for Sort._sortItems decorate-sort-undecorate rewrite.
// Validates ordering + stability against a reference implementation of the stock
// per-comparison algorithm. Standalone (no TabulatorFull/luxon) so it runs in the
// unit environment.

const ctx = {}; // sorter `this`; number/string sorters do not use it here

const numParams = { alignEmptyValues: undefined, decimalSeparator: undefined, thousandSeparator: undefined };
const strParams = { alignEmptyValues: undefined, locale: false };

function makeColumn(field, sorter, params) {
	return {
		field,
		_comp: null,
		getFieldValue(data) { return data[field]; },
		getComponent() { return (this._comp ||= { _col: field }); },
		modules: { sort: { sorter, params } },
	};
}

function makeRow(data) {
	return { data, _comp: null, getData() { return this.data; }, getComponent() { return (this._comp ||= { _row: this.data }); } };
}

// Reference: the stock per-comparison algorithm (matches HEAD _sortItems/_sortRow).
function referenceSort(data, sortList) {
	const sorterCount = sortList.length - 1;
	return data.slice().sort((a, b) => {
		let result;
		for (let i = sorterCount; i >= 0; i--) {
			const s = sortList[i];
			const el1 = s.dir === "asc" ? a : b;
			const el2 = s.dir === "asc" ? b : a;
			let av = s.column.getFieldValue(el1.getData());
			let bv = s.column.getFieldValue(el2.getData());
			av = typeof av !== "undefined" ? av : "";
			bv = typeof bv !== "undefined" ? bv : "";
			result = s.column.modules.sort.sorter.call(ctx, av, bv, el1.getComponent(), el2.getComponent(), s.column.getComponent(), s.dir, s.params);
			if (result !== 0) break;
		}
		return result;
	});
}

function runSort(data, sortList) {
	const copy = data.slice();
	Sort.prototype._sortItems.call(ctx, copy, sortList);
	return copy;
}

describe("Sort._sortItems (decorate-sort-undecorate)", () => {
	test("single numeric column ascending", () => {
		const col = makeColumn("a", numberSorter, numParams);
		const rows = [makeRow({ a: 3 }), makeRow({ a: 1 }), makeRow({ a: 2 })];
		const out = runSort(rows, [{ column: col, dir: "asc", params: numParams }]);
		expect(out.map((r) => r.data.a)).toEqual([1, 2, 3]);
	});

	test("single numeric column descending", () => {
		const col = makeColumn("a", numberSorter, numParams);
		const rows = [makeRow({ a: 3 }), makeRow({ a: 1 }), makeRow({ a: 2 })];
		const out = runSort(rows, [{ column: col, dir: "desc", params: numParams }]);
		expect(out.map((r) => r.data.a)).toEqual([3, 2, 1]);
	});

	test("mutates the array in place (same reference)", () => {
		const col = makeColumn("a", numberSorter, numParams);
		const rows = [makeRow({ a: 2 }), makeRow({ a: 1 })];
		const ref = rows;
		Sort.prototype._sortItems.call(ctx, rows, [{ column: col, dir: "asc", params: numParams }]);
		expect(rows).toBe(ref);
		expect(rows.map((r) => r.data.a)).toEqual([1, 2]);
	});

	test("multi-column: primary (last in list) then tie-break", () => {
		const colA = makeColumn("a", numberSorter, numParams);
		const colB = makeColumn("b", numberSorter, numParams);
		const rows = [
			makeRow({ a: 2, b: 1 }), makeRow({ a: 1, b: 2 }), makeRow({ a: 1, b: 1 }), makeRow({ a: 2, b: 2 }),
		];
		const sortList = [
			{ column: colB, dir: "asc", params: numParams }, // tie-break (checked first in loop)
			{ column: colA, dir: "asc", params: numParams }, // primary (checked last)
		];
		const out = runSort(rows, sortList);
		expect(out.map((r) => [r.data.a, r.data.b])).toEqual(referenceSort(rows, sortList).map((r) => [r.data.a, r.data.b]));
	});

	test("stability: equal keys preserve original order", () => {
		const col = makeColumn("a", numberSorter, numParams);
		const rows = [makeRow({ a: 1, id: "x" }), makeRow({ a: 1, id: "y" }), makeRow({ a: 1, id: "z" })];
		const out = runSort(rows, [{ column: col, dir: "asc", params: numParams }]);
		expect(out.map((r) => r.data.id)).toEqual(["x", "y", "z"]);
	});

	test("matches reference over randomized multi-column (numeric + string, asc + desc)", () => {
		const colA = makeColumn("a", numberSorter, numParams);
		const colName = makeColumn("name", stringSorter, strParams);
		const sortList = [
			{ column: colName, dir: "desc", params: strParams },
			{ column: colA, dir: "asc", params: numParams },
		];
		let seed = 99;
		const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
		for (let trial = 0; trial < 50; trial++) {
			const rows = [];
			for (let i = 0; i < 200; i++) rows.push(makeRow({ a: Math.floor(rnd() * 5), name: "n" + Math.floor(rnd() * 5), id: i }));
			const expected = referenceSort(rows, sortList).map((r) => r.data.id);
			const actual = runSort(rows, sortList).map((r) => r.data.id);
			expect(actual).toEqual(expected);
		}
	});

	test("undefined field values are coerced to empty string (as stock)", () => {
		const col = makeColumn("a", numberSorter, numParams);
		const rows = [makeRow({ a: 5 }), makeRow({}), makeRow({ a: 2 })];
		const out = runSort(rows, [{ column: col, dir: "asc", params: numParams }]);
		expect(out.map((r) => r.data.a)).toEqual(referenceSort(rows, [{ column: col, dir: "asc", params: numParams }]).map((r) => r.data.a));
	});
});
