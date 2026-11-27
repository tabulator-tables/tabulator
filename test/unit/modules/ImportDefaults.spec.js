import TabulatorFull from '../../../src/js/core/TabulatorFull.js';
import importers from '../../../src/js/modules/Import/defaults/importers.js';

describe('Import defaults', function(){

	describe('importer "csv"', function(){
		let csv = importers.csv;

		test('returns an empty array for empty input', function(){
			expect(csv("")).toEqual([]);
		});

		test('splits rows on "\\n" and fields on commas, keeping values as strings', function(){
			expect(csv("name,age\nJohn,25")).toEqual([
				["name", "age"],
				["John", "25"]
			]);
		});

		test('splits rows on "\\r\\n" and on a lone "\\r"', function(){
			expect(csv("name,age\r\nJohn,25")).toEqual([["name", "age"], ["John", "25"]]);
			expect(csv("name,age\rJohn,25")).toEqual([["name", "age"], ["John", "25"]]);
		});

		test('adds no row for a trailing new line', function(){
			expect(csv("name,age\nJohn,25\n")).toEqual([["name", "age"], ["John", "25"]]);
			expect(csv("name,age\r\nJohn,25\r\n")).toEqual([["name", "age"], ["John", "25"]]);
		});

		test('turns a blank line into a row with one empty field', function(){
			expect(csv("a\n\nb")).toEqual([["a"], [""], ["b"]]);
		});

		test('keeps empty fields at the start and in the middle of a row', function(){
			expect(csv(",a")).toEqual([["", "a"]]);
			expect(csv("a,,b")).toEqual([["a", "", "b"]]);
		});

		test('keeps an empty field at the end of a row followed by a new line', function(){
			expect(csv("a,\nb,c")).toEqual([["a", ""], ["b", "c"]]);
			expect(csv("b,c\na,\n")).toEqual([["b", "c"], ["a", ""]]);
		});

		// RFC 4180 counts two fields in "a,".
		test('keeps an empty field at the end of the last row with no new line', function(){
			expect(csv("b,c\na,")).toEqual([["b", "c"], ["a", ""]]);
			expect(csv("a,")).toEqual([["a", ""]]);
			expect(csv("a,,")).toEqual([["a", "", ""]]);
			expect(csv(",")).toEqual([["", ""]]);
			expect(csv('"a",')).toEqual([["a", ""]]);
		});

		test('keeps a quoted empty field at the end of a row', function(){
			expect(csv('a,""')).toEqual([["a", ""]]);
		});

		test('keeps commas and new lines inside quoted fields', function(){
			expect(csv('"a,b",c')).toEqual([["a,b", "c"]]);
			expect(csv('"a\nb",c\nd,e')).toEqual([["a\nb", "c"], ["d", "e"]]);
			expect(csv('"a\r\nb",c')).toEqual([["a\r\nb", "c"]]);
		});

		test('reads a doubled quote inside a quoted field as one quote', function(){
			expect(csv('"a""b",c')).toEqual([['a"b', "c"]]);
			expect(csv('""""')).toEqual([['"']]);
		});

		test('drops quotes that open or close inside an unquoted field', function(){
			expect(csv('a"b"c,d')).toEqual([["abc", "d"]]);
		});

		test('reads to the end of input when a quote is left open', function(){
			expect(csv('a,"b,c\nd')).toEqual([["a", "b,c\nd"]]);
			expect(csv('a,"b,')).toEqual([["a", "b,"]]);
		});
	});

	describe('importer "json"', function(){
		let json = importers.json;

		test('returns the parsed value of valid JSON', function(){
			expect(json('[{"name":"John","age":25}]')).toEqual([{name:"John", age:25}]);
			expect(json('[["name","age"],["John",25]]')).toEqual([["name", "age"], ["John", 25]]);
		});

		test('returns an already parsed value unchanged and does not warn', function(){
			let warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
			let input = [["a"]];

			try{
				expect(json(input)).toBe(input);
				expect(warnSpy).not.toHaveBeenCalled();
			}finally{
				warnSpy.mockRestore();
			}
		});

		test('warns and returns a rejected promise for invalid JSON', async function(){
			let warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

			try{
				let result = json("{name:");

				expect(result).toBeInstanceOf(Promise);
				await expect(result).rejects.toBeUndefined();
				expect(warnSpy).toHaveBeenCalledTimes(1);
				expect(warnSpy).toHaveBeenCalledWith("JSON Import Error - File contents is invalid JSON", expect.any(SyntaxError));
			}finally{
				warnSpy.mockRestore();
			}
		});
	});

	describe('importer "array"', function(){
		test('returns its input unchanged', function(){
			let input = [["name", "age"], ["John", 25]];

			expect(importers.array(input)).toBe(input);
		});
	});

	describe('importer "xlsx"', function(){
		let table, sheets, XLSX;

		function buildTable(){
			let element = document.createElement("div");

			let built = new TabulatorFull(element, {
				dependencies:{XLSX:XLSX}
			});

			return new Promise(resolve => built.on("tableBuilt", () => resolve(built)));
		}

		beforeEach(function(){
			sheets = {
				First:{id:"first"},
				Second:{id:"second"}
			};

			XLSX = {
				read:jest.fn(() => ({SheetNames:["First", "Second"], Sheets:sheets})),
				utils:{
					sheet_to_json:jest.fn(() => [["name", "age"], ["John", 25]])
				}
			};
		});

		afterEach(function(){
			if(table){
				table.destroy();
				table = null;
			}
		});

		test('reads the first sheet as rows of values through the "XLSX" dependency', async function(){
			table = await buildTable();

			let input = "file contents";
			let result = importers.xlsx.call(table, input);

			expect(XLSX.read).toHaveBeenCalledWith(input);
			expect(XLSX.utils.sheet_to_json).toHaveBeenCalledTimes(1);
			expect(XLSX.utils.sheet_to_json).toHaveBeenCalledWith(sheets.First, {header:1});
			expect(result).toEqual([["name", "age"], ["John", 25]]);
		});

		test('loads table data through importFormat "xlsx"', async function(){
			let element = document.createElement("div");

			table = new TabulatorFull(element, {
				dependencies:{XLSX:XLSX},
				importFormat:"xlsx",
				autoColumns:true,
				data:"file contents"
			});

			await new Promise(resolve => table.on("dataProcessed", resolve));

			expect(XLSX.read).toHaveBeenCalledWith("file contents");
			expect(table.getData()).toEqual([{name:"John", age:25}]);
		});
	});

	describe('importFormat "json"', function(){
		let table;

		afterEach(function(){
			table.destroy();
		});

		test('loads table data from a JSON string set with setData', async function(){
			let element = document.createElement("div");

			table = new TabulatorFull(element, {
				importFormat:"json",
				autoColumns:true
			});

			await new Promise(resolve => table.on("tableBuilt", resolve));

			await table.setData('[["name","age"],["John",25]]');

			expect(table.getData()).toEqual([{name:"John", age:25}]);
		});
	});

	describe('importFormat "array"', function(){
		let table;

		afterEach(function(){
			table.destroy();
		});

		test('imports an array of arrays set with setData', async function(){
			let element = document.createElement("div");

			table = new TabulatorFull(element, {
				importFormat:"array",
				autoColumns:true
			});

			await new Promise(resolve => table.on("tableBuilt", resolve));

			await table.setData([["name","age"],["John","25"]]);

			expect(table.getData()).toEqual([{name:"John", age:"25"}]);
		});
	});

	describe('importFormat "csv"', function(){
		let table;

		afterEach(function(){
			table.destroy();
		});

		test('loads table data from a CSV string', async function(){
			let element = document.createElement("div");

			table = new TabulatorFull(element, {
				importFormat:"csv",
				autoColumns:true,
				data:"name,age\nJohn,25"
			});

			await new Promise(resolve => table.on("dataProcessed", resolve));

			expect(table.getData()).toEqual([{name:"John", age:"25"}]);
		});

		test('loads an array of row objects set with setData as given', async function(){
			let element = document.createElement("div");

			table = new TabulatorFull(element, {
				importFormat:"csv",
				autoColumns:true
			});

			await new Promise(resolve => table.on("tableBuilt", resolve));

			await table.setData([{name:"John", age:25}]);

			expect(table.getData()).toEqual([{name:"John", age:25}]);
		});

		test('leaves an ajaxURL load to the ajax request when importFormat is set', async function(){
			let element = document.createElement("div");
			let rows = [{name:"John", age:25}];
			let ajaxRequestFunc = jest.fn(() => Promise.resolve(rows));

			table = new TabulatorFull(element, {
				importFormat:"csv",
				autoColumns:true,
				ajaxURL:"http://test.example/data",
				ajaxRequestFunc
			});

			await new Promise(resolve => table.on("dataProcessed", resolve));

			expect(ajaxRequestFunc).toHaveBeenCalledTimes(1);
			expect(table.getData()).toEqual(rows);
		});
	});

	describe('table.import in a build without Mutator', function(){
		let table;

		afterEach(function(){
			jest.restoreAllMocks();
			table.destroy();
		});

		test('resolves and loads the rows of a picked csv file', async function(){
			let Tabulator, ImportModule;

			//a fresh module registry: TabulatorFull above has bound every module in this file's one
			jest.isolateModules(function(){
				Tabulator = require('../../../src/js/core/Tabulator.js').default;
				ImportModule = require('../../../src/js/modules/Import/Import.js').default;
			});

			Tabulator.registerModule([ImportModule]);

			jest.spyOn(console, "error").mockImplementation(() => {});
			jest.spyOn(HTMLInputElement.prototype, "click").mockImplementation(function(){
				let file = new File(["name,age\nJohn,25"], "t.csv", {type:"text/plain"});

				Object.defineProperty(this, "files", {value:[file], configurable:true});
				this.dispatchEvent(new Event("change"));
			});

			let element = document.createElement("div");

			table = new Tabulator(element, {
				columns:[{title:"name", field:"name"}, {title:"age", field:"age"}]
			});

			await new Promise(resolve => table.on("tableBuilt", resolve));

			expect(table.modExists("mutator")).toBe(false);

			let result = await table.import("csv", ".csv").then(
				() => ({resolved:true}),
				(err) => ({err:String(err)})
			);

			expect(result).toEqual({resolved:true});
			expect(table.getData()).toEqual([{name:"John", age:"25"}]);
		}, 2000);
	});

	describe('an importer that throws', function(){
		let table;
		let failure = new Error("importer failed");
		let throwingImporter = function(){
			throw failure;
		};

		afterEach(function(){
			jest.clearAllTimers();
			jest.useRealTimers();
			jest.restoreAllMocks();
			table.destroy();
		});

		test('fires dataLoadError with the thrown error and settles setData', async function(){
			let element = document.createElement("div");
			let onError = jest.fn();

			table = new TabulatorFull(element, {
				importFormat:throwingImporter,
				autoColumns:true
			});

			await new Promise(resolve => table.on("tableBuilt", resolve));

			table.on("dataLoadError", onError);
			jest.spyOn(console, "error").mockImplementation(() => {});

			jest.useFakeTimers();

			let result = table.setData("name,age\nJohn,25").then(() => "settled");

			//run importData's 10 ms timer
			jest.advanceTimersByTime(10);

			expect(await result).toBe("settled");
			expect(onError).toHaveBeenCalledTimes(1);
			expect(onError.mock.calls[0][0]).toBe(failure);
		}, 1000);

		test('rejects table.import and fires importError', async function(){
			let element = document.createElement("div");
			let onError = jest.fn();

			table = new TabulatorFull(element, {
				autoColumns:true
			});

			await new Promise(resolve => table.on("tableBuilt", resolve));

			table.on("importError", onError);
			jest.spyOn(table.modules.import, "pickFile").mockResolvedValue("name,age\nJohn,25");
			jest.spyOn(console, "error").mockImplementation(() => {});

			jest.useFakeTimers();

			let result = table.import(throwingImporter, ".csv").then(
				() => ({resolved:true}),
				(err) => ({err})
			);

			//let the file pick settle, then run importData's 10 ms timer
			await Promise.resolve();
			await Promise.resolve();
			jest.advanceTimersByTime(10);

			expect(await result).toEqual({err:failure});
			expect(onError).toHaveBeenCalledTimes(1);
		}, 1000);
	});
});
