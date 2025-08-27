// @ts-check
import { test, expect } from "@playwright/test";
import { join } from "path";

test.describe("Tabulator functionality", () => {
    test.beforeEach(async ({ page }) => {
		const htmlPath = join(__dirname, "index.html");
        await page.goto(`file://${htmlPath}`);
        await page.waitForSelector(".tabulator");
    });

    test("should initialize table correctly", async ({ page }) => {
        // Check that table is initialized
        const tableExists = await page.isVisible(".tabulator");
        expect(tableExists).toBeTruthy();
        
        // Check row count
        await page.waitForSelector(".tabulator-row");
        const rowCount = await page.locator(".tabulator-row").count();
        expect(rowCount).toBe(5);
        
        // Check column count
        const columnCount = await page.locator(".tabulator-col").count();
        expect(columnCount).toBe(4);
    });

    test.describe("Row operations", () => {
        test("should add a new row", async ({ page }) => {
            await page.evaluate(() => {
                window.testTable.addRow({
                    id: 6,
                    name: "Frank",
                    age: 29,
                    gender: "Male",
                });
            });
            await page.waitForTimeout(300);
    
            const newRowCount = await page.locator(".tabulator-row").count();
            expect(newRowCount).toBe(6);
        });
        
        test("should update an existing row", async ({ page }) => {
            await page.evaluate(() => {
                window.testTable.updateRow(1, { name: "Alice Updated" });
            });
            await page.waitForTimeout(300);
    
            const updatedName = await page.evaluate(() => {
                return window.testTable.getRow(1).getData().name;
            });
    
            expect(updatedName).toBe("Alice Updated");
        });
        
        test("should delete a row", async ({ page }) => {
            await page.evaluate(() => {
                window.testTable.deleteRow(1);
            });
            await page.waitForTimeout(300);
    
            const finalRowCount = await page.locator(".tabulator-row").count();
            expect(finalRowCount).toBe(4); // Original count minus one
        });
    });

    test.describe("Filtering functionality", () => {
        test("should filter rows by gender", async ({ page }) => {
            await page.evaluate(() => {
                window.testTable.setFilter("gender", "=", "Female");
            });
            await page.waitForTimeout(300);
    
            const filteredRowCount = await page.locator(".tabulator-row").count();
            expect(filteredRowCount).toBe(2); // 2 females in our data
        });
        
        test("should clear filters", async ({ page }) => {
            // First apply a filter
            await page.evaluate(() => {
                window.testTable.setFilter("gender", "=", "Female");
            });
            await page.waitForTimeout(300);
            
            // Then clear it
            await page.evaluate(() => {
                window.testTable.clearFilter();
            });
            await page.waitForTimeout(300);
    
            const rowCountAfterClearingFilter = await page
                .locator(".tabulator-row")
                .count();
            expect(rowCountAfterClearingFilter).toBe(5); // Back to original count
        });
    });

    test.describe("Scrolling operations", () => {
		async function addRows(page, count, position) {
            await page.evaluate(({ count, position }) => {
				const newRows = [];
				for (let i = 0; i < count; i++) {
					newRows.push({ 
						id: 11 + i, 
						name: `New Person ${i}`, 
						age: Math.floor(Math.random() * 30) + 20,
						gender: "Male",
					});
				}
				window.testTable.addData(newRows, position);
			}, { count, position });
		}

		async function scrollToPosition(page, position) {
			await page.evaluate((pos) => {
				const tableHolder = document.querySelector('.tabulator-tableholder');
				tableHolder.scrollTop = pos;
			}, position);
			await page.waitForTimeout(100);
		}

		async function getScrollPosition(page) {
			return await page.evaluate(() => {
				const tableHolder = document.querySelector('.tabulator-tableholder');
				return tableHolder.scrollTop;
			});
		}

		async function getTableHeight(page) {
			return await page.evaluate(() => {
				const tableHolder = document.querySelector('.tabulator-tableholder');
				return {
					scrollHeight: tableHolder.scrollHeight,
					clientHeight: tableHolder.clientHeight,
					maxScroll: tableHolder.scrollHeight - tableHolder.clientHeight
				};
			});
		}

        test("should stay in position if adding new rows at top", async ({ page }) => {
			await addRows(page, 10, "top");
            await page.waitForTimeout(300);

			const scrollTop = await getScrollPosition(page);
			expect(scrollTop).toBe(0);
        });

        test("should stay in position if adding new rows at bottom", async ({ page }) => {
			await addRows(page, 10, "bottom");
            await page.waitForTimeout(300);

			const scrollTop = await getScrollPosition(page);
			expect(scrollTop).toBe(0);
        });

		test("should maintain scroll position when adding rows at top while scrolled", async ({ page }) => {
			await addRows(page, 20, "bottom");
			await page.waitForTimeout(300);

			const { maxScroll } = await getTableHeight(page);
			const middlePosition = Math.floor(maxScroll / 2);
			await scrollToPosition(page, middlePosition);

			const initialScrollTop = await getScrollPosition(page);
			await addRows(page, 10, "top");
			await page.waitForTimeout(300);

			const finalScrollTop = await getScrollPosition(page);
			expect(finalScrollTop).toBeGreaterThan(initialScrollTop);
		});

		test("should maintain scroll position when adding rows at bottom while scrolled", async ({ page }) => {
			await addRows(page, 20, "bottom");
			await page.waitForTimeout(300);

			const { maxScroll } = await getTableHeight(page);
			const middlePosition = Math.floor(maxScroll / 2);
			await scrollToPosition(page, middlePosition);

			const initialScrollTop = await getScrollPosition(page);
			await addRows(page, 10, "bottom");
			await page.waitForTimeout(300);

			const finalScrollTop = await getScrollPosition(page);
			expect(Math.abs(finalScrollTop - initialScrollTop)).toBeLessThan(5);
		});

		test("should handle scrolling to specific row", async ({ page }) => {
			await addRows(page, 50, "bottom");
			await page.waitForTimeout(300);

			await page.evaluate(() => {
				window.testTable.scrollToRow(30, "center", false);
			});
			await page.waitForTimeout(300);

			const scrollPosition = await getScrollPosition(page);
			expect(scrollPosition).toBeGreaterThan(0);
		});

		test("should handle programmatic scroll to top", async ({ page }) => {
			await addRows(page, 50, "bottom");
			await page.waitForTimeout(300);

			const { maxScroll } = await getTableHeight(page);
			await scrollToPosition(page, maxScroll);

			await page.evaluate(() => {
				window.testTable.scrollToRow(1, "top", false);
			});
			await page.waitForTimeout(300);

			const finalScrollPosition = await getScrollPosition(page);
			expect(finalScrollPosition).toBe(0);
		});

		test("should handle programmatic scroll to bottom", async ({ page }) => {
			await addRows(page, 50, "bottom");
			await page.waitForTimeout(300);

			const { maxScroll } = await getTableHeight(page);

			await page.evaluate(() => {
				const lastRowId = window.testTable.getData().length;
				window.testTable.scrollToRow(lastRowId, "bottom", false);
			});
			await page.waitForTimeout(300);

			const finalScrollPosition = await getScrollPosition(page);
			expect(Math.abs(finalScrollPosition - maxScroll)).toBeLessThan(150);
		});

		test("should handle deleting rows while scrolled", async ({ page }) => {
			await addRows(page, 30, "bottom");
			await page.waitForTimeout(300);

			const { maxScroll } = await getTableHeight(page);
			await scrollToPosition(page, maxScroll);
			const initialScrollTop = await getScrollPosition(page);

			await page.evaluate(() => {
				const rows = window.testTable.getRows();
				for (let i = 0; i < 10; i++) {
					rows[rows.length - 1 - i].delete();
				}
			});
			await page.waitForTimeout(300);

			const finalScrollTop = await getScrollPosition(page);
			expect(finalScrollTop).toBeLessThanOrEqual(initialScrollTop);
		});

		test("should handle updating row data while scrolled", async ({ page }) => {
			await addRows(page, 30, "bottom");
			await page.waitForTimeout(300);

			const { maxScroll } = await getTableHeight(page);
			const middlePosition = Math.floor(maxScroll / 2);
			await scrollToPosition(page, middlePosition);
			const initialScrollTop = await getScrollPosition(page);

			await page.evaluate(() => {
				window.testTable.updateRow(15, { name: "Updated Name", age: 99 });
			});
			await page.waitForTimeout(300);

			const finalScrollTop = await getScrollPosition(page);
			expect(finalScrollTop).toBe(initialScrollTop);
		});

		test("should handle filtering while scrolled", async ({ page }) => {
			await addRows(page, 30, "bottom");
			await page.waitForTimeout(300);

			const { maxScroll } = await getTableHeight(page);
			await scrollToPosition(page, maxScroll);
			const initialScrollTop = await getScrollPosition(page);

			await page.evaluate(() => {
				window.testTable.setFilter("age", ">", 25);
			});
			await page.waitForTimeout(300);

			const scrollTopAfterFilter = await getScrollPosition(page);
			expect(scrollTopAfterFilter).toBeGreaterThanOrEqual(0);

			const filteredRowCount = await page.locator(".tabulator-row").count();
			expect(filteredRowCount).toBeGreaterThan(0);

			await page.evaluate(() => {
				window.testTable.clearFilter();
			});
			await page.waitForTimeout(300);

			const scrollTopAfterClear = await getScrollPosition(page);
			expect(scrollTopAfterClear).toBeGreaterThanOrEqual(0);
		});

		test("issue #4730 - scroll position after adding large amount of rows at bottom", async ({ page }) => {
			await addRows(page, 100, "bottom");
			await page.waitForTimeout(300);

			const { maxScroll: initialMaxScroll } = await getTableHeight(page);
			await scrollToPosition(page, initialMaxScroll);
			const scrollTopBeforeAdd = await getScrollPosition(page);

			await page.evaluate(() => {
				const newRows = [];
				for (let i = 0; i < 300; i++) {
					newRows.push({ 
						id: 1000 + i, 
						name: `Added Person ${i}`, 
						age: Math.floor(Math.random() * 30) + 20,
						gender: "Male",
					});
				}
				window.testTable.addRow(newRows);
			});
			await page.waitForTimeout(500);

			const { maxScroll: finalMaxScroll } = await getTableHeight(page);
			const scrollTopAfterAdd = await getScrollPosition(page);

			const relativePositionBefore = scrollTopBeforeAdd / initialMaxScroll;
			const relativePositionAfter = scrollTopAfterAdd / finalMaxScroll;

			expect(Math.abs(relativePositionAfter - relativePositionBefore)).toBeLessThan(0.1);
		});

		test("issue #4730 - scroll position after adding rows at top while scrolled", async ({ page }) => {
			await addRows(page, 100, "bottom");
			await page.waitForTimeout(300);

			const { maxScroll } = await getTableHeight(page);
			const middlePosition = Math.floor(maxScroll / 2);
			await scrollToPosition(page, middlePosition);

			await page.evaluate(() => {
				const newRows = [];
				for (let i = 0; i < 50; i++) {
					newRows.push({ 
						id: 2000 + i, 
						name: `Top Person ${i}`, 
						age: Math.floor(Math.random() * 30) + 20,
						gender: "Female",
					});
				}
				window.testTable.addData(newRows, "top");
			});
			await page.waitForTimeout(500);

			const visibleRowCount = await page.locator(".tabulator-row").count();
			expect(visibleRowCount).toBeGreaterThan(0);

			const hasBlankArea = await page.evaluate(() => {
				const tableHolder = document.querySelector('.tabulator-tableholder');
				return tableHolder.scrollHeight > tableHolder.clientHeight;
			});
			expect(hasBlankArea).toBe(true);
		});

		test("issue #4730 - blank space bug with cursor drag after adding rows", async ({ page }) => {
			// Add initial rows and go to bottom
			await addRows(page, 300, "bottom");
			await page.waitForTimeout(300);
			
			await page.evaluate(() => {
				const tableHolder = document.querySelector('.tabulator-tableholder');
				tableHolder.scrollTop = tableHolder.scrollHeight - tableHolder.clientHeight;
			});
			await page.waitForTimeout(100);

			// Add more rows while at bottom
			await addRows(page, 300, "bottom");
			await page.waitForTimeout(500);

			// Simulate rapid cursor drag to top (like your manual test)
			await page.evaluate(() => {
				const tableHolder = document.querySelector('.tabulator-tableholder');
				tableHolder.scrollTop = 0;
			});
			await page.waitForTimeout(50);

			// Check for blank space
			const blankSpaceCheck = await page.evaluate(() => {
				const tableHolder = document.querySelector('.tabulator-tableholder');
				const table = document.querySelector('.tabulator-table');
				const firstVisibleRow = table.querySelector('.tabulator-row');
				
				if (!firstVisibleRow) {
					return { hasBlankSpace: true, reason: 'No visible rows found' };
				}
				
				const tableStyle = window.getComputedStyle(table);
				const topPadding = parseInt(tableStyle.paddingTop) || 0;
				const hasBlankSpace = topPadding > 200 || firstVisibleRow.offsetTop > 100;
				
				return {
					hasBlankSpace,
					topPadding,
					firstRowTop: firstVisibleRow.offsetTop,
					reason: hasBlankSpace ? 'Blank space detected after cursor drag' : 'Normal rendering'
				};
			});

			expect(blankSpaceCheck.hasBlankSpace).toBe(false);
		});
    });
});
