import Rect from "../../../../src/js/core/tools/Rect";

describe("Rect", () => {
	test("zero() returns a rect with all bounds at 0", () => {
		expect(Rect.zero()).toEqual(new Rect(0, 0, 0, 0));
	});

	test("clone() returns a Rect with the same bounds", () => {
		const rect = new Rect(1, 2, 3, 4).clone();

		expect(rect).toBeInstanceOf(Rect);
		expect(rect).toEqual(new Rect(1, 2, 3, 4));
	});

	test("clone() returns a copy that is independent of the source", () => {
		const source = new Rect(1, 2, 3, 4);
		const copy = source.clone();

		source.top = 10;

		expect(copy).not.toBe(source);
		expect(copy.top).toBe(1);
	});

	test("equals() is true only when all bounds match", () => {
		const rect = new Rect(1, 2, 3, 4);

		expect(rect.equals(new Rect(1, 2, 3, 4))).toBe(true);
		expect(rect.equals(new Rect(0, 2, 3, 4))).toBe(false);
		expect(rect.equals(new Rect(1, 0, 3, 4))).toBe(false);
		expect(rect.equals(new Rect(1, 2, 0, 4))).toBe(false);
		expect(rect.equals(new Rect(1, 2, 3, 0))).toBe(false);
	});

	test("hasPoint() is true only for points inside the bounds, edges included", () => {
		const rect = new Rect(1, 2, 3, 4);

		expect(rect.hasPoint(3, 1)).toBe(true);
		expect(rect.hasPoint(4, 2)).toBe(true);
		expect(rect.hasPoint(3, 0)).toBe(false);
		expect(rect.hasPoint(3, 3)).toBe(false);
		expect(rect.hasPoint(2, 1)).toBe(false);
		expect(rect.hasPoint(5, 1)).toBe(false);
	});

	test("forEach() visits every x/y point", () => {
		const visited = [];

		new Rect(1, 2, 3, 4).forEach((x, y) => visited.push([x, y]));

		expect(visited).toEqual([
			[3, 1],
			[4, 1],
			[3, 2],
			[4, 2],
		]);
	});
});
