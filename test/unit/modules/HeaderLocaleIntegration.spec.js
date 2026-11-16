import TabulatorFull from "../../../src/js/core/TabulatorFull";

describe("Localized header controls", () => {
    let table;
    let element;

    afterEach(() => {
        table?.destroy();
        element?.remove();
    });

    it.each(["headerPopup", "headerMenu"])("preserves %s controls across locale changes", async (option) => {
        element = document.createElement("div");
        document.body.appendChild(element);
        table = new TabulatorFull(element, {
            data: [{ name: "Alice" }],
            columns: [{
                title: "Name",
                field: "name",
                [option]: option === "headerPopup" ? "Filter" : [{ label: "Filter", action: () => {} }],
            }],
            langs: { fr: { columns: { name: "Nom" } } },
        });
        await new Promise(resolve => table.on("tableBuilt", resolve));
        const module = option === "headerPopup" ? "popup" : "menu";
        const handler = option === "headerPopup" ? "loadPopupEvent" : "loadMenuEvent";
        const open = jest.spyOn(table.modules[module], handler).mockImplementation(() => {});
        const title = element.querySelector(".tabulator-col-title");
        const button = title.querySelector(".tabulator-header-popup-button");
        expect(button).not.toBeNull();

        table.setLocale("fr");
        expect(title.textContent).toContain("Nom");
        expect(title.contains(button)).toBe(true);
        table.setLocale("default");
        expect(title.textContent).toContain("Name");
        expect(title.contains(button)).toBe(true);
        expect(title.querySelectorAll(".tabulator-header-popup-button")).toHaveLength(1);
        button.click();
        expect(open).toHaveBeenCalledTimes(1);
    });
});
