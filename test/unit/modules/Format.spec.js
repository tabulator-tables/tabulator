import TabulatorFull from "../../../src/js/core/TabulatorFull";
import Format from "../../../src/js/modules/Format/Format";
import { DateTime } from "luxon";

describe("Format module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {Format} */
    let formatMod;
    let tableData = [
        { id: 1, name: "John", active: true, balance: 1250.75, date: "2021-05-10" },
        { id: 2, name: "Jane", active: false, balance: 750.50, date: "2022-03-15" },
        { id: 3, name: "Bob", active: true, balance: 325.20, date: "2020-12-01" }
    ];
    let tableColumns = [
        { title: "ID", field: "id" },
        { title: "Name", field: "name" },
        { title: "Active", field: "active", formatter: "tickCross" },
        { title: "Balance", field: "balance", formatter: "money", formatterParams: { symbol: "$" } },
        { title: "Date", field: "date", formatter: "datetime", formatterParams: { outputFormat: "DD/MM/YYYY" } }
    ];

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            data: tableData,
            columns: tableColumns
        });
        formatMod = tabulator.module("format");
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

    it("should initialize formatters for columns", () => {
        const columns = tabulator.columnManager.getColumns();
        
        // Check if formatters are properly set
        expect(columns[0].modules.format.formatter).toBeDefined();
        expect(columns[2].modules.format.formatter).toBeDefined();
        expect(columns[3].modules.format.formatter).toBeDefined();
        expect(columns[4].modules.format.formatter).toBeDefined();
    });

    it("should sanitize HTML properly", () => {
        // Test with HTML content
        const html = "<script>alert('test')</script><b>Hello</b>";
        const sanitized = formatMod.sanitizeHTML(html);
        
        // Check XSS is prevented
        expect(sanitized).not.toContain("<script>");
        expect(sanitized).not.toContain("</script>");
        expect(sanitized).not.toContain("<b>");
        expect(sanitized).not.toContain("</b>");
        
        // Check correct HTML entities are used
        expect(sanitized).toContain("&lt;script&gt;");
        expect(sanitized).toContain("&lt;b&gt;");
    });

    it("should convert empty values to space", () => {
        expect(formatMod.emptyToSpace(null)).toBe("&nbsp;");
        expect(formatMod.emptyToSpace(undefined)).toBe("&nbsp;");
        expect(formatMod.emptyToSpace("")).toBe("&nbsp;");
        expect(formatMod.emptyToSpace("test")).toBe("test");
        expect(formatMod.emptyToSpace(0)).toBe(0);
    });

    it("should handle lookupFormatter", () => {
        // Test with a string formatter name
        const stringFormatter = formatMod.lookupFormatter("plaintext");
        expect(typeof stringFormatter).toBe("function");
        
        // Test with a function formatter
        const funcFormatter = function(cell) { return cell; };
        const returnedFuncFormatter = formatMod.lookupFormatter(funcFormatter);
        expect(returnedFuncFormatter).toBe(funcFormatter);
        
        // Test with non-existent formatter name
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const defaultFormatter = formatMod.lookupFormatter("nonExistentFormatter");
        expect(consoleWarnSpy).toHaveBeenCalled();
        expect(typeof defaultFormatter).toBe("function");
        
        // Clean up
        consoleWarnSpy.mockRestore();
    });

    it("should create proper type formatters", () => {
        const column = {
            definition: {
                formatter: "money",
                formatterParams: { symbol: "$" },
                formatterPrint: "plaintext",
                formatterPrintParams: { prefix: "Print-" }
            }
        };
        
        const config = formatMod.lookupTypeFormatter(column, "");
        expect(config.formatter).toBeDefined();
        expect(config.params).toEqual({ symbol: "$" });
        
        const printConfig = formatMod.lookupTypeFormatter(column, "Print");
        expect(printConfig.formatter).toBeDefined();
        expect(printConfig.params).toEqual({ prefix: "Print-" });
    });
});

describe("Format module - 'x' (epoch milliseconds) input format", () => {
    // 2021-05-10T00:00:00.000Z
    const EPOCH_MS = 1620604800000;

    /** @type {TabulatorFull} */
    let tabulator;

    // Builds a table with luxon injected as a dependency, the way a consumer
    // would wire it in, then resolves once the table (and its cells) are rendered.
    const buildTable = async (columns, data) => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            dependencies: { luxon: { DateTime } },
            data,
            columns,
        });
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => resolve());
        });
    };

    afterEach(() => {
        tabulator.destroy();
        document.getElementById("tabulator")?.remove();
    });

    it("datetime formatter parses an epoch-ms value via inputFormat 'x'", async () => {
        await buildTable(
            [{
                title: "TS", field: "ts", formatter: "datetime",
                formatterParams: { inputFormat: "x", outputFormat: "yyyy-MM-dd", timezone: "UTC" },
            }],
            [{ id: 1, ts: EPOCH_MS }]
        );

        const cellEl = tabulator.getRows()[0].getCell("ts").getElement();
        expect(cellEl.innerHTML).toBe("2021-05-10");
    });

    it("datetimediff formatter measures the diff of an epoch-ms value via inputFormat 'x'", async () => {
        await buildTable(
            [{
                title: "TS", field: "ts", formatter: "datetimediff",
                formatterParams: { inputFormat: "x", unit: "days", date: DateTime.fromMillis(EPOCH_MS) },
            }],
            [{ id: 1, ts: EPOCH_MS + 3 * 24 * 60 * 60 * 1000 }]
        );

        const cellEl = tabulator.getRows()[0].getCell("ts").getElement();
        expect(cellEl.innerHTML).toBe("3");
    });
});

describe("Format module - formatters with BigInt values", () => {
    // Fix https://github.com/tabulator-tables/tabulator/pull/4895
    // The star formatter called isNaN() on the raw cell value, which throws
    // "Cannot convert a BigInt value to a number" for BigInt values. Number.isNaN()
    // never coerces its argument, so it is safe for BigInt (and any other type).

    /** @type {TabulatorFull} */
    let tabulator;

    const buildTable = async (columns, data) => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", { data, columns });
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => resolve());
        });
    };

    afterEach(() => {
        tabulator?.destroy();
        document.getElementById("tabulator")?.remove();
    });

    it("star formatter renders the correct number of stars for a BigInt value", async () => {
        await buildTable(
            [{ title: "Rating", field: "rating", formatter: "star", formatterParams: { stars: 5 } }],
            [{ id: 1, rating: 3n }]
        );

        const cellEl = tabulator.getRows()[0].getCell("rating").getElement();
        const stars = cellEl.querySelectorAll("svg");
        const activeStars = cellEl.querySelectorAll('polygon[fill="#FFEA00"]');

        expect(stars.length).toBe(5);
        expect(activeStars.length).toBe(3);
    });
});

describe("Format module - cell placeholders", () => {
    /** @type {TabulatorFull} */
    let tabulator;

    const buildTable = async (columns, data) => {
        const el = document.createElement("div");
        el.id = "tabulator-placeholder-test";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator-placeholder-test", { data, columns });
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => resolve());
        });
    };

    afterEach(() => {
        tabulator?.destroy();
        document.getElementById("tabulator-placeholder-test")?.remove();
    });

    it("displays placeholder text and adds tabulator-cell-placeholder class when cell value is empty", async () => {
        await buildTable(
            [
                { title: "Name", field: "name", placeholder: "Unknown Name" },
                { title: "DOB", field: "dob", formatter: "plaintext", placeholder: "Unknown" },
            ],
            [
                { id: 1, name: "Alice", dob: "1990-01-01" },
                { id: 2, name: null, dob: null },
                { id: 3, name: "", dob: undefined },
            ]
        );

        const rows = tabulator.getRows();
        
        // Row 1: non-empty values
        const row1Name = rows[0].getCell("name").getElement();
        const row1Dob = rows[0].getCell("dob").getElement();
        expect(row1Name.innerHTML).toBe("Alice");
        expect(row1Name.classList.contains("tabulator-cell-placeholder")).toBe(false);
        expect(row1Dob.innerHTML).toBe("1990-01-01");
        expect(row1Dob.classList.contains("tabulator-cell-placeholder")).toBe(false);

        // Row 2: null values
        const row2Name = rows[1].getCell("name").getElement();
        const row2Dob = rows[1].getCell("dob").getElement();
        expect(row2Name.innerHTML).toBe("Unknown Name");
        expect(row2Name.classList.contains("tabulator-cell-placeholder")).toBe(true);
        expect(row2Dob.innerHTML).toBe("Unknown");
        expect(row2Dob.classList.contains("tabulator-cell-placeholder")).toBe(true);

        // Row 3: empty string and undefined
        const row3Name = rows[2].getCell("name").getElement();
        const row3Dob = rows[2].getCell("dob").getElement();
        expect(row3Name.innerHTML).toBe("Unknown Name");
        expect(row3Name.classList.contains("tabulator-cell-placeholder")).toBe(true);
        expect(row3Dob.innerHTML).toBe("Unknown");
        expect(row3Dob.classList.contains("tabulator-cell-placeholder")).toBe(true);
    });

    it("does not treat 0 or false as empty", async () => {
        await buildTable(
            [
                { title: "Count", field: "count", placeholder: "No Count" },
                { title: "Active", field: "active", placeholder: "No Status" },
            ],
            [
                { id: 1, count: 0, active: false }
            ]
        );

        const cellCount = tabulator.getRows()[0].getCell("count").getElement();
        const cellActive = tabulator.getRows()[0].getCell("active").getElement();
        expect(cellCount.innerHTML).toBe("0");
        expect(cellCount.classList.contains("tabulator-cell-placeholder")).toBe(false);
        expect(cellActive.innerHTML).toBe("false");
        expect(cellActive.classList.contains("tabulator-cell-placeholder")).toBe(false);
    });

    it("updates placeholder and class reactively when cell value changes", async () => {
        await buildTable(
            [
                { title: "DOB", field: "dob", placeholder: "Unknown" },
            ],
            [
                { id: 1, dob: null }
            ]
        );

        const cell = tabulator.getRows()[0].getCell("dob");
        expect(cell.getElement().innerHTML).toBe("Unknown");
        expect(cell.getElement().classList.contains("tabulator-cell-placeholder")).toBe(true);

        // Set non-empty value
        cell.setValue("1995-10-20");
        expect(cell.getElement().innerHTML).toBe("1995-10-20");
        expect(cell.getElement().classList.contains("tabulator-cell-placeholder")).toBe(false);

        // Set back to empty string
        cell.setValue("");
        expect(cell.getElement().innerHTML).toBe("Unknown");
        expect(cell.getElement().classList.contains("tabulator-cell-placeholder")).toBe(true);
    });

    it("supports placeholder as a function", async () => {
        await buildTable(
            [
                {
                    title: "DOB",
                    field: "dob",
                    placeholder: (cell) => `Missing ${cell.getField()} for ${cell.getData().name}`
                },
            ],
            [
                { id: 1, name: "Charlie", dob: null }
            ]
        );

        const cell = tabulator.getRows()[0].getCell("dob");
        expect(cell.getElement().innerHTML).toBe("Missing dob for Charlie");
        expect(cell.getElement().classList.contains("tabulator-cell-placeholder")).toBe(true);
    });

    it("supports placeholder returning an HTMLElement Node", async () => {
        await buildTable(
            [
                {
                    title: "Status",
                    field: "status",
                    placeholder: () => {
                        const span = document.createElement("span");
                        span.className = "custom-badge";
                        span.textContent = "N/A";
                        return span;
                    }
                },
            ],
            [
                { id: 1, status: null }
            ]
        );

        const cell = tabulator.getRows()[0].getCell("status");
        expect(cell.getElement().classList.contains("tabulator-cell-placeholder")).toBe(true);
        const badge = cell.getElement().querySelector(".custom-badge");
        expect(badge).not.toBeNull();
        expect(badge.textContent).toBe("N/A");
    });

    it("supports placeholder formatter directly and cellPlaceholder", async () => {
        await buildTable(
            [
                { title: "Status", field: "status", formatter: "placeholder", formatterParams: { placeholder: "Pending Review" } },
                { title: "Alt", field: "alt", cellPlaceholder: "Alt Placeholder" },
            ],
            [
                { id: 1, status: "anything", alt: null }
            ]
        );

        const cellStatus = tabulator.getRows()[0].getCell("status");
        expect(cellStatus.getElement().innerHTML).toBe("Pending Review");
        expect(cellStatus.getElement().classList.contains("tabulator-cell-placeholder")).toBe(true);

        const cellAlt = tabulator.getRows()[0].getCell("alt");
        expect(cellAlt.getElement().innerHTML).toBe("Alt Placeholder");
        expect(cellAlt.getElement().classList.contains("tabulator-cell-placeholder")).toBe(true);
    });

    it("allows direct access to formatPlaceholder in custom formatters", async () => {
        await buildTable(
            [
                {
                    title: "Age",
                    field: "age",
                    formatter: function(cell) {
                        const val = cell.getValue();
                        if (val < 0) {
                            return this.formatPlaceholder(cell, "Invalid age");
                        }
                        return val;
                    }
                },
            ],
            [
                { id: 1, age: -5 },
                { id: 2, age: 25 },
            ]
        );

        const rows = tabulator.getRows();
        const invalidCell = rows[0].getCell("age").getElement();
        const validCell = rows[1].getCell("age").getElement();

        expect(invalidCell.innerHTML).toBe("Invalid age");
        expect(invalidCell.classList.contains("tabulator-cell-placeholder")).toBe(true);

        expect(validCell.innerHTML).toBe("25");
        expect(validCell.classList.contains("tabulator-cell-placeholder")).toBe(false);
    });

    it("applies placeholder to formatExportValue when value is empty", () => {
        const formatModule = tabulator.module("format");
        const column = {
            definition: {
                field: "dob",
                placeholder: "Export Unknown"
            },
            modules: {
                format: {
                    params: {},
                    formatter: Format.formatters.plaintext
                }
            }
        };
        const el = document.createElement("div");
        const cell = {
            column,
            getValue: () => null,
            getElement: () => el,
            getComponent: function() { return this; }
        };

        const result = formatModule.formatExportValue(cell, "Print");
        expect(result).toBe("Export Unknown");
        expect(el.classList.contains("tabulator-cell-placeholder")).toBe(true);
    });
});