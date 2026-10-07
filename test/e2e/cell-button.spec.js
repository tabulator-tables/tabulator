// @ts-check
import { test, expect } from "@playwright/test";
import { join } from "path";

test.describe("Cell buttons", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`file://${join(__dirname, "cell-button.html")}`);
		await page.waitForSelector(".tabulator-row");
	});

	const cell = (page, row, field) => page.locator(".tabulator-row").nth(row).locator(`.tabulator-cell[tabulator-field="${field}"]`);
	const picker = (page) => page.locator(".tabulator-datetime-picker");

	test("shows a cell's buttons only while it is hovered", async ({ page }) => {
		const due = cell(page, 0, "due");

		await expect(page.locator(".tabulator-cell-button")).toHaveCount(0);

		await due.hover();
		await expect(due.locator(".tabulator-cell-button")).toBeVisible();

		// the button floats over the cell without changing its size
		const cellBox = await due.boundingBox();
		const buttonBox = await due.locator(".tabulator-cell-button").boundingBox();

		expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(cellBox.x + cellBox.width);
		expect(buttonBox.y).toBeGreaterThanOrEqual(cellBox.y);
		expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(cellBox.y + cellBox.height);
		expect(cellBox.width).toBe(160);

		await page.locator("h1").hover();
		await expect(page.locator(".tabulator-cell-button")).toHaveCount(0);
	});

	test("runs a custom action without starting an edit", async ({ page }) => {
		const manager = cell(page, 0, "manager");

		await manager.hover();
		await manager.locator(".tabulator-cell-button").click();

		expect(await page.evaluate(() => window.linkClicks)).toEqual([2]);
		await expect(page.locator(".tabulator-editing")).toHaveCount(0);

		// hidden where its visible check fails
		await cell(page, 1, "manager").hover();
		await expect(page.locator(".tabulator-cell-button")).toHaveCount(0);
	});

	test("picks a date from the calendar", async ({ page }) => {
		const due = cell(page, 0, "due");

		await due.hover();
		await due.locator(".tabulator-cell-button").click();

		await expect(picker(page)).toBeVisible();

		// opens below the cell, keeping the button shown while the mouse is away
		const cellBox = await due.boundingBox();
		const pickerBox = await picker(page).boundingBox();

		expect(pickerBox.y).toBeGreaterThanOrEqual(cellBox.y + cellBox.height - 1);
		await expect(due.locator(".tabulator-cell-button-active")).toBeVisible();

		await picker(page).locator('[data-date="2026-10-21"]').click();

		await expect(picker(page)).toHaveCount(0);
		await expect(due).toContainText("2026-10-21");
		await expect(page.locator(".tabulator-editing")).toHaveCount(0);
	});

	test("picks a date and time", async ({ page }) => {
		const updated = cell(page, 0, "updated");

		await updated.hover();
		await updated.locator(".tabulator-cell-button").click();

		await picker(page).locator(".tabulator-datetime-picker-next").click();
		await picker(page).locator('[data-date="2026-11-03"]').click();
		await picker(page).locator(".tabulator-datetime-picker-hour").fill("17");
		await picker(page).locator(".tabulator-datetime-picker-minute").fill("45");
		await picker(page).locator(".tabulator-datetime-picker-apply").click();

		await expect(picker(page)).toHaveCount(0);
		await expect(updated).toContainText("2026-11-03 17:45:30");
	});

	test("picks a time with the keyboard", async ({ page }) => {
		const starts = cell(page, 0, "starts");

		await starts.hover();
		await starts.locator(".tabulator-cell-button").click();

		await expect(picker(page).locator(".tabulator-datetime-picker-hour")).toBeFocused();
		await page.keyboard.press("ArrowUp");
		await page.keyboard.press("Enter");

		await expect(starts).toContainText("10:30");
	});

	test("closes when clicking outside without changing the value", async ({ page }) => {
		const due = cell(page, 0, "due");

		await due.hover();
		await due.locator(".tabulator-cell-button").click();
		await expect(picker(page)).toBeVisible();

		// popups only start listening for clicks outside them 100ms after opening
		await page.waitForTimeout(150);
		await page.locator("h1").click();

		await expect(picker(page)).toHaveCount(0);
		await expect(due).toContainText("2026-10-07");
		await expect(page.locator(".tabulator-cell-button")).toHaveCount(0);
	});

	test("toggles the picker from its button", async ({ page }) => {
		const due = cell(page, 0, "due");

		await due.hover();
		await due.locator(".tabulator-cell-button").click();
		await expect(picker(page)).toBeVisible();

		await due.locator(".tabulator-cell-button").click();
		await expect(picker(page)).toHaveCount(0);
	});

	test("still edits the cell inline when clicking its text", async ({ page }) => {
		const due = cell(page, 0, "due");

		await due.click({ position: { x: 10, y: 10 } });

		await expect(due).toHaveClass(/tabulator-editing/);
		await expect(due.locator("input")).toBeVisible();
		await expect(due.locator(".tabulator-cell-button")).toHaveCount(0);
	});
});
