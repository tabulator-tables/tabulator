import TabulatorFull from "../../../src/js/core/TabulatorFull";

// Regression tests for https://github.com/tabulator-tables/tabulator/issues/4853
// scrollToColumn must settle its promise, like scrollToRow does.
describe("scrollToColumn promise", () => {
	/** @type {TabulatorFull} */
	let table;

	// Resolve to the state of the promise after a short wait, so a promise
	// that never settles fails the test quickly instead of timing out.
	const settledState = (promise) => {
		return Promise.race([
			promise.then(() => "resolved", () => "rejected"),
			new Promise((resolve) => setTimeout(() => resolve("pending"), 50)),
		]);
	};

	beforeEach(async () => {
		const el = document.createElement("div");
		el.id = "tabulator";
		document.body.appendChild(el);

		table = new TabulatorFull("#tabulator", {
			data: [
				{ id: 1, name: "Alice", age: 30 },
				{ id: 2, name: "Bob", age: 40 },
			],
			columns: [
				{ title: "ID", field: "id" },
				{ title: "Name", field: "name" },
				{ title: "Age", field: "age", visible: false },
			],
		});

		await new Promise((resolve) => table.on("tableBuilt", resolve));
	});

	afterEach(() => {
		table.destroy();
		document.getElementById("tabulator")?.remove();
	});

	it("resolves when the column exists", async () => {
		expect(await settledState(table.scrollToColumn("name"))).toBe("resolved");
	});

	it("rejects when no column matches the field", async () => {
		const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

		await expect(table.scrollToColumn("missing")).rejects.toBe("Scroll Error - No matching column found");

		warn.mockRestore();
	});

	it("rejects when the column is not visible", async () => {
		const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

		await expect(table.scrollToColumn("age")).rejects.toBe("Scroll Error - Column not visible");

		warn.mockRestore();
	});

	it("resolves when ifVisible is false and the column is already in view", async () => {
		const column = table.columnManager.findColumn("name");

		// jsdom does not compute layout, so place the column inside the viewport by hand.
		jest.spyOn(column, "getLeftOffset").mockReturnValue(100);
		Object.defineProperty(column.getElement(), "offsetWidth", { configurable: true, value: 50 });
		Object.defineProperty(table.columnManager.element, "clientWidth", { configurable: true, value: 500 });

		expect(await settledState(table.scrollToColumn("name", "middle", false))).toBe("resolved");
		expect(await settledState(column.getComponent().scrollTo("middle", false))).toBe("resolved");
	});
});
