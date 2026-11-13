import TabulatorFull from '../../../src/js/core/TabulatorFull.js';

// Regression for https://github.com/tabulator-tables/tabulator/issues/4977
describe('deleting grouped rows after display changes', () => {
	let table;

	afterEach(() => {
		if(table){
			table.destroy();
			table = null;
		}
	});

	test.each([
		{frozen: true, filtered: true, nested: false},
		{frozen: false, filtered: true, nested: false},
		{frozen: true, filtered: false, nested: false},
		{frozen: false, filtered: false, nested: false},
		{frozen: true, filtered: true, nested: true},
		{frozen: false, filtered: true, nested: true},
	])('removes the row with %j', async ({frozen, filtered, nested}) => {
		document.body.innerHTML = '<div id="test-table"></div>';
		table = new TabulatorFull('#test-table', {
			renderVertical: 'basic',
			groupBy: nested ? ['group', 'subgroup'] : 'group',
			data: [
				{id: 1, group: 'a', subgroup: 'x', name: 'one'},
				{id: 2, group: 'a', subgroup: 'x', name: 'two'},
				{id: 3, group: 'b', subgroup: 'y', name: 'visible-only'},
			],
			columns: [{field: 'name'}],
		});
		await new Promise(resolve => table.on('tableBuilt', resolve));

		const row = await table.addRow({id: 4, group: 'a', subgroup: 'x', name: 'summary'});
		if(frozen){
			row.freeze();
		}
		if(filtered){
			table.setFilter('name', '=', 'visible-only');
		}

		await row.delete();
		expect(table.getData().map(item => item.id)).toEqual([1, 2, 3]);
		expect(document.querySelector('.tabulator-frozen-rows-holder').children.length).toBe(0);
		table.clearFilter();
		expect(table.getData('active').map(item => item.id)).toEqual([1, 2, 3]);
		const rows = table.getGroups().flatMap(group => nested ? group.getSubGroups().flatMap(child => child.getRows()) : group.getRows());
		expect(rows.map(item => item.getIndex())).toEqual([1, 2, 3]);
	});
});
