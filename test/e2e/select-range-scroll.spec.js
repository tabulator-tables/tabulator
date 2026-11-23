import { test, expect } from "@playwright/test";
import { join } from "path";

// https://github.com/tabulator-tables/tabulator/issues/5000
test.describe("Select range overlay while the table re-renders", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`file://${join(__dirname, "select-range-scroll.html")}`);
		await page.waitForSelector(".tabulator-range-overlay");
		await page.evaluate(() => new Promise((resolve) => {
			window.testTable.on("tableBuilt", resolve);
			if (window.testTable.initialized) resolve();
		}));

		// Helpers shared by the tests below
		await page.evaluate(() => {
			window.nextPaint = () => new Promise((resolve) => {
				requestAnimationFrame(() => requestAnimationFrame(resolve));
			});

			window.selectRange = (startRow, startCol, endRow, endCol) => {
				const cell = (row, col) => window.testTable.getRowFromPosition(row).getCells()[col];
				const range = window.testTable.getRanges()[0];

				range.setBounds(cell(startRow, startCol), cell(endRow, endCol));

				return range;
			};

			window.framesHiddenWhile = async (step, frames) => {
				const overlay = document.querySelector(".tabulator-range-overlay");
				let hidden = 0;

				for (let i = 0; i < frames; i++) {
					step(i);
					await window.nextPaint();

					if (getComputedStyle(overlay).visibility !== "visible") {
						hidden++;
					}
				}

				return hidden;
			};
		});
	});

	test("stays visible and covers the viewport during vertical scroll", async ({ page }) => {
		const result = await page.evaluate(async () => {
			const holder = document.querySelector(".tabulator-tableholder");

			window.selectRange(2, 1, 900, 3);
			await window.nextPaint();

			const hidden = await window.framesHiddenWhile(() => { holder.scrollTop += 60; }, 30);
			const rangeRect = document.querySelector(".tabulator-range").getBoundingClientRect();
			const holderRect = holder.getBoundingClientRect();

			return {
				hidden,
				coversTop: rangeRect.top <= holderRect.top,
				coversBottom: rangeRect.bottom >= holderRect.bottom,
			};
		});

		expect(result).toEqual({ hidden: 0, coversTop: true, coversBottom: true });
	});

	test("stays visible and covers the viewport during horizontal scroll", async ({ page }) => {
		const result = await page.evaluate(async () => {
			const holder = document.querySelector(".tabulator-tableholder");

			window.selectRange(1, 1, 3, 28);
			await window.nextPaint();

			const hidden = await window.framesHiddenWhile(() => { holder.scrollLeft += 60; }, 30);
			const rangeRect = document.querySelector(".tabulator-range").getBoundingClientRect();
			const holderRect = holder.getBoundingClientRect();

			return {
				hidden,
				coversLeft: rangeRect.left <= holderRect.left,
				coversRight: rangeRect.right >= holderRect.right,
			};
		});

		expect(result).toEqual({ hidden: 0, coversLeft: true, coversRight: true });
	});

	test("stays visible after clearing cells", async ({ page }) => {
		const hidden = await page.evaluate(async () => {
			const range = window.selectRange(2, 1, 4, 3);

			await window.nextPaint();

			return window.framesHiddenWhile((i) => {
				if (i === 0) {
					range.clearValues();
				}
			}, 4);
		});

		expect(hidden).toBe(0);
	});

	test("hides the active cell outline only while its row is not rendered", async ({ page }) => {
		const active = page.locator(".tabulator-range-cell-active");

		await page.evaluate(async () => {
			const holder = document.querySelector(".tabulator-tableholder");

			holder.scrollTop = holder.scrollHeight;
			await window.nextPaint();
			window.selectRange(990, 1, 990, 1);
			await window.nextPaint();
			holder.scrollTop = 0;
			await window.nextPaint();
		});

		await expect(active).toHaveCSS("display", "none");

		const offsets = await page.evaluate(async () => {
			const holder = document.querySelector(".tabulator-tableholder");

			holder.scrollTop = holder.scrollHeight;
			await window.nextPaint();

			const outline = document.querySelector(".tabulator-range-cell-active").getBoundingClientRect();
			const cell = window.testTable.getRowFromPosition(990).getCells()[1].getElement().getBoundingClientRect();

			return { top: Math.round(outline.top - cell.top), left: Math.round(outline.left - cell.left) };
		});

		await expect(active).toBeVisible();
		expect(offsets).toEqual({ top: 0, left: 0 });
	});
});
