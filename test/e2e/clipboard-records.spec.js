import { test, expect } from "@playwright/test";
import { join } from "path";
import { pathToFileURL } from "url";

async function openTable(page, action = "insert"){
	const url = pathToFileURL(join(__dirname, "clipboard-records.html"));
	url.searchParams.set("action", action);
	await page.goto(url.href);
	await page.waitForSelector(".tabulator-row");
}

async function paste(page, text){
	return page.locator("#table").evaluate((element, value) => {
		const data = new DataTransfer();
		data.setData("text/plain", value);
		const event = new ClipboardEvent("paste", {clipboardData:data, bubbles:true, cancelable:true});
		element.dispatchEvent(event);
		return event.defaultPrevented;
	}, text);
}

for(const action of ["insert", "replace", "update"]){
	test(`Excel records reach the ${action} paste action without an extra row`, async({page}) => {
		await openTable(page, action);
		expect(await paste(page, "x1\ty1\r\nx2\ty2\r\n")).toBe(true);
		const expected = [{x:"x1", y:"y1"}, {x:"x2", y:"y2"}];
		if(action !== "replace"){
			expected.unshift({x:"keep", y:"existing"});
		}
		await expect.poll(() => page.evaluate(() => window.testTable.getData().sort((a, b) => a.x.localeCompare(b.x)))).toEqual(expected);
		await expect(page.locator(".tabulator-row")).toHaveCount(expected.length);
	});
}

test("quoted multiline cells and empty final cells survive paste", async({page}) => {
	await openTable(page, "replace");
	expect(await paste(page, '001\t"line 1\r\nline 2"\r\n002\t\r\n')).toBe(true);
	await expect.poll(() => page.evaluate(() => window.testTable.getData())).toEqual([
		{x:"001", y:"line 1\r\nline 2"}, {x:"002", y:""},
	]);
	await expect(page.locator(".tabulator-row")).toHaveCount(2);
});

test("header mapping is retained during paste", async({page}) => {
	await openTable(page, "replace");
	expect(await paste(page, "Second\tFirst\r\ny1\tx1\r\n")).toBe(true);
	await expect.poll(() => page.evaluate(() => window.testTable.getData())).toEqual([{x:"x1", y:"y1"}]);
});

test("an unterminated quoted cell reports an error without changing data", async({page}) => {
	await openTable(page, "replace");
	const input = 'x1\t"unclosed';
	expect(await paste(page, input)).toBe(false);
	await expect.poll(() => page.evaluate(() => window.pasteError)).toBe(input);
	expect(await page.evaluate(() => window.testTable.getData())).toEqual([{x:"keep", y:"existing"}]);
});


for(const action of ["replace", "range"]){
	test(`Tabulator copied values round-trip through ${action} paste`, async({page}) => {
		await openTable(page, action);
		if(action === "range"){
			await page.locator('.tabulator-cell[tabulator-field="x"]').first().click();
		}
		const value = '"quoted"\tline 1\r\nline 2';
		const text = await page.evaluate(value => window.testTable.module("clipboard").generatePlainContent([
			{columns:[{value:"001"}, {value}]},
		]), value);
		expect(await paste(page, text)).toBe(true);
		const expected = [{x:"001", y:value}];
		if(action === "range"){
			expected.push({x:"untouched", y:"sentinel"});
		}
		await expect.poll(() => page.evaluate(() => window.testTable.getData())).toEqual(expected);
	});
}

test("a range paste terminator does not overwrite the following row", async({page}) => {
	await openTable(page, "range");
	await page.locator('.tabulator-cell[tabulator-field="x"]').first().click();
	expect(await paste(page, "x1\ty1\r\n")).toBe(true);
	await expect.poll(() => page.evaluate(() => window.testTable.getData())).toEqual([
		{x:"x1", y:"y1"}, {x:"untouched", y:"sentinel"},
	]);
});
