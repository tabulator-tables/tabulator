import { test, expect } from "@playwright/test";
import { join } from "path";

const holderSel = ".tabulator-tableholder";

// Fix https://github.com/tabulator-tables/tabulator/issues/4730
// Adding a large batch of rows to the bottom of a virtually rendered table did
// not extend the virtual scroll height, so the scrollbar position was wrong and
// the newly added rows could never be scrolled to.
test.describe("Adding rows updates virtual scroll height (#4730)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`file://${join(__dirname, "add-row-scroll.html")}`);
		await page.waitForSelector(".tabulator-row");
		// position the pointer over the table so wheel events scroll it
		await page.locator(holderSel).hover();
	});

	async function atBottom(page) {
		return page.evaluate((sel) => {
			const holder = document.querySelector(sel);
			return holder.scrollTop >= holder.scrollHeight - holder.clientHeight - 1;
		}, holderSel);
	}

	test("extends the scroll height for rows added at the bottom (#4730)", async ({ page }) => {
		// Drag the scrollbar to the bottom of the 100 initial rows.
		for (let i = 0; i < 250; i++) {
			if (await atBottom(page)) {
				break;
			}
			await page.mouse.wheel(0, 300);
			await page.waitForTimeout(12);
		}

		const before = await page.evaluate(
			(sel) => document.querySelector(sel).scrollHeight,
			holderSel,
		);

		// Add 300 rows to the bottom (4x the initial row count).
		await page.evaluate(async () => {
			const rows = window.generateData(300, 101);
			for (const row of rows) {
				await window.testTable.addRow(row);
			}
		});
		await page.waitForTimeout(300);

		const after = await page.evaluate((sel) => {
			const holder = document.querySelector(sel);
			return {
				scrollHeight: holder.scrollHeight,
				totalRows: window.testTable.getRows().length,
			};
		}, holderSel);

		expect(after.totalRows).toBe(400);

		// Quadrupling the row count should roughly quadruple the scrollable
		// height. Before the fix the bottom padding was never recalculated when
		// rows were appended, so the height barely grew (the scrollbar snapped
		// closer to the bottom) and the added rows were unreachable.
		expect(after.scrollHeight).toBeGreaterThan(before * 3);
	});
});
