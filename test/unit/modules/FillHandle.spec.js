import FillHandle from "../../../src/js/modules/SelectRange/FillHandle";
import Rect from "../../../src/js/core/tools/Rect";

class FakeColumn {
	constructor(field, editable) {
		this.field = field;
		this.editable = editable;
	}

	getField() {
		return this.field;
	}
}

class FakeCell {
	constructor(row, column) {
		this.row = row;
		this.column = column;
	}
}

class FakeRow {
	constructor(data) {
		this.data = data;
	}

	getCell(column) {
		return new FakeCell(this, column);
	}

	getData() {
		return this.data;
	}
}

function createFillHandle() {
	const rows = [
		new FakeRow({ id: 1, name: "A", age: 1 }),
		new FakeRow({ id: 2, name: "B", age: 2 }),
		new FakeRow({ id: 3, name: "C", age: 3 }),
		new FakeRow({ id: 4, name: "D", age: 4 }),
		new FakeRow({ id: 5, name: "E", age: 5 }),
	];
	const columns = [
		new FakeColumn("id", false),
		new FakeColumn("name", true),
		new FakeColumn("age", true),
	];

	const table = {
		eventBus: { subscribe: jest.fn() },
		modules: {
			edit: { allowEdit: jest.fn((cell) => cell.column.editable) },
		},
	};

	const rangeManager = {
		getTableRows: jest.fn(() => rows),
		getTableColumns: jest.fn(() => columns),
	};

	return new FillHandle(table, rangeManager);
}

describe("FillHandle", () => {
	// Source for the extendAlongAxis tests: rows 2-3, columns 2-3.
	const source = new Rect(2, 3, 2, 3);

	test("extendAlongAxis stays the source when the pointer is inside it", () => {
		expect(FillHandle.extendAlongAxis(source, 3, 2)).toEqual(
			new Rect(2, 3, 2, 3),
		);
	});

	test("extendAlongAxis grows down to the pointer row", () => {
		expect(FillHandle.extendAlongAxis(source, 6, 3)).toEqual(
			new Rect(2, 6, 2, 3),
		);
	});

	test("extendAlongAxis grows up to the pointer row", () => {
		expect(FillHandle.extendAlongAxis(source, 0, 2)).toEqual(
			new Rect(0, 3, 2, 3),
		);
	});

	test("extendAlongAxis grows right to the pointer column", () => {
		expect(FillHandle.extendAlongAxis(source, 2, 5)).toEqual(
			new Rect(2, 3, 2, 5),
		);
	});

	test("extendAlongAxis grows left to the pointer column", () => {
		expect(FillHandle.extendAlongAxis(source, 3, 0)).toEqual(
			new Rect(2, 3, 0, 3),
		);
	});

	test("extendAlongAxis grows only along rows when the pointer is further out by row", () => {
		expect(FillHandle.extendAlongAxis(source, 6, 5)).toEqual(
			new Rect(2, 6, 2, 3),
		);
	});

	test("extendAlongAxis grows only along columns when the pointer is further out by column", () => {
		expect(FillHandle.extendAlongAxis(source, 4, 7)).toEqual(
			new Rect(2, 3, 2, 7),
		);
	});

	test("extendAlongAxis prefers rows when the pointer is equally far out on both axes", () => {
		expect(FillHandle.extendAlongAxis(source, 5, 5)).toEqual(
			new Rect(2, 5, 2, 3),
		);
	});

	test("buildFillData copies the source value into every target cell", () => {
		const fillHandle = createFillHandle();

		expect(fillHandle.buildFillData(new Rect(1, 1, 1, 1), 3, 1)).toEqual([
			["B"],
			["B"],
			["B"],
		]);
	});

	test("buildFillData repeats a multi-cell selection when filling upwards, continuing the pattern backwards", () => {
		const fillHandle = createFillHandle();

		expect(fillHandle.buildFillData(new Rect(3, 4, 2, 2), 0, 2)).toEqual([
			[5],
			[4],
			[5],
			[4],
			[5],
		]);
	});

	test("buildFillData returns the source values when the pointer stays in the source", () => {
		const fillHandle = createFillHandle();

		expect(fillHandle.buildFillData(new Rect(1, 2, 1, 1), 2, 1)).toEqual([
			["B"],
			["C"],
		]);
	});
});
