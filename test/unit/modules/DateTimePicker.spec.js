import TabulatorFull from "../../../src/js/core/TabulatorFull";
import { DateTime } from "luxon";
import { parseValue, formatValue, nowParts, localParts, addDays, addMonths, daysInMonth } from "../../../src/js/modules/DateTimePicker/dateParts";

describe("DateTimePicker value conversion", () => {
	describe("parseValue", () => {
		it.each([
			["2026-10-07", { year: 2026, month: 10, day: 7 }, { date: true, time: false, suffix: "" }],
			["2026-10-07 09:05:30", { year: 2026, month: 10, day: 7, hour: 9, minute: 5, second: 30 }, { separator: " ", seconds: true, fraction: "" }],
			["2026-10-07T09:05", { year: 2026, month: 10, day: 7, hour: 9, minute: 5, second: 0 }, { separator: "T", seconds: false }],
			["2026-10-07T09:05:30.123456Z", { year: 2026, month: 10, day: 7, hour: 9, minute: 5, second: 30 }, { fraction: ".123456", suffix: "Z" }],
			["2026-10-07 09:05:30+05:30", { year: 2026, month: 10, day: 7, hour: 9, minute: 5, second: 30 }, { suffix: "+05:30" }],
			["09:05", { hour: 9, minute: 5, second: 0 }, { date: false, time: true, seconds: false }],
			["21:15:59.5+02", { hour: 21, minute: 15, second: 59 }, { date: false, fraction: ".5", suffix: "+02" }],
		])("reads %p", (value, parts, shape) => {
			const result = parseValue(value);

			expect(result.parts).toEqual(parts);
			expect(result.shape).toMatchObject({ type: "string", ...shape });
		});

		it.each([null, undefined, "", "not a date", "2026-13-01", "2026-02-30", "2026-10-07 25:00", "12:61"])("treats %p as empty", (value) => {
			expect(parseValue(value).parts).toBeNull();
		});

		it("reads Date objects and timestamps in local time", () => {
			const date = new Date(2026, 9, 7, 9, 5, 30, 250);

			expect(parseValue(date)).toEqual({ parts: { year: 2026, month: 10, day: 7, hour: 9, minute: 5, second: 30 }, shape: { type: "date", millisecond: 250 } });
			expect(parseValue(date.getTime()).shape).toEqual({ type: "number", millisecond: 250 });
			expect(parseValue(new Date("nope")).parts).toBeNull();
		});
	});

	describe("formatValue", () => {
		const parts = { year: 2026, month: 3, day: 4, hour: 5, minute: 6, second: 7 };

		it("creates new values in ISO style", () => {
			expect(formatValue(parts, "date")).toBe("2026-03-04");
			expect(formatValue(parts, "time")).toBe("05:06:07");
			expect(formatValue(parts, "datetime")).toBe("2026-03-04T05:06:07");
			expect(formatValue({ ...parts, second: 0 }, "datetime", undefined, { seconds: false })).toBe("2026-03-04T05:06");
		});

		it.each([
			["2026-10-07 09:05:30", "datetime", "2026-03-04 05:06:07"],
			["2026-10-07T09:05:30.123Z", "datetime", "2026-03-04T05:06:07.123Z"],
			["2026-10-07 09:05:30+05:30", "date", "2026-03-04 05:06:07+05:30"],
			["2026-10-07 09:05", "time", "2026-03-04 05:06:07"],
			["09:05+02", "time", "05:06:07+02"],
			["2026-10-07", "datetime", "2026-03-04T05:06:07"],
		])("keeps the style of %p", (original, mode, expected) => {
			expect(formatValue(parts, mode, parseValue(original).shape)).toBe(expected);
		});

		it("only adds seconds to a value without them when they are set", () => {
			const shape = parseValue("09:05").shape;

			expect(formatValue({ hour: 10, minute: 30, second: 0 }, "time", shape)).toBe("10:30");
			expect(formatValue({ hour: 10, minute: 30, second: 15 }, "time", shape)).toBe("10:30:15");
		});

		it("returns Date objects and timestamps for those types", () => {
			const date = formatValue(parts, "datetime", { type: "date", millisecond: 9 });

			expect(date).toBeInstanceOf(Date);
			expect(date.getFullYear()).toBe(2026);
			expect(date.getMonth()).toBe(2);
			expect(date.getDate()).toBe(4);
			expect(date.getHours()).toBe(5);
			expect(date.getMilliseconds()).toBe(9);

			expect(formatValue(parts, "datetime", { type: "number", millisecond: 0 })).toBe(new Date(2026, 2, 4, 5, 6, 7).getTime());
		});

		it("does not treat two digit years as 19xx", () => {
			expect(formatValue({ year: 50, month: 1, day: 2 }, "datetime", { type: "date" }).getFullYear()).toBe(50);
			expect(formatValue({ year: 50, month: 1, day: 2 }, "date")).toBe("0050-01-02");
		});
	});

	describe("nowParts", () => {
		afterEach(() => {
			jest.restoreAllMocks();
		});

		it("uses the offset written in the original value", () => {
			jest.spyOn(Date, "now").mockReturnValue(Date.UTC(2026, 0, 1, 23, 30, 15));

			expect(nowParts(parseValue("2026-10-07T09:05:30Z").shape)).toEqual({ year: 2026, month: 1, day: 1, hour: 23, minute: 30, second: 15 });
			expect(nowParts(parseValue("2026-10-07 09:05:30+05:30").shape)).toEqual({ year: 2026, month: 1, day: 2, hour: 5, minute: 0, second: 15 });
			expect(nowParts(parseValue("09:05-03").shape)).toEqual({ year: 2026, month: 1, day: 1, hour: 20, minute: 30, second: 15 });
		});

		it("otherwise uses local time", () => {
			const before = localParts(new Date());
			const now = nowParts(parseValue("2026-10-07").shape);

			expect(now.year).toBe(before.year);
			expect(now.month).toBe(before.month);
		});
	});

	describe("date arithmetic", () => {
		it("knows month lengths", () => {
			expect(daysInMonth(2024, 2)).toBe(29);
			expect(daysInMonth(2026, 2)).toBe(28);
			expect(daysInMonth(2026, 12)).toBe(31);
		});

		it("moves by days across months and years", () => {
			expect(addDays({ year: 2026, month: 12, day: 31 }, 1)).toEqual({ year: 2027, month: 1, day: 1 });
			expect(addDays({ year: 2026, month: 3, day: 1 }, -1)).toEqual({ year: 2026, month: 2, day: 28 });
		});

		it("moves by months, keeping the day inside the month", () => {
			expect(addMonths({ year: 2026, month: 1, day: 31 }, 1)).toEqual({ year: 2026, month: 2, day: 28 });
			expect(addMonths({ year: 2026, month: 1, day: 15 }, -1)).toEqual({ year: 2025, month: 12, day: 15 });
			expect(addMonths({ year: 2026, month: 11, day: 15 }, 14)).toEqual({ year: 2028, month: 1, day: 15 });
		});
	});
});

describe("DateTimePicker module", () => {
	let table;

	async function buildTable(column, data, options = {}){
		const el = document.createElement("div");
		document.body.appendChild(el);

		table = new TabulatorFull(el, {
			height: 300,
			renderVertical: "basic",
			data: [Object.assign({ id: 1 }, data)],
			columns: [{ title: "ID", field: "id" }, { title: "Value", field: "value", editor: "input", ...column }],
			...options,
		});

		await new Promise((resolve) => table.on("tableBuilt", resolve));

		table.redraw(true);

		return table;
	}

	function cell(){
		return table.getRows()[0].getCell("value");
	}

	function openPicker(){
		cell().getElement().dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
		cell().getElement().querySelector(".tabulator-cell-button").click();

		return document.querySelector(".tabulator-datetime-picker");
	}

	function picker(){
		return document.querySelector(".tabulator-datetime-picker");
	}

	function day(date){
		return picker().querySelector(`.tabulator-datetime-picker-day[data-date="${date}"]`);
	}

	function timeInput(key){
		return picker().querySelector(".tabulator-datetime-picker-" + key);
	}

	function setTime(key, value){
		const input = timeInput(key);

		input.value = value;
		input.dispatchEvent(new Event("change"));
	}

	function footerButton(name){
		return picker().querySelector(".tabulator-datetime-picker-" + name);
	}

	function key(target, name){
		target.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true }));
	}

	afterEach(() => {
		if(table){
			table.destroy();
			table = null;
		}

		document.body.innerHTML = "";
		jest.restoreAllMocks();
	});

	describe("date picker", () => {
		it("shows the month of the cell's date with it selected", async () => {
			await buildTable({ cellButton: "date" }, { value: "2026-10-07" });

			const el = openPicker();

			expect(el.getAttribute("role")).toBe("dialog");
			expect(el.querySelector(".tabulator-datetime-picker-month").textContent).toBe("October");
			expect(el.querySelector(".tabulator-datetime-picker-year").value).toBe("2026");
			expect(el.querySelectorAll(".tabulator-datetime-picker-day").length).toBe(42);
			expect(el.querySelectorAll(".tabulator-datetime-picker-day-selected").length).toBe(1);
			expect(day("2026-10-07").classList.contains("tabulator-datetime-picker-day-selected")).toBe(true);
			expect(day("2026-10-07").tabIndex).toBe(0);
			expect(day("2026-09-27").classList.contains("tabulator-datetime-picker-day-other")).toBe(true);
			expect(el.querySelector(".tabulator-datetime-picker-time")).toBeNull();
			expect(el.querySelector(".tabulator-datetime-picker-apply")).toBeNull();
			expect(document.activeElement).toBe(day("2026-10-07"));
		});

		it("sets the value and closes when a day is picked", async () => {
			const cellEdited = jest.fn();

			await buildTable({ cellButton: "date" }, { value: "2026-10-07" });

			table.on("cellEdited", cellEdited);

			openPicker();
			day("2026-10-15").click();

			expect(cell().getValue()).toBe("2026-10-15");
			expect(cell().isEdited()).toBe(true);
			expect(cellEdited).toHaveBeenCalledTimes(1);
			expect(picker()).toBeNull();
		});

		it("keeps the time of a datetime value", async () => {
			await buildTable({ cellButton: "date" }, { value: "2026-10-07 09:05:30" });

			openPicker();
			day("2026-10-01").click();

			expect(cell().getValue()).toBe("2026-10-01 09:05:30");
		});

		it("opens on today when the cell is empty", async () => {
			const today = localParts(new Date());
			const iso = `${today.year}-${String(today.month).padStart(2, "0")}-${String(today.day).padStart(2, "0")}`;

			await buildTable({ cellButton: "date" }, { value: null });

			openPicker();

			expect(day(iso).classList.contains("tabulator-datetime-picker-day-today")).toBe(true);
			expect(day(iso).classList.contains("tabulator-datetime-picker-day-selected")).toBe(false);

			footerButton("now").click();

			expect(cell().getValue()).toBe(iso);
		});

		it("moves between months and years", async () => {
			await buildTable({ cellButton: "date" }, { value: "2026-12-15" });

			openPicker();

			picker().querySelector(".tabulator-datetime-picker-next").click();
			expect(picker().querySelector(".tabulator-datetime-picker-month").textContent).toBe("January");
			expect(picker().querySelector(".tabulator-datetime-picker-year").value).toBe("2027");

			picker().querySelector(".tabulator-datetime-picker-prev").click();
			picker().querySelector(".tabulator-datetime-picker-prev").click();
			expect(picker().querySelector(".tabulator-datetime-picker-month").textContent).toBe("November");

			const year = picker().querySelector(".tabulator-datetime-picker-year");
			year.value = "1999";
			year.dispatchEvent(new Event("change"));

			expect(picker().querySelector(".tabulator-datetime-picker-month").textContent).toBe("November");
			day("1999-11-20").click();

			expect(cell().getValue()).toBe("1999-11-20");
		});

		it("moves the focused day with the keyboard", async () => {
			await buildTable({ cellButton: "date" }, { value: "2026-10-31" });

			openPicker();

			key(day("2026-10-31"), "ArrowRight");
			expect(picker().querySelector(".tabulator-datetime-picker-month").textContent).toBe("November");
			expect(document.activeElement).toBe(day("2026-11-01"));

			key(day("2026-11-01"), "ArrowUp");
			expect(document.activeElement).toBe(day("2026-10-25"));

			key(day("2026-10-25"), "PageDown");
			expect(document.activeElement).toBe(day("2026-11-25"));
		});

		it("closes on escape without changing the value", async () => {
			await buildTable({ cellButton: "date" }, { value: "2026-10-07" });

			openPicker();
			key(day("2026-10-07"), "Escape");

			expect(picker()).toBeNull();
			expect(cell().getValue()).toBe("2026-10-07");
			expect(cell().isEdited()).toBe(false);
		});

		it("keeps keystrokes away from the table", async () => {
			const keydown = jest.fn();

			await buildTable({ cellButton: "date" }, { value: "2026-10-07" }, { popupContainer: true });

			table.element.addEventListener("keydown", keydown);

			openPicker();
			key(day("2026-10-07"), "ArrowDown");

			expect(keydown).not.toHaveBeenCalled();
		});

		it("clears the value", async () => {
			await buildTable({ cellButton: "date" }, { value: "2026-10-07" });

			openPicker();
			footerButton("clear").click();

			expect(cell().getValue()).toBeNull();
		});

		it("can hide the clear button", async () => {
			await buildTable({ cellButton: { type: "date", params: { clearable: false } } }, { value: "2026-10-07" });

			openPicker();

			expect(footerButton("clear")).toBeNull();
		});

		it("starts the week on the requested day", async () => {
			await buildTable({ cellButton: { type: "date", params: { firstDayOfWeek: 1 } } }, { value: "2026-10-07" });

			openPicker();

			expect(picker().querySelector("th").textContent).toBe("Mon");
			expect(picker().querySelector(".tabulator-datetime-picker-day").dataset.date).toBe("2026-09-28");
		});

		it("is only offered on editable cells", async () => {
			await buildTable({ editable: false, cellButton: "date" }, { value: "2026-10-07" });

			cell().getElement().dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));

			expect(cell().getElement().querySelector(".tabulator-cell-button")).toBeNull();
		});

		it("labels the button", async () => {
			await buildTable({ cellButton: "date" }, { value: "2026-10-07" });

			cell().getElement().dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));

			expect(cell().getElement().querySelector(".tabulator-cell-button").getAttribute("aria-label")).toBe("Choose date");
		});

		it("uses localized text", async () => {
			await buildTable({ cellButton: "date" }, { value: "2026-10-07" }, {
				locale: "fr-fr",
				langs: { "fr-fr": { dateTimePicker: { today: "Aujourd'hui", date: "Choisir une date" } } },
			});

			openPicker();

			expect(footerButton("now").textContent).toBe("Aujourd'hui");
			expect(picker().getAttribute("aria-label")).toBe("Choisir une date");
			expect(footerButton("clear").textContent).toBe("Clear");
		});
	});

	describe("datetime picker", () => {
		it("edits the date and time together", async () => {
			await buildTable({ cellButton: "datetime" }, { value: "2026-10-07 09:05:30" });

			openPicker();

			expect(timeInput("hour").value).toBe("09");
			expect(timeInput("minute").value).toBe("05");
			expect(timeInput("second").value).toBe("30");

			day("2026-10-20").click();

			// picking a day doesn't close a picker with a time
			expect(picker()).not.toBeNull();
			expect(day("2026-10-20").classList.contains("tabulator-datetime-picker-day-selected")).toBe(true);

			setTime("hour", "18");
			setTime("minute", "7");
			footerButton("apply").click();

			expect(cell().getValue()).toBe("2026-10-20 18:07:30");
			expect(picker()).toBeNull();
		});

		it("applies when enter is pressed in a time input", async () => {
			await buildTable({ cellButton: "datetime" }, { value: "2026-10-07T09:05:30Z" });

			openPicker();

			// typed but not yet committed with a change event
			timeInput("hour").value = "23";
			key(timeInput("hour"), "Enter");

			expect(cell().getValue()).toBe("2026-10-07T23:05:30Z");
		});

		it("steps time inputs with the arrow keys, wrapping round", async () => {
			await buildTable({ cellButton: "datetime" }, { value: "2026-10-07 23:59:00" });

			openPicker();

			key(timeInput("hour"), "ArrowUp");
			key(timeInput("minute"), "ArrowUp");
			key(timeInput("second"), "ArrowDown");

			expect(timeInput("hour").value).toBe("00");
			expect(timeInput("minute").value).toBe("00");
			expect(timeInput("second").value).toBe("59");
		});

		it("ignores invalid times", async () => {
			await buildTable({ cellButton: "datetime" }, { value: "2026-10-07 09:05:30" });

			openPicker();

			setTime("hour", "24");
			setTime("minute", "ab");

			expect(timeInput("hour").value).toBe("09");
			expect(timeInput("minute").value).toBe("05");
		});

		it("cancels without changing the value", async () => {
			await buildTable({ cellButton: "datetime" }, { value: "2026-10-07 09:05:30" });

			openPicker();
			setTime("hour", "18");
			footerButton("cancel").click();

			expect(picker()).toBeNull();
			expect(cell().getValue()).toBe("2026-10-07 09:05:30");
		});

		it("can hide the seconds input", async () => {
			await buildTable({ cellButton: { type: "datetime", params: { seconds: false } } }, { value: null });

			openPicker();

			expect(timeInput("second")).toBeNull();

			setTime("hour", "8");
			footerButton("apply").click();

			// an empty datetime picker starts on today
			expect(cell().getValue()).toMatch(/^\d{4}-\d{2}-\d{2}T08:00$/);
		});

		it("keeps Date and timestamp values as their own types", async () => {
			await buildTable({ cellButton: "datetime" }, { value: new Date(2026, 9, 7, 9, 5, 30) });

			openPicker();
			day("2026-10-08").click();
			footerButton("apply").click();

			expect(cell().getValue()).toEqual(new Date(2026, 9, 8, 9, 5, 30));

			table.destroy();
			await buildTable({ cellButton: "datetime" }, { value: new Date(2026, 9, 7, 9, 5, 30).getTime() });

			openPicker();
			setTime("minute", "45");
			footerButton("apply").click();

			expect(cell().getValue()).toBe(new Date(2026, 9, 7, 9, 45, 30).getTime());
		});

		it("sets the current time in the value's time zone", async () => {
			jest.spyOn(Date, "now").mockReturnValue(Date.UTC(2026, 4, 1, 12, 0, 0));

			await buildTable({ cellButton: "datetime" }, { value: "2026-10-07 09:05:30+02:00" });

			openPicker();
			footerButton("now").click();

			expect(cell().getValue()).toBe("2026-05-01 14:00:00+02:00");
		});

		it("keeps the picker open when validation fails", async () => {
			await buildTable({ cellButton: "datetime", validator: "required" }, { value: "2026-10-07 09:05:30" });

			openPicker();
			footerButton("clear").click();

			expect(picker()).not.toBeNull();
			expect(picker().classList.contains("tabulator-datetime-picker-invalid")).toBe(true);
			expect(cell().getValue()).toBe("2026-10-07 09:05:30");

			// let validation finish marking the cell
			await new Promise((resolve) => setTimeout(resolve));

			footerButton("apply").click();

			expect(picker()).toBeNull();
		});
	});

	describe("time picker", () => {
		it("edits a time", async () => {
			await buildTable({ cellButton: "time" }, { value: "09:05" });

			openPicker();

			expect(picker().querySelector(".tabulator-datetime-picker-calendar")).toBeNull();
			expect(document.activeElement).toBe(timeInput("hour"));
			expect(timeInput("second").value).toBe("00");

			setTime("hour", "17");
			footerButton("apply").click();

			expect(cell().getValue()).toBe("17:05");
		});

		it("creates a time with seconds for an empty cell", async () => {
			await buildTable({ cellButton: "time" }, { value: null });

			openPicker();
			setTime("minute", "30");
			footerButton("apply").click();

			expect(cell().getValue()).toBe("00:30:00");
		});
	});

	describe("custom formats", () => {
		it("uses format and parse functions", async () => {
			const parse = jest.fn((value) => {
				const [day, month, year] = value.split("/").map(Number);
				return { year, month, day };
			});
			const format = jest.fn((parts) => `${parts.day}/${parts.month}/${parts.year}`);

			await buildTable({ cellButton: { type: "date", params: { parse, format } } }, { value: "7/10/2026" });

			openPicker();

			expect(day("2026-10-07").classList.contains("tabulator-datetime-picker-day-selected")).toBe(true);

			day("2026-10-09").click();

			expect(cell().getValue()).toBe("9/10/2026");
			expect(parse.mock.calls[0][1]).toBe(cell());
			expect(format.mock.calls[0][1]).toBe(cell());
		});

		it("accepts a Date from a parse function", async () => {
			await buildTable({ cellButton: { type: "date", params: { parse: () => new Date(2026, 9, 7) } } }, { value: "whatever" });

			openPicker();

			expect(day("2026-10-07").classList.contains("tabulator-datetime-picker-day-selected")).toBe(true);
		});

		describe("with luxon", () => {
			const options = { dependencies: { luxon: { DateTime } } };

			it("reads and writes luxon format strings", async () => {
				await buildTable({ cellButton: { type: "datetime", params: { format: "dd/MM/yyyy HH:mm" } } }, { value: "07/10/2026 09:05" }, options);

				openPicker();

				expect(timeInput("hour").value).toBe("09");

				day("2026-10-12").click();
				footerButton("apply").click();

				expect(cell().getValue()).toBe("12/10/2026 09:05");
			});

			it("keeps the offset of iso values", async () => {
				await buildTable({ cellButton: { type: "datetime", params: { format: "iso" } } }, { value: "2026-10-07T09:05:30.000+05:30" }, options);

				openPicker();
				setTime("hour", "10");
				footerButton("apply").click();

				expect(cell().getValue()).toBe("2026-10-07T10:05:30.000+05:30");
			});

			it("writes timestamps and DateTime objects", async () => {
				const start = DateTime.fromObject({ year: 2026, month: 10, day: 7, hour: 9 });

				await buildTable({ cellButton: { type: "date", params: { format: true } } }, { value: start }, options);

				openPicker();
				day("2026-10-08").click();

				expect(DateTime.isDateTime(cell().getValue())).toBe(true);
				expect(cell().getValue().toISO()).toBe(start.plus({ days: 1 }).toISO());

				table.destroy();
				await buildTable({ cellButton: { type: "date", params: { format: "x" } } }, { value: start.toMillis() }, options);

				openPicker();
				day("2026-10-08").click();

				expect(cell().getValue()).toBe(start.plus({ days: 1 }).toMillis());
			});

			it("reports a missing luxon dependency", async () => {
				const error = jest.spyOn(console, "error").mockImplementation(() => {});

				await buildTable({ cellButton: { type: "date", params: { format: "dd/MM/yyyy" } } }, { value: "07/10/2026" });

				openPicker();

				expect(error).toHaveBeenCalledWith("DateTimePicker Error - The 'format' param is dependant on luxon.js");
			});
		});
	});
});
