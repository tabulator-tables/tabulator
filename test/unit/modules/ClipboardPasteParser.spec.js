import pasteParsers from '../../../src/js/modules/Clipboard/defaults/pasteParsers.js';

describe('Clipboard table paste parser', function(){
	const columns = [
		{field:"x", definition:{title:"First"}},
		{field:"y", definition:{title:"Second"}},
	];
	const context = {table:{columnManager:{columns, columnsByIndex:columns}}};
	const parse = input => pasteParsers.table.call(context, input);

	test.each(["\n", "\r\n", "\r"])("parses records separated by %j", function(ending){
		expect(parse("x1\ty1" + ending + "x2\ty2" + ending)).toEqual([
			{x:"x1", y:"y1"}, {x:"x2", y:"y2"},
		]);
	});

	test.each(["\n", "\r\n", "\r"])("preserves an intentional empty row before %j", function(ending){
		expect(parse("x1\ty1" + ending + "\t" + ending)).toEqual([
			{x:"x1", y:"y1"}, {x:"", y:""},
		]);
	});

	test.each(["", "\n", "\r\n", "\r"])("preserves an empty final cell with terminator %j", function(ending){
		expect(parse("x1\t" + ending)).toEqual([{x:"x1", y:""}]);
	});

	test.each([
		["001\t\"line 1\r\nline 2\"\r\n", [{x:"001", y:"line 1\r\nline 2"}]],
		["001\t\"a\tb\"\r\n", [{x:"001", y:"a\tb"}]],
		["001\t\"say \"\"hi\"\"\"\r\n", [{x:"001", y:'say "hi"'}]],
		["001\t\"\"", [{x:"001", y:""}]],
		['001\t12" long\r\n', [{x:"001", y:'12" long'}]],
		[" x1 \t y1  \r\n", [{x:" x1 ", y:" y1  "}]],
		["x1\ty1\r\n\r\n", [{x:"x1", y:"y1"}, {x:""}]],
		["x1\nx2\n", [{x:"x1"}, {x:"x2"}]],
		["x1\n", [{x:"x1"}]],
	])("preserves cell values in %j", function(input, expected){
		expect(parse(input)).toEqual(expected);
	});

	test.each(["Second\tFirst", "y\tx"])("maps reordered headers %j", function(header){
		expect(parse(header + "\r\ny1\tx1\r\n")).toEqual([{y:"y1", x:"x1"}]);
	});

	test('uses visual column order when no headers match', function(){
		const reordered = {table:{columnManager:{columns, columnsByIndex:[columns[1], columns[0]]}}};
		expect(pasteParsers.table.call(reordered, "y1\tx1\r\n")).toEqual([{y:"y1", x:"x1"}]);
	});

	test.each(["", "plain text", 'x1\t"unclosed', 'x1\t"closed"junk'])('rejects non-tabular or malformed input %j', function(input){
		expect(parse(input)).toBe(false);
	});
});
