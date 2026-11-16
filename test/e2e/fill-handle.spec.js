// @ts-check
import { test, expect } from "@playwright/test";
import { join } from "path";

test.describe("Fill handle", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`file://${join(__dirname, "fill-handle.html")}`);
		await page.waitForSelector(".tabulator-range-overlay");
	});

	function cell(page, rowIndex, field) {
		return page
			.locator(".tabulator-row")
			.nth(rowIndex)
			.locator(`.tabulator-cell[tabulator-field="${field}"]`);
	}

	// Layout changes hide the range overlay briefly, letting the column resize
	// handle take the mousedown. hover() is avoided as it scrolls, hiding it again.
	async function pressFillHandle(page) {
		await expect(page.locator(".tabulator-range-overlay")).toBeVisible();

		const handle = await page.locator(".tabulator-range-fill-handle").boundingBox();
		await page.mouse.move(
			handle.x + handle.width / 2,
			handle.y + handle.height / 2,
		);
		await page.mouse.down();
	}

	async function dragFillHandleTo(page, target) {
		await pressFillHandle(page);

		const box = await target.boundingBox();
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
			steps: 5,
		});
		await page.mouse.up();
	}

	function columnValues(page, field) {
		return page.evaluate(
			(field) => window.testTable.getData().map((row) => row[field]),
			field,
		);
	}

	test("dragging down copies the source value into the cells below", async ({ page }) => {
		await cell(page, 0, "name").click();

		await dragFillHandleTo(page, cell(page, 2, "name"));

		await expect
			.poll(() => columnValues(page, "name"))
			.toEqual(["Alice", "Alice", "Alice", "Diana"]);
	});

	test("the filled area becomes the only selected range", async ({ page }) => {
		await cell(page, 0, "name").click();

		await dragFillHandleTo(page, cell(page, 2, "name"));

		await expect(page.locator(".tabulator-range")).toHaveCount(1);
		await expect(page.locator(".tabulator-range-fill-preview")).toHaveCount(0);
		await expect
			.poll(() => page.evaluate(() => window.testTable.getRangesData()))
			.toEqual([[{ name: "Alice" }, { name: "Alice" }, { name: "Alice" }]]);
	});

	test("cells in non-editable columns are not filled", async ({ page }) => {
		await cell(page, 0, "name").click();
		await cell(page, 0, "locked").click({ modifiers: ["Shift"] });

		await dragFillHandleTo(page, cell(page, 2, "locked"));

		await expect
			.poll(() => columnValues(page, "name"))
			.toEqual(["Alice", "Alice", "Alice", "Diana"]);
		expect(await columnValues(page, "locked")).toEqual(["a", "b", "c", "d"]);
	});

	test("releasing without dragging changes nothing", async ({ page }) => {
		await cell(page, 0, "name").click();

		await pressFillHandle(page);
		await page.mouse.up();

		expect(await columnValues(page, "name")).toEqual([
			"Alice",
			"Bob",
			"Charlie",
			"Diana",
		]);
		expect(
			await page.evaluate(() => window.testTable.getHistoryUndoSize()),
		).toBe(0);
	});

	test("a fill is a single undo step", async ({ page }) => {
		await cell(page, 0, "name").click();
		await dragFillHandleTo(page, cell(page, 2, "name"));
		await expect
			.poll(() => columnValues(page, "name"))
			.toEqual(["Alice", "Alice", "Alice", "Diana"]);

		await page.evaluate(() => window.testTable.undo());
		expect(await columnValues(page, "name")).toEqual([
			"Alice",
			"Bob",
			"Charlie",
			"Diana",
		]);

		await page.evaluate(() => window.testTable.redo());
		expect(await columnValues(page, "name")).toEqual([
			"Alice",
			"Alice",
			"Alice",
			"Diana",
		]);
	});

	test("dispatches rangeEdited once per fill", async ({ page }) => {
		await cell(page, 0, "name").click();

		await dragFillHandleTo(page, cell(page, 2, "name"));

		await expect
			.poll(() => page.evaluate(() => window.rangeEditedCount))
			.toBe(1);
	});
});
