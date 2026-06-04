import Group from '../../../src/js/modules/GroupRows/Group.js';

// Regression test for the grouped-table scrolling bug.
//
// Issues:
//   - #4867 (scrollbar jumps back to the top when scrolling collapsed groups)
//   - #4219 / #4525 (same root cause)
//
// Root cause: Group.calcHeight() was an empty no-op, so a group row always
// reported a height of 0 to the virtual renderer. With collapsed groups the
// only visible rows ARE the group headers, so the renderer massively
// under-estimated the total table height and the scrollbar snapped back to the
// top (and expanding a group reset the scroll position).
//
// The fix makes calcHeight() read the rendered height of the element so
// getHeight() returns a real, non-zero value. jsdom does not perform layout,
// so the element's offsetHeight is stubbed here to stand in for a rendered row.
describe('Group height calculation (#4867, #4219, #4525)', function(){
	function makeGroup(offsetHeight){
		// Build a bare Group instance without running the full constructor
		// (which needs a live table/groupManager). We only exercise the
		// height accounting that the bug affected.
		const group = Object.create(Group.prototype);
		group.outerHeight = 0;
		group.element = { offsetHeight };
		return group;
	}

	test('calcHeight() records the rendered height of the group element', function(){
		const group = makeGroup(26);

		group.calcHeight();

		// Before the fix calcHeight() was a no-op, leaving this at 0.
		expect(group.outerHeight).toBe(26);
	});

	test('getHeight() reports a non-zero height after calcHeight()', function(){
		const group = makeGroup(26);

		group.calcHeight();

		// A zero height here is what caused the virtual renderer to under-size
		// the table and snap the scrollbar back to the top (#4867).
		expect(group.getHeight()).toBe(26);
		expect(group.getHeight()).toBeGreaterThan(0);
	});
});
