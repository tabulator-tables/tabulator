import calculations from "../../../src/js/modules/ColumnCalcs/defaults/calculations.js";

describe("ColumnCalcs default calculations", () => {
    describe("count", () => {
        const count = (values) => calculations.count(values, [], {});

        test("counts cells with a value of 0 or false", () => {
            expect(count([0, 5, 3, null, ""])).toBe(3);
            expect(count([0, 0, 0])).toBe(3);
            expect(count([false, true])).toBe(2);
        });

        test("does not count null, undefined or empty string cells", () => {
            expect(count([null, undefined, ""])).toBe(0);
            expect(count(["a", null, "b", undefined, ""])).toBe(2);
        });

        test("returns 0 for no values", () => {
            expect(count([])).toBe(0);
        });
    });
});
