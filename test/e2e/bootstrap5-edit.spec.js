// @ts-check
import { test, expect } from "@playwright/test";
import { join } from "path";

// https://github.com/tabulator-tables/tabulator/issues/4728
test.describe("Bootstrap 5 cell editor borders", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`file://${join(__dirname, "bootstrap5-edit.html")}`);
		await page.waitForSelector(".tabulator-row");
	});

	for(const field of ["name", "remarks"]){
		test(`keeps a complete border while editing ${field}`, async ({ page }) => {
			const row = page.locator(".tabulator-row").first();
			const cell = row.locator(`.tabulator-cell[tabulator-field="${field}"]`);
			const neighbor = row.locator(`.tabulator-cell[tabulator-field="${field === "name" ? "remarks" : "name"}"]`);

			await expect(cell).toHaveCSS("border-right-width", "0px");
			const width = await cell.evaluate(el => el.getBoundingClientRect().width);
			await cell.click();

			const input = cell.locator("input");
			await expect(input).toBeFocused();
			for(const side of ["top", "right", "bottom", "left"]){
				await expect(cell).toHaveCSS(`border-${side}-width`, "1px");
				await expect(cell).toHaveCSS(`border-${side}-style`, "solid");
				await expect(cell).toHaveCSS(`border-${side}-color`, "rgb(29, 104, 205)");
			}
			await expect(neighbor).toHaveCSS("border-right-width", "0px");

			const bounds = await cell.evaluate(el => {
				const outer = el.getBoundingClientRect();
				const inner = el.querySelector("input").getBoundingClientRect();
				return {width: outer.width, left: inner.left - outer.left, right: outer.right - inner.right};
			});
			expect(bounds.width).toBe(width);
			expect(bounds.left).toBeGreaterThanOrEqual(1);
			expect(bounds.right).toBeGreaterThanOrEqual(1);

			await input.fill("Updated value");
			await input.press("Enter");
			await expect(cell).toHaveText("Updated value");
			await expect(cell).not.toHaveClass(/tabulator-editing/);
			await expect(cell).toHaveCSS("border-right-width", "0px");
		});
	}

	test("keeps the last cell validation border complete", async ({ page }) => {
		const cell = page.locator('.tabulator-cell[tabulator-field="remarks"]').first();
		await cell.click();
		await cell.locator("input").fill("");
		await cell.locator("input").press("Enter");

		await expect(cell).toHaveClass(/tabulator-validation-fail/);
		for(const side of ["top", "right", "bottom", "left"]){
			await expect(cell).toHaveCSS(`border-${side}-width`, "1px");
			await expect(cell).toHaveCSS(`border-${side}-style`, "solid");
			await expect(cell).toHaveCSS(`border-${side}-color`, "rgb(221, 0, 0)");
		}
	});
});
