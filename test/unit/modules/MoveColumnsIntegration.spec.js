import TabulatorFull from '../../../src/js/core/TabulatorFull.js';

// Integration tests for dragging column group headers (movableColumnGroups).
// Kept apart from MoveColumns.spec.js, which stubs document.createElement and
// Module.prototype without restoring them.
describe('MoveColumns integration: movable column groups', () => {
	let table;
	let columnMoved;
	let originalWidth, originalHeight;

	// jsdom has no layout; rows render only into an element with a size
	const sizedElement = {configurable:true, get(){ return 20; }};

	const leafFields = ["x", "a1", "a2", "b1", "b2", "g1", "h1", "h2"];

	const makeData = (count, fields) => {
		var rows = [];

		for(let i = 1; i <= count; i++){
			let row = {id:i};

			fields.forEach((field) => {
				row[field] = field + "-" + i;
			});

			rows.push(row);
		}

		return rows;
	};

	const defaultColumns = () => [
		{title:"x", field:"x"},
		{title:"A", columns:[
			{title:"a1", field:"a1"},
			{title:"a2", field:"a2"},
		]},
		{title:"B", columns:[
			{title:"b1", field:"b1"},
			{title:"b2", field:"b2"},
		]},
		{title:"G", columns:[
			{title:"g1", field:"g1"},
			{title:"H", columns:[
				{title:"h1", field:"h1"},
				{title:"h2", field:"h2"},
			]},
		]},
	];

	const setupTable = async (tableOptions = {}) => {
		document.body.innerHTML = '<div id="test-table"></div>';

		const options = {
			data:makeData(3, leafFields),
			columns:defaultColumns(),
			columnDefaults:{width:50, headerSort:false},
			renderVertical:"basic",
			movableColumns:true,
			movableColumnGroups:true,
			...tableOptions,
		};

		const newTable = new TabulatorFull("#test-table", options);

		await new Promise(resolve => newTable.on("tableBuilt", resolve));

		columnMoved = jest.fn();
		newTable.on("columnMoved", columnMoved);

		jest.useFakeTimers();

		return newTable;
	};

	const findColumn = (title, columns = table.getColumns(true)) => {
		for(let column of columns){
			if(column.getDefinition().title === title){
				return column;
			}

			let found = findColumn(title, column.getSubColumns());

			if(found){
				return found;
			}
		}

		return false;
	};

	const mouse = (type, element, clientX = 0, init = {}) => {
		element.dispatchEvent(new MouseEvent(type, {bubbles:true, cancelable:true, which:1, clientX, ...init}));
	};

	// the first title in a group's element is the group's own, its children's follow
	const titleOf = (title) => findColumn(title).getElement().querySelector(".tabulator-col-title");

	const press = (title) => {
		mouse("mousedown", titleOf(title));
		jest.advanceTimersByTime(250);
	};

	const hover = (title, clientX) => {
		mouse("mousemove", findColumn(title).getElement(), clientX);
	};

	const release = () => {
		mouse("mouseup", document.body);
	};

	// a press and release on a header title, short of the move delay
	const click = (title, init = {}) => {
		mouse("mousedown", titleOf(title), 0, init);
		mouse("mouseup", titleOf(title), 0, init);
	};

	const drag = (from, to, clientX) => {
		press(from);
		hover(to, clientX);
		release();
	};

	const fields = () => table.getColumns().map((column) => column.getField());

	const headerFields = () => [...table.element.querySelectorAll(".tabulator-headers .tabulator-col[tabulator-field]")].map((el) => el.getAttribute("tabulator-field"));

	const topTitles = () => table.getColumns(true).map((column) => column.getDefinition().title);

	const rowDomFields = () => table.getRows().map((row) => [...row.getElement().querySelectorAll(".tabulator-cell")].map((el) => el.getAttribute("tabulator-field")));

	const rowCellFields = () => table.getRows().map((row) => row.getCells().map((cell) => cell.getField()));

	const expectOrder = (expected) => {
		expect(fields()).toEqual(expected);
		expect(headerFields()).toEqual(expected);
		rowDomFields().forEach((rowFields) => expect(rowFields).toEqual(expected));
		rowCellFields().forEach((rowFields) => expect(rowFields).toEqual(expected));
	};

	beforeAll(() => {
		originalWidth = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "offsetWidth");
		originalHeight = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "offsetHeight");

		Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", sizedElement);
		Object.defineProperty(window.HTMLElement.prototype, "offsetHeight", sizedElement);
	});

	afterAll(() => {
		if(originalWidth){
			Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", originalWidth);
		}

		if(originalHeight){
			Object.defineProperty(window.HTMLElement.prototype, "offsetHeight", originalHeight);
		}
	});

	afterEach(() => {
		jest.useRealTimers();

		if(table){
			table.destroy();
			table = null;
		}

		localStorage.clear();
	});

	test('with movableColumnGroups unset, pressing a group header starts no move and changes nothing', async () => {
		table = await setupTable({movableColumnGroups:undefined});

		press("A");
		expect(document.querySelector(".tabulator-moving")).toBeNull();
		hover("b2", 80);
		release();

		expectOrder(leafFields);
		expect(columnMoved).not.toHaveBeenCalled();
	});

	test('a group dropped after a sibling group moves its leaves as one block in the model, the header and every row', async () => {
		table = await setupTable();

		drag("A", "b2", 80);

		expectOrder(["x", "b1", "b2", "a1", "a2", "g1", "h1", "h2"]);
		expect(topTitles()).toEqual(["x", "B", "A", "G"]);
		expect(columnMoved).toHaveBeenCalledTimes(1);
		expect(columnMoved.mock.calls[0][0]).toBe(findColumn("A"));
		expect(columnMoved.mock.calls[0][1].map((column) => column.getField())).toEqual(["x", "b1", "b2", "a1", "a2", "g1", "h1", "h2"]);
		expect(document.querySelector(".tabulator-moving")).toBeNull();
		expect(document.querySelector(".tabulator-col-placeholder")).toBeNull();
	});

	test('a group dropped before a plain sibling column moves ahead of it', async () => {
		table = await setupTable();

		drag("A", "x", 0);

		expectOrder(["a1", "a2", "x", "b1", "b2", "g1", "h1", "h2"]);
		expect(topTitles()).toEqual(["A", "x", "B", "G"]);
		expect(columnMoved).toHaveBeenCalledTimes(1);
	});

	test('a plain column dropped after a sibling group lands after the group\'s last leaf', async () => {
		table = await setupTable();

		// b1 belongs to B, so the move over it bubbles to B, the sibling of x
		press("x");
		mouse("mousemove", findColumn("b1").getElement(), 80);
		release();

		expectOrder(["a1", "a2", "b1", "b2", "x", "g1", "h1", "h2"]);
		expect(topTitles()).toEqual(["A", "B", "x", "G"]);
		expect(columnMoved).toHaveBeenCalledTimes(1);
		expect(columnMoved.mock.calls[0][0]).toBe(findColumn("x"));
	});

	test('a hidden leaf moves with its group', async () => {
		var columns = defaultColumns();

		columns[1].columns[1].visible = false;

		table = await setupTable({columns});

		drag("A", "b2", 80);

		expect(fields()).toEqual(["x", "b1", "b2", "a1", "a2", "g1", "h1", "h2"]);
		rowCellFields().forEach((rowFields) => expect(rowFields).toEqual(["x", "b1", "b2", "a1", "a2", "g1", "h1", "h2"]));
		rowDomFields().forEach((rowFields) => expect(rowFields).toEqual(["x", "b1", "b2", "a1", "a2", "g1", "h1", "h2"]));
		expect(findColumn("a2").isVisible()).toBe(false);
	});

	test('a group moves in the header and the model when the table has no rows', async () => {
		table = await setupTable({data:[]});

		drag("A", "b2", 80);

		expect(fields()).toEqual(["x", "b1", "b2", "a1", "a2", "g1", "h1", "h2"]);
		expect(headerFields()).toEqual(["x", "b1", "b2", "a1", "a2", "g1", "h1", "h2"]);
		expect(columnMoved).toHaveBeenCalledTimes(1);
	});

	test('a group whose leaves a programmatic move has split still moves every leaf and no other column', async () => {
		table = await setupTable();

		table.moveColumn("a1", "b1", true);
		expect(fields()).toEqual(["x", "a2", "b1", "a1", "b2", "g1", "h1", "h2"]);

		drag("A", "x", 0);

		expect(fields()).toEqual(["a2", "a1", "x", "b1", "b2", "g1", "h1", "h2"]);
		rowCellFields().forEach((rowFields) => expect(rowFields).toEqual(fields()));
	});

	test('a nested group moves within its parent group', async () => {
		table = await setupTable();

		drag("H", "g1", 0);

		expectOrder(["x", "a1", "a2", "b1", "b2", "h1", "h2", "g1"]);
		expect(findColumn("G").getSubColumns().map((column) => column.getDefinition().title)).toEqual(["H", "g1"]);
		expect(columnMoved).toHaveBeenCalledTimes(1);
		expect(columnMoved.mock.calls[0][0]).toBe(findColumn("H"));
	});

	test('a nested group finds no target outside its parent group', async () => {
		table = await setupTable();

		press("H");
		expect(document.querySelector(".tabulator-moving")).not.toBeNull();

		hover("b1", 0);
		hover("B", 80);

		release();

		expectOrder(leafFields);
		expect(columnMoved).not.toHaveBeenCalled();
	});

	test('pressing a leaf inside a group moves the leaf alone', async () => {
		table = await setupTable();

		press("a1");
		expect(document.querySelectorAll(".tabulator-moving").length).toBe(1);

		hover("a2", 40);
		release();

		expectOrder(["x", "a2", "a1", "b1", "b2", "g1", "h1", "h2"]);
		expect(columnMoved).toHaveBeenCalledTimes(1);
		expect(columnMoved.mock.calls[0][0]).toBe(findColumn("a1"));
	});

	test('a frozen group neither moves nor takes a drop', async () => {
		const frozenFields = ["f1", "x", "a1", "a2", "b1", "b2"];

		table = await setupTable({
			data:makeData(3, frozenFields),
			columns:[
				{title:"F", frozen:true, columns:[
					{title:"f1", field:"f1"},
				]},
				...defaultColumns().slice(0, 3),
			],
		});

		press("F");
		expect(document.querySelector(".tabulator-moving")).toBeNull();
		release();

		press("A");
		expect(document.querySelector(".tabulator-moving")).not.toBeNull();

		hover("f1", 0);
		hover("F", 0);

		release();

		expectOrder(frozenFields);
		expect(columnMoved).not.toHaveBeenCalled();
	});

	test('each moved cell keeps its resize handle next to it', async () => {
		table = await setupTable();

		drag("A", "b2", 80);

		expectOrder(["x", "b1", "b2", "a1", "a2", "g1", "h1", "h2"]);

		table.getRows().forEach((row) => {
			["x", "b1", "b2", "a1", "a2"].forEach((field) => {
				var cellEl = row.getCell(field).getElement();

				expect(cellEl.nextElementSibling.classList.contains("tabulator-col-resize-handle")).toBe(true);
				expect(cellEl.nextElementSibling.nextElementSibling === null || cellEl.nextElementSibling.nextElementSibling.classList.contains("tabulator-cell")).toBe(true);
			});
		});
	});

	// in the header, each column or group element sits directly before its own resize handle
	const expectHeaderHandles = () => {
		var containers = [table.element.querySelector(".tabulator-headers"), ...table.element.querySelectorAll(".tabulator-col-group-cols")];

		containers.forEach((container) => {
			[...container.children].filter((el) => el.classList.contains("tabulator-col")).forEach((el) => {
				var column = table.columnManager.findColumn(el);

				expect(column.modules.resize.handleEl).toBeTruthy();
				expect(el.nextElementSibling).toBe(column.modules.resize.handleEl);
			});
		});
	};

	test.each([
		["a group dropped after a sibling group", "A", "b2", 80, ["x", "B", "A", "G"]],
		["a group dropped before a plain sibling column", "A", "x", 0, ["A", "x", "B", "G"]],
		["a plain column dropped after a sibling group", "x", "a2", 80, ["A", "x", "B", "G"]],
		["a nested group dropped before its sibling leaf", "H", "g1", 0, ["x", "A", "B", "G"]],
	])('header resize handles follow their columns when %s', async (_name, from, over, clientX, titles) => {
		table = await setupTable();

		expectHeaderHandles();

		press(from);
		mouse("mousemove", findColumn(over).getElement(), clientX);
		release();

		expect(topTitles()).toEqual(titles);
		expect(columnMoved).toHaveBeenCalledTimes(1);
		expectHeaderHandles();
	});

	// a column group is not in columnsByIndex; these guard that a programmatic move of
	// a group moves its leaves' cells, calc cells and resize handles with its header
	describe('table.moveColumn and column.move with a column group', () => {
		let originalOffsetParent;

		const groupMovedOrder = ["x", "b1", "b2", "a1", "a2", "g1", "h1", "h2"];

		const setupApiTable = (tableOptions = {}) => setupTable({movableColumns:false, movableColumnGroups:undefined, ...tableOptions});

		const subTitles = (title) => findColumn(title).getSubColumns().map((column) => column.getDefinition().title);

		// jsdom has no layout, so offsetParent is null and rows are not rebuilt after a
		// move as a browser rebuilds them
		beforeAll(() => {
			originalOffsetParent = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "offsetParent");

			Object.defineProperty(window.HTMLElement.prototype, "offsetParent", {configurable:true, get(){ return this.isConnected ? document.body : null; }});
		});

		afterAll(() => {
			if(originalOffsetParent){
				Object.defineProperty(window.HTMLElement.prototype, "offsetParent", originalOffsetParent);
			}else{
				delete window.HTMLElement.prototype.offsetParent;
			}
		});

		test.each([
			["a default table", {}],
			["movableColumns", {movableColumns:true}],
			["movableColumns and movableColumnGroups", {movableColumns:true, movableColumnGroups:true}],
		])('with %s, table.moveColumn moves a group\'s cells with its header', async (_name, options) => {
			table = await setupApiTable(options);

			table.moveColumn(findColumn("A"), findColumn("B"), true);

			expectOrder(groupMovedOrder);
			expect(topTitles()).toEqual(["x", "B", "A", "G"]);
			expect(columnMoved).toHaveBeenCalledTimes(1);
			expect(columnMoved.mock.calls[0][0]).toBe(findColumn("A"));
			expect(columnMoved.mock.calls[0][1].map((column) => column.getField())).toEqual(groupMovedOrder);
		});

		test.each([
			["a group before a plain sibling column", "A", "x", false, ["a1", "a2", "x", "b1", "b2", "g1", "h1", "h2"], ["A", "x", "B", "G"], ["g1", "H"]],
			["a plain column after a sibling group", "x", "B", true, ["a1", "a2", "b1", "b2", "x", "g1", "h1", "h2"], ["A", "B", "x", "G"], ["g1", "H"]],
			["a nested group before its sibling leaf", "H", "g1", false, ["x", "a1", "a2", "b1", "b2", "h1", "h2", "g1"], ["x", "A", "B", "G"], ["H", "g1"]],
		])('column.move with %s moves the cells with the header', async (_name, from, to, after, order, titles, groupTitles) => {
			table = await setupApiTable();

			findColumn(from).move(findColumn(to), after);

			expectOrder(order);
			expect(topTitles()).toEqual(titles);
			expect(subTitles("G")).toEqual(groupTitles);
			expect(columnMoved).toHaveBeenCalledTimes(1);
			expect(columnMoved.mock.calls[0][0]).toBe(findColumn(from));
		});

		test('a hidden leaf moves with its group', async () => {
			var columns = defaultColumns();

			columns[1].columns[1].visible = false;

			table = await setupApiTable({columns});

			table.moveColumn(findColumn("A"), findColumn("B"), true);

			expect(fields()).toEqual(groupMovedOrder);
			rowCellFields().forEach((rowFields) => expect(rowFields).toEqual(groupMovedOrder));
			rowDomFields().forEach((rowFields) => expect(rowFields).toEqual(groupMovedOrder));
			expect(findColumn("a2").isVisible()).toBe(false);
		});

		test('header resize handles follow a group moved after a sibling group', async () => {
			table = await setupApiTable();

			expectHeaderHandles();

			table.moveColumn(findColumn("A"), findColumn("B"), true);

			expect(topTitles()).toEqual(["x", "B", "A", "G"]);
			expectHeaderHandles();
		});

		test('a bottom calc row follows a group moved after a sibling group', async () => {
			table = await setupApiTable({columnDefaults:{width:50, headerSort:false, bottomCalc:"count"}});

			table.moveColumn(findColumn("A"), findColumn("B"), true);

			const calcFields = [...table.element.querySelectorAll(".tabulator-calcs-bottom .tabulator-cell")].map((el) => el.getAttribute("tabulator-field"));

			expect(calcFields).toEqual(groupMovedOrder);
		});

		test('with a horizontal virtual DOM, the rendered cells follow a group moved after a sibling group', async () => {
			table = await setupApiTable({renderHorizontal:"virtual"});

			table.moveColumn(findColumn("A"), findColumn("B"), true);

			expect(fields()).toEqual(groupMovedOrder);
			rowCellFields().forEach((rowFields) => expect(rowFields).toEqual(groupMovedOrder));

			// jsdom renders only a window of the columns: each row shows the first of them
			rowDomFields().forEach((rowFields) => {
				expect(rowFields.length).toBeGreaterThan(0);
				expect(rowFields).toEqual(groupMovedOrder.slice(0, rowFields.length));
			});
		});

		test('two leaves of one group move as upstream moves them', async () => {
			table = await setupApiTable();

			table.moveColumn("a1", "a2", true);

			expectOrder(["x", "a2", "a1", "b1", "b2", "g1", "h1", "h2"]);
			expect(columnMoved).toHaveBeenCalledTimes(1);
		});

		test('a leaf moved beside a leaf of another parent moves its cells and leaves the column definitions as they were', async () => {
			table = await setupApiTable();

			table.moveColumn("x", "b1", true);

			expect(fields()).toEqual(["a1", "a2", "b1", "x", "b2", "g1", "h1", "h2"]);
			rowCellFields().forEach((rowFields) => expect(rowFields).toEqual(["a1", "a2", "b1", "x", "b2", "g1", "h1", "h2"]));
			expect(topTitles()).toEqual(["x", "A", "B", "G"]);
		});

		test('a group moved beside a column of another parent moves no cells', async () => {
			table = await setupApiTable();

			// upstream's outcome is kept; its header nests A inside B, which is not pinned here
			table.moveColumn(findColumn("A"), findColumn("b1"), true);

			expect(fields()).toEqual(leafFields);
			rowCellFields().forEach((rowFields) => expect(rowFields).toEqual(leafFields));
			expect(topTitles()).toEqual(["x", "A", "B", "G"]);
			expect(columnMoved).toHaveBeenCalledTimes(1);
		});

		test('a group\'s title is not a lookup key: table.moveColumn with titles warns and changes nothing', async () => {
			const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

			try{
				table = await setupApiTable();

				table.moveColumn("A", "B", true);

				expect(warn).toHaveBeenCalled();
				expectOrder(leafFields);
				expect(topTitles()).toEqual(["x", "A", "B", "G"]);
				expect(columnMoved).not.toHaveBeenCalled();
			}finally{
				warn.mockRestore();
			}
		});
	});

	describe('with column range selection', () => {
		const rangeOptions = {selectableRange:true, selectableRangeColumns:true};

		const rangeFields = (index = 0) => table.getRanges()[index].getColumns().map((column) => column.getField());

		const edges = (index = 0) => [table.getRanges()[index].getLeftEdge(), table.getRanges()[index].getRightEdge()];

		test('a click on a group header selects its leaves and the next press drags the group', async () => {
			table = await setupTable(rangeOptions);

			// as for a leaf, a press on a header the range does not hold selects it and
			// starts no move; the next press on the same header drags it
			click("A");

			expect(rangeFields()).toEqual(["a1", "a2"]);
			expect(edges()).toEqual([1, 2]);

			drag("A", "b2", 80);

			expectOrder(["x", "b1", "b2", "a1", "a2", "g1", "h1", "h2"]);
			expect(columnMoved).toHaveBeenCalledTimes(1);
			expect(rangeFields()).toEqual(["a1", "a2"]);
		});

		test.each([
			["the leaves were selected one by one", "a1", "a2"],
			["a wider range holds the group", "x", "b2"],
		])('a group drags on its first press when %s', async (_name, start, end) => {
			table = await setupTable(rangeOptions);

			click(start);
			click(end, {shiftKey:true});

			drag("A", "b2", 80);

			expectOrder(["x", "b1", "b2", "a1", "a2", "g1", "h1", "h2"]);
			expect(columnMoved).toHaveBeenCalledTimes(1);
			expect(columnMoved.mock.calls[0][0]).toBe(findColumn("A"));
			expect(rangeFields()).toEqual(["a1", "a2"]);
		});

		test('a selected group does not let another group drag on its first press', async () => {
			table = await setupTable(rangeOptions);

			click("A");

			press("B");
			expect(document.querySelector(".tabulator-moving")).toBeNull();
			expect(rangeFields()).toEqual(["b1", "b2"]);

			// the press started a selection, so the move extends it and keeps its anchor on b1
			hover("x", 0);
			release();

			expectOrder(leafFields);
			expect(columnMoved).not.toHaveBeenCalled();
			expect(rangeFields()).toEqual(["x", "a1", "a2", "b1"]);
		});

		test('a group with only one leaf selected does not drag on its first press', async () => {
			table = await setupTable(rangeOptions);

			click("a1");

			press("A");
			expect(document.querySelector(".tabulator-moving")).toBeNull();
			expect(rangeFields()).toEqual(["a1", "a2"]);

			hover("b2", 80);
			release();

			expectOrder(leafFields);
			expect(columnMoved).not.toHaveBeenCalled();
			expect(rangeFields()).toEqual(["a1", "a2", "b1", "b2"]);
		});

		test.each([
			["a group holding a leaf and a nested group", "G", [], ["g1", "h1", "h2"]],
			["a nested group", "H", [], ["h1", "h2"]],
			["a group with a hidden leaf", "A", ["a2"], ["a1"]],
		])('a click on %s selects its visible leaves', async (_name, title, hidden, expected) => {
			table = await setupTable(rangeOptions);

			hidden.forEach((field) => table.hideColumn(field));

			click(title);

			expect(rangeFields()).toEqual(expected);
		});

		test.each([
			["from a column on its left", "x", ["x", "a1", "a2"]],
			["from a column on its right", "b1", ["a1", "a2", "b1"]],
		])('a shift-click on a group header extends the range over the whole group %s', async (_name, start, expected) => {
			table = await setupTable(rangeOptions);

			click(start);
			click("A", {shiftKey:true});

			expect(table.getRanges().length).toBe(1);
			expect(rangeFields()).toEqual(expected);
		});

		test('a shift-click on a group header from one of its leaves keeps the start on that leaf', async () => {
			table = await setupTable(rangeOptions);

			click("a2");
			click("A", {shiftKey:true});

			expect(table.getRanges().length).toBe(1);
			expect(rangeFields()).toEqual(["a2"]);
		});

		test('a ctrl-click on a group header adds a range over its leaves', async () => {
			table = await setupTable(rangeOptions);

			click("x");
			click("A", {ctrlKey:true});

			expect(table.getRanges().length).toBe(2);
			expect(rangeFields(0)).toEqual(["x"]);
			expect(rangeFields(1)).toEqual(["a1", "a2"]);
		});

		test('a right-click on a selected group header keeps the range', async () => {
			table = await setupTable(rangeOptions);

			click("A");
			click("A", {button:2, which:3});

			expect(rangeFields()).toEqual(["a1", "a2"]);
		});

		test('a selection dragged from a column onto a group header covers the whole group', async () => {
			table = await setupTable(rangeOptions);

			mouse("mousedown", titleOf("x"));
			mouse("mousemove", titleOf("A"));
			release();

			expect(rangeFields()).toEqual(["x", "a1", "a2"]);
		});

		test.each([
			["movableColumnGroups", {movableColumnGroups:undefined}],
			["movableColumns", {movableColumns:false}],
		])('with %s unset, a click on a group header keeps upstream\'s empty range', async (_name, unset) => {
			table = await setupTable({...rangeOptions, ...unset});

			click("A");

			expect(edges()).toEqual([-1, -1]);
			expect(rangeFields()).toEqual([]);
		});
	});

	test('with column persistence, the saved layout holds the new group order', async () => {
		table = await setupTable({persistence:{columns:true}, persistenceID:"move-groups"});

		drag("A", "b2", 80);

		const saved = JSON.parse(localStorage.getItem("tabulator-move-groups-columns"));

		expect(saved.map((column) => column.title)).toEqual(["x", "B", "A", "G"]);
	});
});
