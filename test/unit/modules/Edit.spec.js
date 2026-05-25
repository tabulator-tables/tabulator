import TabulatorFull from '../../../src/js/core/TabulatorFull.js';
import Edit from '../../../src/js/modules/Edit/Edit.js';
import List from '../../../src/js/modules/Edit/List.js';

describe("Edit module", () => {
	let table;
	
	// Helper function to create a table and wait for it to be built
	const setupTable = async (tableOptions = {}) => {
		document.body.innerHTML = '<div id="test-table"></div>';
		
		const defaultOptions = {
			data: [
				{ id: 1, name: "John", age: 25 },
				{ id: 2, name: "Jane", age: 30 },
				{ id: 3, name: "Bob", age: 35 }
			],
			columns: [
				{ title: "ID", field: "id" },
				{ title: "Name", field: "name", editor: "input" },
				{ title: "Age", field: "age", editor: "number" }
			]
		};
		
		// Create table with merged options
		const options = { ...defaultOptions, ...tableOptions };
		const newTable = new TabulatorFull("#test-table", options);
		
		// Wait for table to be built
		await new Promise(resolve => {
			newTable.on("tableBuilt", resolve);
		});
		
		return newTable;
	};
	
	const setupList = ({
		cellType = "header",
		cellValue = "Female",
		editorParams = { values: ["Male", "Female"] },
		success = jest.fn(),
		cancel = jest.fn(),
	} = {}) => {
		const element = document.createElement("div");
		const list = new List(
			{
				table: {},
			},
			{
				getType: jest.fn().mockReturnValue(cellType),
				getValue: jest.fn().mockReturnValue(cellValue),
				getElement: jest.fn().mockReturnValue(element),
			},
			jest.fn(),
			success,
			cancel,
			editorParams
		);
		
		return {list, success, cancel, element};
	};
	
	beforeEach(async () => {
		table = await setupTable();
	});
	
	afterEach(() => {
		if(table) {
			table.destroy();
		}
	});
	
	it("should have edit module", () => {
		const edit = table.module("edit");
		expect(edit).toBeInstanceOf(Edit);
	});
	
	it("should have predefined editors", () => {
		// Check that various editors are defined
		const edit = table.module("edit");
		
		expect(edit.editors).toBeDefined();
		expect(typeof edit.editors.input).toBe("function");
		expect(typeof edit.editors.textarea).toBe("function");
		expect(typeof edit.editors.number).toBe("function");
	});
	
	it("should update cell values", async () => {
		// Get a cell
		const row = table.getRows()[0];
		const cell = row.getCell("name");
		
		// Initial value
		const initialValue = cell.getValue();
		expect(initialValue).toBe("John");
		
		// Update value and check it was changed
		const newValue = "Updated Name";
		cell.setValue(newValue);
		
		expect(cell.getValue()).toBe(newValue);
		expect(row.getData().name).toBe(newValue);
	});
	
	it("should emit cellEdited event when value changes", async () => {
		// Listen for the cellEdited event
		const editPromise = new Promise(resolve => {
			table.on("cellEdited", function(cell) {
				// Verify the changed cell
				expect(cell.getValue()).toBe("Updated via Event");
				expect(cell.getField()).toBe("name");
				resolve();
			});
		});
		
		// Change a cell value to trigger the event
		const cell = table.getRows()[0].getCell("name");
		cell.setValue("Updated via Event");
		
		// Wait for the event
		await editPromise;
	});
	
	it("should add editors to editor types object", () => {
		const edit = table.module("edit");
		const initialEditorCount = Object.keys(edit.editors).length;
		
		// Add a new editor
		const customEditor = function(cell, onRendered, success, cancel) {
			return document.createElement("input");
		};
		
		edit.editors.custom = customEditor;
		
		// Check the editor was added
		expect(Object.keys(edit.editors).length).toBe(initialEditorCount + 1);
		expect(edit.editors.custom).toBe(customEditor);
	});
	
	it("should track edited events", async () => {
		// Create a spy for the cellEdited event
		const cellEditedSpy = jest.fn();
		table.on("cellEdited", cellEditedSpy);
		
		// Change a cell value
		const cell = table.getRows()[0].getCell("name");
		cell.setValue("New Value");
		
		// Wait a bit for event processing
		await new Promise(resolve => setTimeout(resolve, 100));
		
		// Should have received the cellEdited event
		expect(cellEditedSpy).toHaveBeenCalled();
	});
	
	it("should apply a focused header list filter item when Enter is pressed", () => {
		const {list, success} = setupList({
			cellValue: "",
		});
		const item = list.data.find(item => item.value === "Female");
		
		list._focusItem(item);
		list._keyEnter();
		
		expect(success).toHaveBeenCalledWith("Female");
		expect(list.input.value).toBe("Female");
	});
	
	it("should keep a header list filter selected when Enter is pressed repeatedly", () => {
		const {list, success} = setupList();
		
		list._keyEnter();
		list._keyEnter();
		
		expect(success).toHaveBeenCalledTimes(2);
		expect(success).toHaveBeenNthCalledWith(1, "Female");
		expect(success).toHaveBeenNthCalledWith(2, "Female");
	});
	
	it("should use currentItems instead of initialValues after the first multiselect parse", () => {
		const {list} = setupList({
			cellType: "cell",
			cellValue: ["red", "blue"],
			editorParams: {
				multiselect: true,
				values: ["red", "green", "blue"],
			},
		});
		
		list._parseList(["red", "green", "blue"]);
		
		expect(list.initialValues).toBeNull();
		expect(list.currentItems.map(item => item.value)).toEqual(["red", "blue"]);
		
		list._chooseItem(list.currentItems.find(item => item.value === "red"));
		
		expect(list.currentItems.map(item => item.value)).toEqual(["blue"]);
		
		const rebuiltItems = list._parseList(["red", "green", "blue"]);
		const redItem = rebuiltItems.find(item => item.value === "red");
		const blueItem = rebuiltItems.find(item => item.value === "blue");
		
		expect(list.initialValues).toBeNull();
		expect(redItem.selected).toBe(false);
		expect(blueItem.selected).toBe(true);
		expect(list.currentItems).toEqual([blueItem]);
	});
});
