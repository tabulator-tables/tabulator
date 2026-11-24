import TabulatorFull from '../../../src/js/core/TabulatorFull.js';

// Integration tests for dragging a column header by touch.
// Kept apart from MoveColumns.spec.js, which stubs document.createElement and
// Module.prototype without restoring them.
describe('MoveColumns touch drag', () => {
	let table;
	let columnMoved;
	let originalWidth, originalHeight;

	// jsdom has no layout; rows render only into an element with a size
	const sizedElement = {configurable:true, get(){ return 20; }};

	const leafFields = ["x", "a1", "a2", "b1", "b2", "y"];

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
		{title:"y", field:"y"},
	];

	const setupTable = async (tableOptions = {}) => {
		document.body.innerHTML = '<div id="test-table"></div>';

		const options = {
			data:makeData(3, leafFields),
			columns:defaultColumns(),
			columnDefaults:{width:50, headerSort:false},
			renderVertical:"basic",
			movableColumns:true,
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

	const touch = (type, element, pageX) => {
		var event = new Event(type, {bubbles:true, cancelable:true});

		Object.defineProperty(event, "touches", {value:[{pageX}]});
		element.dispatchEvent(event);
	};

	// A press, the hold delay, then `steps` moves of 60px (more than half a 50px column each)
	// in one direction (1 right, -1 left), then a release.
	const swipe = (title, steps, direction = 1) => {
		var element = findColumn(title).getElement(),
		pageX = 400;

		touch("touchstart", element, pageX);
		jest.advanceTimersByTime(250);

		// the first move only sets the anchor of the drag
		touch("touchmove", element, pageX);

		for(let i = 0; i < steps; i++){
			pageX += 60 * direction;
			touch("touchmove", element, pageX);
		}

		touch("touchend", element, pageX);
	};

	const fields = () => table.getColumns().map((column) => column.getField());

	const headerFields = () => [...table.element.querySelectorAll(".tabulator-headers .tabulator-col[tabulator-field]")].map((el) => el.getAttribute("tabulator-field"));

	const topTitles = () => table.getColumns(true).map((column) => column.getDefinition().title);

	const rowDomFields = () => table.getRows().map((row) => [...row.getElement().querySelectorAll(".tabulator-cell")].map((el) => el.getAttribute("tabulator-field")));

	const rowCellFields = () => table.getRows().map((row) => row.getCells().map((cell) => cell.getField()));

	const snapshot = () => ({
		fields:fields(),
		headerFields:headerFields(),
		topTitles:topTitles(),
		rowDomFields:rowDomFields(),
		rowCellFields:rowCellFields(),
	});

	const expectOrder = (expected) => {
		expect(fields()).toEqual(expected);
		expect(headerFields()).toEqual(expected);
		rowDomFields().forEach((rowFields) => expect(rowFields).toEqual(expected));
		rowCellFields().forEach((rowFields) => expect(rowFields).toEqual(expected));
	};

	const expectCleanDrop = () => {
		expect(document.querySelector(".tabulator-col-placeholder")).toBeNull();
		expect(document.querySelector(".tabulator-moving")).toBeNull();
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

	describe('a column dragged onto a target the mouse would refuse stays where it is', () => {
		it.each([
			['a leaf dragged past its group\'s edge stays in its group', "a2", 1],
			['a leaf of the next group dragged back past its group\'s edge stays in its group', "b1", -1],
			['a top-level column dragged onto a leaf of a group stays beside the group', "x", 1],
		])('%s', async (name, title, direction) => {
			table = await setupTable();

			swipe(title, 1, direction);

			expectOrder(leafFields);
			expect(topTitles()).toEqual(["x", "A", "B", "y"]);
			expect(columnMoved).not.toHaveBeenCalled();
			expectCleanDrop();
		});

		it('a column dragged onto a frozen neighbour does not move', async () => {
			var columns = defaultColumns();

			columns[0].frozen = true;
			columns.splice(1, 2, {title:"z", field:"z"});

			table = await setupTable({columns, data:makeData(3, ["x", "z", "y"])});

			swipe("z", 1, -1);

			expectOrder(["x", "z", "y"]);
			expect(topTitles()).toEqual(["x", "z", "y"]);
			expect(columnMoved).not.toHaveBeenCalled();
			expectCleanDrop();
		});

		it('a column dragged onto the row header does not move', async () => {
			table = await setupTable({rowHeader:true});

			let before = snapshot();

			swipe("x", 1, -1);

			expect(snapshot()).toEqual(before);
			expect(columnMoved).not.toHaveBeenCalled();
			expectCleanDrop();
		});
	});

	describe('a column dragged onto a sibling moves', () => {
		it('a leaf dragged over its group sibling and then out of the group lands after its sibling', async () => {
			table = await setupTable();

			swipe("a1", 3);

			expectOrder(["x", "a2", "a1", "b1", "b2", "y"]);
			expect(topTitles()).toEqual(["x", "A", "B", "y"]);
			expect(columnMoved).toHaveBeenCalledTimes(1);
			expect(columnMoved.mock.calls[0][0]).toBe(findColumn("a1"));
			expectCleanDrop();
		});

		it('a leaf dragged over its group sibling swaps with it', async () => {
			table = await setupTable();

			swipe("a1", 1);

			expectOrder(["x", "a2", "a1", "b1", "b2", "y"]);
			expect(columnMoved).toHaveBeenCalledTimes(1);
			expectCleanDrop();
		});

		it('a top-level column dragged across a group lands beside the next top-level column', async () => {
			table = await setupTable();

			swipe("x", 5);

			expectOrder(["a1", "a2", "b1", "b2", "y", "x"]);
			expect(topTitles()).toEqual(["A", "B", "y", "x"]);
			expect(columnMoved).toHaveBeenCalledTimes(1);
			expect(columnMoved.mock.calls[0][0]).toBe(findColumn("x"));
			expectCleanDrop();
		});
	});
});
