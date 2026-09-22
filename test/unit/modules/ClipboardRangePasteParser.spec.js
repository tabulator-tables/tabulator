import Clipboard from '../../../src/js/modules/Clipboard/Clipboard.js';
import pasteParsers from '../../../src/js/modules/SelectRange/extensions/clipboard/pasteParsers.js';

describe('Clipboard range paste parser', function(){
	const columns = [{field:"x"}, {field:"y"}];
	const start = {column:columns[0]};
	const end = {column:columns[1]};

	function parse(input, selectedEnd = start){
		const context = {table:{
			columnManager:{getVisibleColumnsByIndex:() => columns},
			modules:{selectRange:{activeRange:{getBounds:() => ({start, end:selectedEnd})}}},
		}};
		return pasteParsers.range.call(context, input);
	}

	test.each(['"quoted"', '"literal', "a\tb", "line 1\r\nline 2", "", {name:"test"}])('round-trips copied cell value %j', function(value){
		const text = Clipboard.prototype.generatePlainContent.call({}, [{columns:[{value:"001"}, {value}]}]);
		expect(parse(text)).toEqual([{x:"001", y:typeof value === "object" ? JSON.stringify(value) : value}]);
	});

	test('does not create an extra range row from a record terminator', function(){
		expect(parse("x1\ty1\r\nx2\ty2\r\n")).toEqual([{x:"x1", y:"y1"}, {x:"x2", y:"y2"}]);
	});

	test('keeps an intentional empty row', function(){
		expect(parse("x1\ty1\r\n\t\r\n")).toEqual([{x:"x1", y:"y1"}, {x:"", y:""}]);
	});

	test('still repeats a narrow paste across a wider selected range', function(){
		expect(parse('"line 1\nline 2"', end)).toEqual([{x:"line 1\nline 2", y:"line 1\nline 2"}]);
	});

	test('still accepts an empty value to clear the selected cells', function(){
		expect(parse("", end)).toEqual([{x:"", y:""}]);
	});

	test('rejects an unterminated quote', function(){
		expect(parse('x1\t"unclosed')).toBe(false);
	});
});
