import TabulatorFull from "../../../src/js/core/TabulatorFull";

// Integration tests for ReactiveData: the other ReactiveData specs mock the
// row manager, so they can't see the order rows end up in on the table.

describe("ReactiveData row order", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    let data;

    const tableIds = () => tabulator.getRows().map((row) => row.getData().id);
    const sourceIds = () => data.map((row) => row.id);

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "reactive-data-integration";
        document.body.appendChild(el);

        data = [{ id: 10 }, { id: 20 }];

        tabulator = new TabulatorFull("#reactive-data-integration", {
            reactiveData: true,
            data,
            columns: [{ title: "ID", field: "id" }],
        });

        await new Promise((resolve) => {
            tabulator.on("tableBuilt", resolve);
        });
    });

    afterEach(() => {
        tabulator.destroy();
        document.getElementById("reactive-data-integration")?.remove();
    });

    // https://github.com/tabulator-tables/tabulator/issues/5005
    it("keeps the order of several rows added with unshift()", () => {
        data.unshift({ id: 1 }, { id: 2 });

        expect(sourceIds()).toEqual([1, 2, 10, 20]);
        expect(tableIds()).toEqual([1, 2, 10, 20]);
    });

    // https://github.com/tabulator-tables/tabulator/issues/5005
    it("adds rows spliced in at the end to the bottom of the table", () => {
        data.splice(data.length, 0, { id: 1 }, { id: 2 });

        expect(sourceIds()).toEqual([10, 20, 1, 2]);
        expect(tableIds()).toEqual([10, 20, 1, 2]);
    });

    it("keeps the order of rows spliced in at the start", () => {
        data.splice(0, 0, { id: 1 }, { id: 2 });

        expect(sourceIds()).toEqual([1, 2, 10, 20]);
        expect(tableIds()).toEqual([1, 2, 10, 20]);
    });

    it("keeps the order of rows spliced in the middle", () => {
        data.splice(1, 0, { id: 1 }, { id: 2 });

        expect(sourceIds()).toEqual([10, 1, 2, 20]);
        expect(tableIds()).toEqual([10, 1, 2, 20]);
    });

    it("keeps the order when a single row is unshifted or pushed", () => {
        data.unshift({ id: 1 });
        data.push({ id: 2 });

        expect(sourceIds()).toEqual([1, 10, 20, 2]);
        expect(tableIds()).toEqual([1, 10, 20, 2]);
    });
});
