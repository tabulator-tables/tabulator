import TabulatorFull from "../../../src/js/core/TabulatorFull";
import SelectRange from "../../../src/js/modules/SelectRange/SelectRange";

describe("SelectRange module", () => {
	/** @type {TabulatorFull} */
	let tabulator;
	/** @type {SelectRange} */
	let selectRangeMod;
	let tableData = [
		{ id: 1, name: "John", age: 30, position: "Manager" },
		{ id: 2, name: "Jane", age: 25, position: "Developer" },
		{ id: 3, name: "Bob", age: 35, position: "Designer" }
	];
	let tableColumns = [
		{ title: "ID", field: "id" },
		{ title: "Name", field: "name" },
		{ title: "Age", field: "age" },
		{ title: "Position", field: "position" }
	];

	beforeEach(async () => {
		const el = document.createElement("div");
		el.id = "tabulator";
		document.body.appendChild(el);
		tabulator = new TabulatorFull("#tabulator", {
			data: tableData,
			columns: tableColumns,
			selectableRange: true,
		});
		selectRangeMod = tabulator.module("selectRange");
		return new Promise((resolve) => {
			tabulator.on("tableBuilt", () => {
				resolve();
			});
		});
	});

	afterEach(() => {
		tabulator.destroy();
		document.getElementById("tabulator")?.remove();
	});

	it("should have one range initially at the top left", () => {
		const range = selectRangeMod.getRanges()[0]._range;
		expect(range.rect.top).toBe(0);
		expect(range.rect.left).toBe(0);
		expect(range.rect.bottom).toBe(0);
		expect(range.rect.right).toBe(0);
	});

	it("should add a new range when addRange is called", () => {
		const initialRangesCount = selectRangeMod.getRanges().length;
		selectRangeMod.addRange();
		expect(selectRangeMod.getRanges().length).toBe(initialRangesCount + 1);
	});

	it("should reset ranges when resetRanges is called", () => {
		// Add multiple ranges
		selectRangeMod.addRange();
		selectRangeMod.addRange();

		// Reset ranges
		const resetRange = selectRangeMod.resetRanges();

		// Should have only one range after reset
		expect(selectRangeMod.getRanges().length).toBe(1);
		expect(resetRange).toBe(selectRangeMod.getRanges()[0]._range);
	});

	it("should have correct structure in RangeComponent", () => {
		const rangeComponent = selectRangeMod.getRanges()[0];

		// Test component properties
		expect(rangeComponent._range).toBeDefined();
		expect(typeof rangeComponent.getElement).toBe("function");
		expect(typeof rangeComponent.getData).toBe("function");
		expect(typeof rangeComponent.getCells).toBe("function");
		expect(typeof rangeComponent.getRows).toBe("function");
		expect(typeof rangeComponent.getColumns).toBe("function");
	});

	it("should have correct min/max values", () => {
		const range = selectRangeMod.getRanges()[0]._range;

		// The min/max values should match the start/end values after they're set
		range.setStart(1, 2);
		range.setEnd(3, 4);

		expect(range.rect.top).toBe(1);
		expect(range.rect.bottom).toBe(3);
		expect(range.rect.left).toBe(2);
		expect(range.rect.right).toBe(4);
	});

	it("should handle Range setStart and setEnd", () => {
		const range = selectRangeMod.getRanges()[0]._range;

		// Initial values
		expect(range.start.row).toBeUndefined();
		expect(range.start.col).toBeUndefined();
		expect(range.end.row).toBeUndefined();
		expect(range.end.col).toBeUndefined();

		// Set start
		range.setStart(1, 2);
		expect(range.start.row).toBe(1);
		expect(range.start.col).toBe(2);

		// Set end
		range.setEnd(3, 4);
		expect(range.end.row).toBe(3);
		expect(range.end.col).toBe(4);
	});

	it("should detect overlaps correctly", () => {
		const range = selectRangeMod.getRanges()[0]._range;

		// Setup range bounds
		range.rect.top = 1;
		range.rect.bottom = 3;
		range.rect.left = 2;
		range.rect.right = 4;

		// Test overlapping case
		expect(range.overlaps(1, 1, 5, 5)).toBe(true);
		expect(range.overlaps(3, 3, 5, 5)).toBe(true);

		// Test non-overlapping cases
		expect(range.overlaps(5, 5, 7, 7)).toBe(false);
		expect(range.overlaps(0, 0, 0, 0)).toBe(false);
	});

	it("should handle destroyedGuard", () => {
		const range = selectRangeMod.getRanges()[0]._range;

		// Should return true when not destroyed
		expect(range.destroyedGuard("testFunction")).toBe(true);

		// Test warning message when destroyed
		const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
		range.destroyed = true;
		expect(range.destroyedGuard("testFunction")).toBe(false);
		expect(consoleWarnSpy).toHaveBeenCalled();

		// Clean up
		consoleWarnSpy.mockRestore();
	});
});

describe("SelectRange with cell editing", () => {
	/** @type {TabulatorFull} */
	let tabulator;
	let offsetSpies;

	beforeAll(() => {
		// jsdom computes no layout, so Tabulator's visibility check would skip
		// rendering the table body, leaving cells detached from the document,
		// which would stop mouse events from bubbling to the table element and
		// stop the editor input from receiving focus
		offsetSpies = [
			jest.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(30),
			jest.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(100),
		];
	});

	afterAll(() => {
		offsetSpies.forEach((spy) => spy.mockRestore());
	});

	beforeEach(async () => {
		const el = document.createElement("div");
		el.id = "select-range-edit-test";
		document.body.appendChild(el);
		tabulator = new TabulatorFull("#select-range-edit-test", {
			data: [
				{ id: 1, name: "John", age: 30 },
				{ id: 2, name: "Jane", age: 25 }
			],
			columns: [
				{ title: "ID", field: "id" },
				{ title: "Name", field: "name", editor: "input" },
				{ title: "Age", field: "age" }
			],
			selectableRange: true,
			renderVertical: "basic"
		});

		return new Promise((resolve) => {
			tabulator.on("renderComplete", () => {
				resolve();
			});
		});
	});

	afterEach(() => {
		tabulator.destroy();
		document.getElementById("select-range-edit-test")?.remove();
	});

	// https://github.com/tabulator-tables/tabulator/issues/4563
	it("should keep the editor open when the editor input is clicked", () => {
		const cell = tabulator.getRows()[0].getCells()[1];
		const editMod = tabulator.module("edit");

		cell.edit(true);
		expect(editMod.currentCell).toBeTruthy();

		const input = cell.getElement().querySelector("input");
		expect(input).toBeTruthy();

		// clicking inside the editor to place the caret must not start a range
		// selection, the focus transfer that follows would blur and close the editor
		input.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
		input.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
		input.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		expect(editMod.currentCell).toBeTruthy();
		expect(cell.getElement().classList.contains("tabulator-editing")).toBe(true);
		expect(cell.getElement().querySelector("input")).toBeTruthy();
	});

	// https://github.com/tabulator-tables/tabulator/issues/4563
	it("should still close the editor when another cell is pressed", () => {
		const cell = tabulator.getRows()[0].getCells()[1];
		const otherCell = tabulator.getRows()[1].getCells()[2];
		const editMod = tabulator.module("edit");

		cell.edit(true);
		expect(editMod.currentCell).toBeTruthy();

		// pressing outside the edited cell starts a new range selection, whose
		// focus transfer blurs the editor input and commits the edit
		otherCell.getElement().dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

		expect(editMod.currentCell).toBeFalsy();
		expect(cell.getElement().querySelector("input")).toBeNull();
	});
});

// https://github.com/tabulator-tables/tabulator/issues/5000
describe("SelectRange overlay layout scheduling", () => {
	/** @type {TabulatorFull} */
	let tabulator;
	/** @type {SelectRange} */
	let selectRangeMod;
	let offsetSpies;
	let frames;
	let frameSpies;

	const runFrames = () => frames.splice(0).forEach((callback) => callback());
	const dispatch = (...args) => tabulator.eventBus.dispatch(...args);

	beforeAll(() => {
		// Without layout Tabulator would skip rendering the table body
		offsetSpies = [
			jest
				.spyOn(HTMLElement.prototype, "offsetHeight", "get")
				.mockReturnValue(30),
			jest
				.spyOn(HTMLElement.prototype, "offsetWidth", "get")
				.mockReturnValue(100),
		];
	});

	afterAll(() => {
		offsetSpies.forEach((spy) => spy.mockRestore());
	});

	beforeEach(async () => {
		frames = [];
		frameSpies = [
			jest
				.spyOn(window, "requestAnimationFrame")
				.mockImplementation((callback) => frames.push(callback)),
			jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {}),
		];

		const el = document.createElement("div");
		el.id = "select-range-layout-test";
		document.body.appendChild(el);

		tabulator = new TabulatorFull("#select-range-layout-test", {
			data: [
				{ id: 1, name: "John" },
				{ id: 2, name: "Jane" },
			],
			columns: [
				{ title: "ID", field: "id" },
				{ title: "Name", field: "name" },
			],
			selectableRange: true,
			renderVertical: "basic",
		});
		selectRangeMod = tabulator.module("selectRange");

		await new Promise((resolve) => tabulator.on("tableBuilt", resolve));

		// Building the table schedules a layout of its own
		runFrames();
	});

	afterEach(() => {
		frameSpies.forEach((spy) => spy.mockRestore());
		tabulator?.destroy();
		document.getElementById("select-range-layout-test")?.remove();
	});

	it.each([
		["scroll-vertical", () => 10],
		["scroll-horizontal", () => 10],
		["cell-height", () => selectRangeMod.getActiveCell()],
		["column-width", () => selectRangeMod.getTableColumns()[0]],
	])("should not hide the overlay on %s", (event, getArg) => {
		selectRangeMod.overlay.style.visibility = "visible";

		dispatch(event, getArg());

		expect(selectRangeMod.overlay.style.visibility).toBe("visible");
	});

	it("should lay out ranges once per frame however many changes occur", () => {
		const layoutRanges = jest.spyOn(selectRangeMod, "layoutRanges");

		dispatch("scroll-vertical");
		dispatch("scroll-horizontal");
		dispatch("cell-height", selectRangeMod.getActiveCell());

		expect(frames.length).toBe(1);
		expect(layoutRanges).not.toHaveBeenCalled();

		runFrames();

		expect(layoutRanges).toHaveBeenCalledTimes(1);
	});

	it("should schedule another layout once the frame has run", () => {
		dispatch("scroll-vertical");
		runFrames();
		dispatch("scroll-vertical");

		expect(frames.length).toBe(1);
	});

	it("should cancel a pending layout when the table is destroyed", () => {
		dispatch("scroll-vertical");

		tabulator.destroy();
		tabulator = null;

		expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
	});

	it("should hide the active cell outline only while its cell is not rendered", () => {
		const rowElement = selectRangeMod.getActiveCell().row.getElement();
		const parent = rowElement.parentNode;

		rowElement.remove();
		selectRangeMod.layoutRanges();

		expect(selectRangeMod.activeRangeCellElement.style.display).toBe("none");

		parent.appendChild(rowElement);
		selectRangeMod.layoutRanges();

		expect(selectRangeMod.activeRangeCellElement.style.display).toBe("");
	});
});
