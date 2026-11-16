import { test, expect } from "@playwright/test";
import { join } from "path";

test("header popup and menu remain usable after locale changes", async ({ page }) => {
    await page.goto(`file://${join(__dirname, "header-locale.html")}`);
    await page.waitForSelector(".tabulator-row");
    for(const locale of ["fr", "default", "fr"]){
        await page.evaluate(value => window.table.setLocale(value), locale);
        const name = page.locator('.tabulator-col[tabulator-field="name"]');
        await expect(name).toContainText(locale === "fr" ? "Nom" : "Name");
        await expect(name.locator(".tabulator-header-popup-button")).toHaveCount(1);
        await name.locator(".tabulator-header-popup-button").click();
        await expect(page.locator(".tabulator-popup")).toContainText("Filter options");
        await expect(async () => {
            await page.locator("#outside").click();
            await expect(page.locator(".tabulator-popup-container")).toHaveCount(0, { timeout: 200 });
        }).toPass({ timeout: 3000 });
        const age = page.locator('.tabulator-col[tabulator-field="age"]');
        await expect(age.locator(".tabulator-header-popup-button")).toHaveCount(1);
        await age.locator(".tabulator-header-popup-button").click();
        await expect(page.locator(".tabulator-menu")).toContainText("Menu action");
        await expect(async () => {
            await page.locator("#outside").click();
            await expect(page.locator(".tabulator-popup-container")).toHaveCount(0, { timeout: 200 });
        }).toPass({ timeout: 3000 });
    }
});
