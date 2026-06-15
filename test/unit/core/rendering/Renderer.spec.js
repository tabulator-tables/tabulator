import Renderer from "../../../../src/js/core/rendering/Renderer";

// scrollToRowPosition must align center/bottom from the row's actual rendered
// offsetTop (after scrollToRow the row is not necessarily at the top), and must
// keep the virtual renderer's scroll trackers in sync with the manual adjustment.

function makeCtx(overrides = {}) {
	const rowEl = { offsetTop: 500, offsetHeight: 40 };
	const row = { getElement: () => rowEl };
	const ctx = {
		table: { options: {} },
		elementVertical: { clientHeight: 100, scrollHeight: 1000, scrollTop: 0 },
		rows: () => [row],
		scrollToRow: jest.fn(),
		...overrides,
	};
	return { ctx, row, rowEl };
}

async function scrollTo(ctx, row, position) {
	await Renderer.prototype.scrollToRowPosition.call(ctx, row, position, true);
	return ctx.elementVertical.scrollTop;
}

describe("Renderer.scrollToRowPosition", () => {
	test("center aligns from offsetTop", async () => {
		const { ctx, row } = makeCtx();
		// 500 - 100/2 + 40/2 = 470
		expect(await scrollTo(ctx, row, "center")).toBe(470);
	});

	test("bottom aligns from offsetTop", async () => {
		const { ctx, row } = makeCtx();
		// 500 - 100 + 40 = 440
		expect(await scrollTo(ctx, row, "bottom")).toBe(440);
	});

	test("top uses offsetTop directly", async () => {
		const { ctx, row } = makeCtx();
		expect(await scrollTo(ctx, row, "top")).toBe(500);
	});

	test("updates vDom scroll trackers when present", async () => {
		const { ctx, row } = makeCtx({ vDomScrollPosTop: 0, vDomScrollPosBottom: 0 });
		await scrollTo(ctx, row, "center");
		expect(ctx.vDomScrollPosTop).toBe(470);
		expect(ctx.vDomScrollPosBottom).toBe(470);
	});

	test("does not create trackers for the basic renderer", async () => {
		const { ctx, row } = makeCtx();
		await scrollTo(ctx, row, "center");
		expect(ctx.vDomScrollPosTop).toBeUndefined();
		expect(ctx.vDomScrollPosBottom).toBeUndefined();
	});

	test("rejects when the row is not in the render list", async () => {
		const { ctx } = makeCtx();
		await expect(
			Renderer.prototype.scrollToRowPosition.call(ctx, { getElement: () => ({}) }, "top", true),
		).rejects.toBe("Scroll Error - Row not visible");
	});
});
