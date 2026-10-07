import TabulatorFull from "../../../src/js/core/TabulatorFull";

describe("CellButton module", () => {
	let table;

	const tableData = [
		{ id: 1, name: "Alice", manager: 2, notes: "first" },
		{ id: 2, name: "Bob", manager: null, notes: "second" },
	];

	async function buildTable(columns, options = {}){
		const el = document.createElement("div");
		el.id = "cell-button-table";
		document.body.appendChild(el);

		table = new TabulatorFull(el, {
			// a fixed height and basic rendering lays the rows out into the live DOM under jsdom
			height: 300,
			renderVertical: "basic",
			data: tableData.map((row) => Object.assign({}, row)),
			columns,
			...options,
		});

		await new Promise((resolve) => table.on("tableBuilt", resolve));

		table.redraw(true);

		return table;
	}

	function cellEl(row, field){
		return table.getRows()[row].getCell(field).getElement();
	}

	// the table tracks hovering through delegated mouseover events
	function hover(row, field){
		cellEl(row, field).dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
	}

	function leaveTable(){
		table.element.dispatchEvent(new MouseEvent("mouseleave"));
	}

	function buttons(row, field){
		return cellEl(row, field).querySelectorAll(".tabulator-cell-button");
	}

	afterEach(() => {
		if(table){
			table.destroy();
			table = null;
		}

		document.body.innerHTML = "";
		jest.restoreAllMocks();
	});

	describe("rendering", () => {
		it("only adds buttons to the hovered cell", async () => {
			await buildTable([
				{ title: "Name", field: "name", cellButton: { icon: "x" } },
				{ title: "Notes", field: "notes" },
			]);

			expect(document.querySelectorAll(".tabulator-cell-button").length).toBe(0);

			hover(0, "name");
			expect(buttons(0, "name").length).toBe(1);
			expect(document.querySelectorAll(".tabulator-cell-button").length).toBe(1);

			hover(1, "name");
			expect(buttons(0, "name").length).toBe(0);
			expect(buttons(1, "name").length).toBe(1);

			// hovering a cell in a column without buttons clears them
			hover(1, "notes");
			expect(document.querySelectorAll(".tabulator-cell-button").length).toBe(0);

			hover(0, "name");
			leaveTable();
			expect(document.querySelectorAll(".tabulator-cell-button").length).toBe(0);
		});

		it("builds the button from its icon, label and cssClass", async () => {
			const icon = jest.fn(() => "<b>go</b>");
			const label = jest.fn((cell) => "Open " + cell.getValue());

			await buildTable([
				{ title: "Name", field: "name", cellButton: { icon, label, cssClass: "one two", params: { a: 1 } } },
			]);

			hover(0, "name");

			const button = buttons(0, "name")[0];

			expect(button.type).toBe("button");
			expect(button.innerHTML).toBe("<b>go</b>");
			expect(button.title).toBe("Open Alice");
			expect(button.getAttribute("aria-label")).toBe("Open Alice");
			expect(button.classList.contains("one")).toBe(true);
			expect(button.classList.contains("two")).toBe(true);

			expect(icon.mock.calls[0][0].getValue()).toBe("Alice");
			expect(icon.mock.calls[0][1]).toEqual({ a: 1 });
		});

		it("uses an icon element, cloning it for each render", async () => {
			const icon = document.createElement("i");
			icon.className = "my-icon";

			await buildTable([{ title: "Name", field: "name", cellButton: { icon } }]);

			hover(0, "name");
			const first = buttons(0, "name")[0].querySelector(".my-icon");

			hover(1, "name");
			const second = buttons(1, "name")[0].querySelector(".my-icon");

			expect(first).not.toBeNull();
			expect(second).not.toBeNull();
			expect(first).not.toBe(icon);
		});

		it("falls back to a default icon", async () => {
			await buildTable([{ title: "Name", field: "name", cellButton: {} }]);

			hover(0, "name");

			expect(buttons(0, "name")[0].querySelector("svg")).not.toBeNull();
		});

		it("groups buttons on the left and right of the cell", async () => {
			await buildTable([
				{ title: "Name", field: "name", cellButton: [
					{ icon: "a" },
					{ icon: "b", position: "left" },
					{ icon: "c" },
				] },
			]);

			hover(0, "name");

			const right = cellEl(0, "name").querySelector(".tabulator-cell-buttons-right");
			const left = cellEl(0, "name").querySelector(".tabulator-cell-buttons-left");

			expect([...right.children].map((el) => el.textContent)).toEqual(["a", "c"]);
			expect([...left.children].map((el) => el.textContent)).toEqual(["b"]);
		});

		it("hides buttons whose visible check fails", async () => {
			const visible = jest.fn((cell) => cell.getValue() !== null);

			await buildTable([
				{ title: "Manager", field: "manager", cellButton: { icon: "go", visible, params: { table: "people" } } },
			]);

			hover(0, "manager");
			expect(buttons(0, "manager").length).toBe(1);

			hover(1, "manager");
			expect(buttons(1, "manager").length).toBe(0);

			expect(visible.mock.calls[0][1]).toEqual({ table: "people" });
		});

		it("hides editable buttons on cells that cannot be edited", async () => {
			await buildTable([
				{ title: "Name", field: "name", editor: "input", editable: (cell) => cell.getRow().getData().id === 1, cellButton: { icon: "e", editable: true } },
				{ title: "Notes", field: "notes", editor: "input", editable: false, cellButton: [{ icon: "e", editable: true }, { icon: "v" }] },
				// without an editor there are no edit rules to follow
				{ title: "Manager", field: "manager", cellButton: { icon: "e", editable: true } },
			]);

			hover(0, "name");
			expect(buttons(0, "name").length).toBe(1);

			hover(1, "name");
			expect(buttons(1, "name").length).toBe(0);

			hover(0, "notes");
			expect([...buttons(0, "notes")].map((el) => el.textContent)).toEqual(["v"]);

			hover(0, "manager");
			expect(buttons(0, "manager").length).toBe(1);
		});

		it("restores the buttons when the hovered cell is redrawn", async () => {
			await buildTable([{ title: "Name", field: "name", cellButton: { icon: "x" } }]);

			hover(0, "name");
			table.getRows()[0].getCell("name").setValue("Alicia");

			expect(cellEl(0, "name").textContent).toBe("Aliciax");
			expect(buttons(0, "name").length).toBe(1);
		});

		it("does not add buttons to a cell that is being edited", async () => {
			await buildTable([{ title: "Name", field: "name", editor: "input", cellButton: { icon: "x" } }]);

			const cell = table.getRows()[0].getCell("name");

			hover(0, "name");
			cell.edit();

			expect(cellEl(0, "name").querySelector("input")).not.toBeNull();
			expect(buttons(0, "name").length).toBe(0);

			// re-entering the cell while the editor is open leaves the editor alone
			hover(1, "name");
			hover(0, "name");
			expect(buttons(0, "name").length).toBe(0);

			// once the editor closes the buttons come back
			cell.cancelEdit();
			expect(buttons(0, "name").length).toBe(1);
		});

		it("supports buttons set through columnDefaults", async () => {
			await buildTable([{ title: "Name", field: "name" }], { columnDefaults: { cellButton: { icon: "d" } } });

			hover(0, "name");

			expect(buttons(0, "name").length).toBe(1);
		});
	});

	describe("button types", () => {
		const types = {
			testLink: {
				icon: "L",
				label: "Link",
				params: { target: "people", mode: "view" },
				action: jest.fn(),
			},
		};

		beforeAll(() => {
			TabulatorFull.extendModule("cellButton", "buttons", types);
		});

		it("looks up a button type by name", async () => {
			await buildTable([{ title: "Name", field: "name", cellButton: "testLink" }]);

			hover(0, "name");

			const button = buttons(0, "name")[0];

			expect(button.textContent).toBe("L");
			expect(button.title).toBe("Link");
		});

		it("lets a definition override a type and merge its params", async () => {
			await buildTable([{ title: "Name", field: "name", cellButton: { type: "testLink", label: "Go", params: { mode: "edit" } } }]);

			hover(0, "name");
			buttons(0, "name")[0].click();

			expect(buttons(0, "name")[0].title).toBe("Go");
			expect(types.testLink.action.mock.calls[0][2]).toEqual({ target: "people", mode: "edit" });
		});

		it("merges params functions with the type's params", async () => {
			await buildTable([{ title: "Name", field: "name", cellButton: { type: "testLink", params: (cell) => ({ mode: cell.getValue() }) } }]);

			types.testLink.action.mockClear();

			hover(0, "name");
			buttons(0, "name")[0].click();

			expect(types.testLink.action.mock.calls[0][2]).toEqual({ target: "people", mode: "Alice" });
		});

		it("warns about unknown types and invalid definitions", async () => {
			const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

			await buildTable([{ title: "Name", field: "name", cellButton: ["nope", 5, { icon: "ok" }] }]);

			hover(0, "name");

			expect(warn).toHaveBeenCalledWith("Cell Button Error - No such button type found:", "nope");
			expect(warn).toHaveBeenCalledWith("Cell Button Error - A button must be defined as a string or an object, received:", 5);
			expect([...buttons(0, "name")].map((el) => el.textContent)).toEqual(["ok"]);
		});
	});

	describe("actions", () => {
		it("calls the action without triggering the cell's own click handling", async () => {
			const action = jest.fn();
			const cellClick = jest.fn();
			const rowClick = jest.fn();

			await buildTable([
				{ title: "Name", field: "name", editor: "input", cellClick, cellButton: { icon: "x", action, params: { p: 1 } } },
			]);

			table.on("rowClick", rowClick);

			hover(0, "name");

			const button = buttons(0, "name")[0];

			button.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
			button.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
			button.dispatchEvent(new MouseEvent("click", { bubbles: true }));

			expect(action).toHaveBeenCalledTimes(1);

			const [e, cell, params, context] = action.mock.calls[0];

			expect(e.type).toBe("click");
			expect(cell.getValue()).toBe("Alice");
			expect(params).toEqual({ p: 1 });
			expect(context.element).toBe(button);
			expect(typeof context.popup).toBe("function");
			expect(typeof context.commit).toBe("function");

			expect(cellClick).not.toHaveBeenCalled();
			expect(rowClick).not.toHaveBeenCalled();
			expect(cellEl(0, "name").classList.contains("tabulator-editing")).toBe(false);
		});
	});

	describe("popups", () => {
		let context;

		async function openPopup(columnOptions = {}){
			await buildTable([
				{ title: "Name", field: "name", ...columnOptions, cellButton: [{
					icon: "p",
					action: (e, cell, params, button) => {
						const el = document.createElement("div");
						el.className = "test-popup";
						context = button;
						context.popupInstance = button.popup(el);
					},
				}, { icon: "q" }] },
			]);

			hover(0, "name");
			buttons(0, "name")[0].click();
		}

		it("opens a popup beside the cell and keeps the button shown while it is open", async () => {
			await openPopup();

			expect(document.querySelector(".test-popup").classList.contains("tabulator-popup")).toBe(true);

			const button = buttons(0, "name")[0];

			expect(button.classList.contains("tabulator-cell-button-active")).toBe(true);
			expect(buttons(0, "name")[1].classList.contains("tabulator-cell-button-active")).toBe(false);
			expect(button.parentNode.classList.contains("tabulator-cell-buttons-active")).toBe(true);

			// moving away from the cell leaves the buttons in place while the popup is open
			leaveTable();
			expect(buttons(0, "name").length).toBe(2);

			context.popupInstance.hide();

			expect(document.querySelector(".test-popup")).toBeNull();
			expect(buttons(0, "name").length).toBe(0);
		});

		it("keeps the buttons after the popup closes while the cell is still hovered", async () => {
			await openPopup();

			context.popupInstance.hide();

			expect(buttons(0, "name").length).toBe(2);
			expect(buttons(0, "name")[0].classList.contains("tabulator-cell-button-active")).toBe(false);
		});

		it("closes the popup when its button is clicked again", async () => {
			await openPopup();

			buttons(0, "name")[0].click();

			expect(document.querySelector(".test-popup")).toBeNull();
		});

		it("closes the popup when another button is clicked", async () => {
			await openPopup();

			buttons(0, "name")[1].click();

			expect(document.querySelector(".test-popup")).toBeNull();
		});

		it("does not close the popup when it is clicked", async () => {
			await openPopup();

			// let the popup bind its blur listeners
			await new Promise((resolve) => setTimeout(resolve, 150));

			document.querySelector(".test-popup").dispatchEvent(new MouseEvent("click", { bubbles: true }));
			expect(document.querySelector(".test-popup")).not.toBeNull();

			document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
			expect(document.querySelector(".test-popup")).toBeNull();
		});

		it("closes the popup when its row is deleted", async () => {
			await openPopup();

			await table.getRows()[0].delete();

			expect(document.querySelector(".test-popup")).toBeNull();
		});
	});

	describe("committing values", () => {
		let commit, popup;

		async function setup(column, options){
			await buildTable([{ title: "Name", field: "name", ...column, cellButton: {
				icon: "c",
				action: (e, cell, params, button) => {
					commit = button.commit;
					popup = button.popup(document.createElement("div"));
				},
			} }], options);

			hover(0, "name");
			buttons(0, "name")[0].click();
		}

		it("saves the value as an edit", async () => {
			const cellEdited = jest.fn();

			await setup({ editor: "input" });

			table.on("cellEdited", cellEdited);

			expect(commit("Alicia")).toBe(true);

			const cell = table.getRows()[0].getCell("name");

			expect(cell.getValue()).toBe("Alicia");
			expect(cell.isEdited()).toBe(true);
			expect(table.getEditedCells()).toContain(cell);
			expect(cellEdited).toHaveBeenCalledTimes(1);
		});

		it("can be undone", async () => {
			await setup({ editor: "input" }, { history: true });

			commit("Alicia");
			table.undo();

			expect(table.getRows()[0].getCell("name").getValue()).toBe("Alice");
		});

		it("converts empty values like the editor does", async () => {
			await setup({ editor: "input", editorEmptyValue: "" });

			commit(null);

			expect(table.getRows()[0].getCell("name").getValue()).toBe("");
		});

		it("rejects values that fail validation", async () => {
			const validationFailed = jest.fn();

			await setup({ editor: "input", validator: "required" });

			table.on("validationFailed", validationFailed);

			expect(commit("")).toBe(false);
			await new Promise((resolve) => setTimeout(resolve));

			expect(table.getRows()[0].getCell("name").getValue()).toBe("Alice");
			expect(validationFailed).toHaveBeenCalledTimes(1);
			expect(cellEl(0, "name").classList.contains("tabulator-validation-fail")).toBe(true);

			// closing the popup without a valid value puts the cell's validation state back
			popup.hide();

			expect(cellEl(0, "name").classList.contains("tabulator-validation-fail")).toBe(false);
		});

		it("clears the validation failure once a valid value is saved", async () => {
			await setup({ editor: "input", validator: "required" });

			commit("");
			await new Promise((resolve) => setTimeout(resolve));

			expect(commit("Alicia")).toBe(true);
			expect(cellEl(0, "name").classList.contains("tabulator-validation-fail")).toBe(false);
		});

		it("saves invalid values in highlight validation mode", async () => {
			await setup({ editor: "input", validator: "required" }, { validationMode: "highlight" });

			expect(commit("")).toBe(true);
			expect(table.getRows()[0].getCell("name").getValue()).toBe("");

			await new Promise((resolve) => setTimeout(resolve));
			expect(cellEl(0, "name").classList.contains("tabulator-validation-fail")).toBe(true);
		});

		it("closes an editor open on the same cell before saving", async () => {
			await setup({ editor: "input" });

			const cell = table.getRows()[0].getCell("name");

			cell.edit();
			expect(cellEl(0, "name").classList.contains("tabulator-editing")).toBe(true);

			commit("Alicia");

			expect(cellEl(0, "name").classList.contains("tabulator-editing")).toBe(false);
			expect(cell.getValue()).toBe("Alicia");
		});
	});
});
