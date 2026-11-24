import { test, expect } from "@playwright/test";
import { join } from "path";

// Pointer hit-testing over nested header elements and the hover clone's
// position need a real layout, which jsdom does not compute.
test.describe("Movable column groups", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`file://${join(__dirname, "movable-column-groups.html")}`);
		await page.waitForSelector(".tabulator-row");
	});

	// viewport rectangle of a column's header element, or of its title only
	const headerRect = (page, title, titleOnly) => page.evaluate(({ title, titleOnly }) => {
		const find = (columns) => {
			for (const column of columns) {
				if (column.getDefinition().title === title) {
					return column;
				}

				const found = find(column.getSubColumns());

				if (found) {
					return found;
				}
			}

			return null;
		};

		let el = find(window.testTable.getColumns(true)).getElement();

		if (titleOnly) {
			el = el.querySelector(".tabulator-col-title");
		}

		const rect = el.getBoundingClientRect();

		return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
	}, { title, titleOnly });

	const cellLefts = (page) => page.evaluate(() => {
		const lefts = {};

		window.testTable.getRows()[0].getCells().forEach((cell) => {
			lefts[cell.getField()] = cell.getElement().getBoundingClientRect().x;
		});

		return lefts;
	});

	const leafFields = (page) => page.evaluate(() => window.testTable.getColumns().map((column) => column.getField()));

	const press = async (page, title) => {
		const rect = await headerRect(page, title, true);

		await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
		await page.mouse.down();

		// the move starts once the press has been held past the click period
		await expect(page.locator(".tabulator-moving")).toHaveCount(1);
	};

	test("dragging a group header past a sibling group moves the whole group", async ({ page }) => {
		const groupA = await headerRect(page, "A");

		await press(page, "A");

		// the placeholder keeps the dragged group's width
		const placeholder = await page.locator(".tabulator-col-placeholder").boundingBox();
		expect(Math.round(placeholder.width)).toBe(Math.round(groupA.width));

		const b2 = await headerRect(page, "b2");
		await page.mouse.move(b2.x + b2.width - 5, b2.y + b2.height / 2, { steps: 10 });

		// the clone follows the pointer
		const clone = await page.locator(".tabulator-moving").boundingBox();
		expect(clone.x).toBeGreaterThan(groupA.x);

		await page.mouse.up();

		await expect(page.locator(".tabulator-moving")).toHaveCount(0);
		await expect(page.locator(".tabulator-col-placeholder")).toHaveCount(0);

		expect(await leafFields(page)).toEqual(["x", "b1", "b2", "a1", "a2", "c1"]);

		const lefts = await cellLefts(page);
		expect(lefts.b1).toBeLessThan(lefts.b2);
		expect(lefts.b2).toBeLessThan(lefts.a1);
		expect(lefts.a1).toBeLessThan(lefts.a2);
		expect(lefts.a2).toBeLessThan(lefts.c1);

		const headerA = await headerRect(page, "A");
		const headerB = await headerRect(page, "B");
		expect(headerB.x).toBeLessThan(headerA.x);
		expect(Math.round(headerA.x)).toBe(Math.round(lefts.a1));

		const events = await page.evaluate(() => window.movedEvents);
		expect(events).toEqual([{ title: "A", fields: ["x", "b1", "b2", "a1", "a2", "c1"] }]);
	});

	test("dragging a leaf header inside a group moves the leaf alone", async ({ page }) => {
		await press(page, "a1");

		const a2 = await headerRect(page, "a2");
		await page.mouse.move(a2.x + a2.width - 5, a2.y + a2.height / 2, { steps: 10 });
		await page.mouse.up();

		expect(await leafFields(page)).toEqual(["x", "a2", "a1", "b1", "b2", "c1"]);

		const events = await page.evaluate(() => window.movedEvents);
		expect(events).toEqual([{ title: "a1", fields: ["x", "a2", "a1", "b1", "b2", "c1"] }]);
	});

	test("moving a group with table.moveColumn moves its cells", async ({ page }) => {
		// a group has no field, so it is passed as its column component
		await page.evaluate(() => {
			const groups = window.testTable.getColumns(true);
			const groupA = groups.find((column) => column.getDefinition().title === "A");
			const groupB = groups.find((column) => column.getDefinition().title === "B");

			window.testTable.moveColumn(groupA, groupB, true);
		});

		expect(await leafFields(page)).toEqual(["x", "b1", "b2", "a1", "a2", "c1"]);

		const lefts = await cellLefts(page);
		expect(lefts.x).toBeLessThan(lefts.b1);
		expect(lefts.b1).toBeLessThan(lefts.b2);
		expect(lefts.b2).toBeLessThan(lefts.a1);
		expect(lefts.a1).toBeLessThan(lefts.a2);
		expect(lefts.a2).toBeLessThan(lefts.c1);

		const headerA = await headerRect(page, "A");
		expect(Math.round(headerA.x)).toBe(Math.round(lefts.a1));

		const events = await page.evaluate(() => window.movedEvents);
		expect(events).toHaveLength(1);
	});
});
