import { test, expect } from "@playwright/test";
import { resolve } from "node:path";

// https://github.com/tabulator-tables/tabulator/issues/5007
// Exercise the real DataTree display pipeline, rather than mocking rebuildTree.
const cases = [
    { name: "expanded push", operation: "push", children: [11, 14, 12], returned: 3 },
    { name: "expanded unshift", operation: "unshift", children: [12, 13, 11, 14], returned: 4 },
    { name: "expanded splice", operation: "splice", children: [11, 12], returned: [14] },
    { name: "expanded shift", operation: "shift", children: [14], returned: 11 },
    { name: "expanded pop", operation: "pop", children: [11], returned: 14 },
    { name: "public add child control", operation: "public-add", children: [11, 14, 12], returned: null },
    { name: "collapsed parent control", operation: "collapsed", children: [12, 11, 14], returned: 3 },
    { name: "reactivity disabled control", operation: "disabled", children: [12, 11, 14], returned: 3 },
    { name: "filtered and sorted children", operation: "push", mode: "filtered-sort", children: [11, 14, 12], returned: 3 },
    { name: "grouped roots retain child refresh", operation: "push", mode: "grouped", children: [11, 14, 12], returned: 3 },
    { name: "nested parent retains ancestry", operation: "unshift", mode: "nested", children: [12, 13, 111, 114], returned: 4 },
    { name: "virtual renderer refresh", operation: "push", mode: "virtual", children: [11, 14, 12], returned: 3 },
    { name: "pagination consumes refreshed tree", operation: "push", mode: "paged", children: [11, 14, 12], returned: 3 },
    { name: "empty children repopulate", operation: "empty", children: [], returned: [11, 14] },
];

for (const scenario of cases) {
    test(scenario.name, async ({ page }) => {
        const pageErrors = [];
        page.on("pageerror", error => pageErrors.push(String(error)));
        await page.setContent('<div id="table" style="width:600px"></div>');
        await page.addStyleTag({ path: resolve("dist/css/tabulator.css") });
        await page.addScriptTag({ path: resolve("dist/js/tabulator.js") });
        const result = await page.evaluate(async scenario => {
            const data = [{ id: 10, rank: 0, keep: true, group: "A", _children: [
                { id: 11, rank: 3, keep: true }, { id: 14, rank: 2, keep: false },
            ] }, { id: 20, rank: 10, keep: true, group: "B" }];
            if (scenario.mode === "nested") data[0]._children[0]._children = [{ id: 111 }, { id: 114 }];
            const parentData = scenario.mode === "nested" ? data[0]._children[0] : data[0];
            const sourceChildren = parentData._children;
            const removed = sourceChildren.slice();
            const options = {
                data, dataTree: true, reactiveData: scenario.operation !== "disabled",
                dataTreeStartExpanded: scenario.operation !== "collapsed",
                renderVertical: scenario.mode === "virtual" ? "virtual" : "basic",
                columns: [{ field: "id" }, { field: "rank", visible: false }],
            };
            if (scenario.mode === "virtual") options.height = 300;
            if (scenario.mode === "filtered-sort") {
                options.initialFilter = [{ field: "keep", type: "=", value: true }];
                options.initialSort = [{ column: "rank", dir: "asc" }];
            }
            if (scenario.mode === "grouped") { options.groupBy = "group"; options.groupStartOpen = true; }
            if (scenario.mode === "paged") { options.pagination = true; options.paginationSize = 3; }
            const table = new window.Tabulator("#table", options);
            await new Promise(resolve => table.on("tableBuilt", resolve));
            const root = table.getRow(10);
            const parent = scenario.mode === "nested" ? root.getTreeChildren()[0] : root;
            const snapshot = () => {
                // Observe the DOM before getters, which can lazily generate cached children.
                const visibleIds = Array.from(document.querySelectorAll("#table .tabulator-row:not(.tabulator-group)"),
                    row => Number(row.querySelector(".tabulator-cell").textContent));
                const children = parent.getTreeChildren();
                return {
                    visibleIds, sourceIds: data.map(row => row.id), sourceChildIds: sourceChildren.map(row => row.id),
                    childIds: children.map(row => row.getData().id),
                    rawParentIdentity: parent.getData() === parentData,
                    rawChildIdentity: children.every(row => sourceChildren.includes(row.getData())),
                    rawArrayIdentity: parentData._children === sourceChildren,
                    expanded: parent.isTreeExpanded(), rootExpanded: root.isTreeExpanded(),
                    parentId: parent.getTreeParent() ? parent.getTreeParent().getData().id : null,
                    groupKeys: table.getGroups().map(group => group.getKey()),
                };
            };
            const initial = snapshot();
            const added = { id: 12, rank: 1, keep: true };
            const second = { id: 13, rank: 4, keep: true };
            let returned;
            if (scenario.operation === "push") returned = sourceChildren.push(added);
            if (scenario.operation === "unshift") returned = sourceChildren.unshift(added, second);
            if (scenario.operation === "splice") returned = sourceChildren.splice(1, 1, added);
            if (scenario.operation === "shift") returned = sourceChildren.shift();
            if (scenario.operation === "pop") returned = sourceChildren.pop();
            if (scenario.operation === "empty") returned = sourceChildren.splice(0);
            if (scenario.operation === "public-add") { parent.addTreeChild(added); returned = null; }
            if (scenario.operation === "collapsed" || scenario.operation === "disabled") returned = sourceChildren.unshift(added);
            const nativeReturn = Array.isArray(returned) ? returned.map(row => row.id) : returned && typeof returned === "object" ? returned.id : returned;
            const returnedIdentity = scenario.operation === "shift" ? returned === removed[0]
                : scenario.operation === "pop" ? returned === removed[1]
                : scenario.operation === "splice" ? returned[0] === removed[1]
                : scenario.operation === "empty" ? returned.every((row, i) => row === removed[i]) : true;
            const immediate = snapshot();
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            const afterFrames = snapshot();
            let nextPage = null;
            if (scenario.mode === "paged") { await table.setPage(2); nextPage = snapshot(); await table.setPage(1); }
            // Check the same array remains observed after invalidation and child regeneration.
            let followup = null;
            let followupReturn = null;
            if (["push", "unshift", "splice", "shift", "pop", "empty"].includes(scenario.operation) && !scenario.mode) {
                followupReturn = sourceChildren.push({ id: 15 });
                followup = snapshot();
            }
            parent.treeCollapse();
            parent.treeExpand();
            const afterToggle = snapshot();
            table.destroy();
            return { initial, nativeReturn, returnedIdentity, immediate, afterFrames, nextPage, followup, followupReturn, afterToggle };
        }, scenario);
        console.log(JSON.stringify({ scenario: scenario.name, ...result, pageErrors }));
        expect(pageErrors).toEqual([]);
        const nested = scenario.mode === "nested";
        const initialChildren = nested ? [111, 114] : [11, 14];
        const initialVisible = scenario.operation === "collapsed" ? [10, 20]
            : nested ? [10, 11, 111, 114, 14, 20]
            : scenario.mode === "filtered-sort" ? [10, 11, 20]
            : scenario.mode === "paged" ? [10, 11, 14] : [10, 11, 14, 20];
        expect(result.initial.visibleIds).toEqual(initialVisible);
        expect(result.initial.sourceChildIds).toEqual(initialChildren);
        expect(result.nativeReturn).toEqual(scenario.returned);
        expect(result.returnedIdentity).toBe(true);
        const visible = scenario.operation === "disabled" ? initialVisible
            : scenario.operation === "collapsed" ? [10, 20]
            : nested ? [10, 11, ...scenario.children, 14, 20]
            : scenario.mode === "filtered-sort" ? [10, 12, 11, 20]
            : scenario.mode === "paged" ? [10, 11, 14] : [10, ...scenario.children, 20];
        for (const snapshot of [result.immediate, result.afterFrames]) {
            expect(snapshot.sourceIds).toEqual([10, 20]);
            expect(snapshot.sourceChildIds).toEqual(scenario.children);
            expect(snapshot.rawParentIdentity).toBe(true);
            expect(snapshot.rawChildIdentity).toBe(true);
            expect(snapshot.rawArrayIdentity).toBe(true);
            expect(snapshot.expanded).toBe(scenario.operation !== "collapsed");
            expect(snapshot.rootExpanded).toBe(scenario.operation !== "collapsed");
            expect(snapshot.parentId).toBe(nested ? 10 : null);
            expect(snapshot.childIds).toEqual(scenario.operation === "disabled" ? initialChildren
                : scenario.children);
            expect(snapshot.visibleIds).toEqual(visible);
            if (scenario.mode === "grouped") expect(snapshot.groupKeys).toEqual(["A", "B"]);
        }
        if (result.nextPage) expect(result.nextPage.visibleIds).toEqual([12, 20]);
        if (result.followup) {
            expect(result.followupReturn).toBe(scenario.children.length + 1);
            expect(result.followup.sourceChildIds).toEqual([...scenario.children, 15]);
            expect(result.followup.childIds).toEqual([...scenario.children, 15]);
            expect(result.followup.visibleIds).toEqual([10, ...scenario.children, 15, 20]);
            expect(result.followup.rawParentIdentity).toBe(true);
            expect(result.followup.rawChildIdentity).toBe(true);
            expect(result.followup.rawArrayIdentity).toBe(true);
        }
        const toggled = scenario.operation === "collapsed" ? [10, ...scenario.children, 20]
            : result.followup ? [10, ...scenario.children, 15, 20] : visible;
        expect(result.afterToggle.visibleIds).toEqual(toggled);
    });
}
