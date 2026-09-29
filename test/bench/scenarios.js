/*
 * Browser-side benchmark scenarios.
 *
 * Injected into bench.html by run.mjs after the Tabulator build under test.
 * Everything here runs inside headless Chromium; the Node runner drives it
 * through window.__bench and reads back plain JSON.
 *
 * Every scenario has three phases so the runner can snapshot Chromium's
 * performance counters around the measured part only:
 *
 *   setup(params)          -> untimed; generate data, build tables, etc.
 *   measure(params, state) -> returns { metrics: { name: ms, ... }, guards: {...} }
 *   teardown(state)        -> untimed; destroy the table
 *
 * Metrics are milliseconds unless the metric name says otherwise. Guards are
 * sanity values (row counts etc.) that are reported but not compared.
 *
 * Synchronous operations are timed with performance.now() around the call.
 * Tabulator renders synchronously inside setSort/setFilter/redraw, including
 * any forced layouts, so the sync timing captures the real cost without
 * adding a frame's worth of rAF noise.
 */
(function(){
	"use strict";

	//////////////////////////////////////////////////
	// Deterministic data generation
	//////////////////////////////////////////////////

	function mulberry32(seed){
		return function(){
			seed |= 0;
			seed = seed + 0x6D2B79F5 | 0;
			var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
			t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		};
	}

	var WORDS = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel", "india", "juliet", "kilo", "lima", "mike", "november", "oscar", "papa", "quebec", "romeo", "sierra", "tango", "uniform", "victor", "whiskey", "xray", "yankee", "zulu"];
	var CATEGORIES = [];
	for(var c = 0; c < 20; c++){
		CATEGORIES.push("cat" + String(c).padStart(2, "0"));
	}

	// Column kinds cycle for every column after the fixed id + name pair.
	var KINDS = ["int", "category", "float", "bool", "date"];

	function kindFor(index){
		return KINDS[(index - 2) % KINDS.length];
	}

	function makeData(rows, cols, seed){
		var rand = mulberry32(seed || 1),
		data = new Array(rows),
		i, j, row, kind;

		for(i = 0; i < rows; i++){
			row = {
				id: i + 1,
				name: WORDS[Math.floor(rand() * WORDS.length)] + " " + WORDS[Math.floor(rand() * WORDS.length)] + " " + Math.floor(rand() * 10000),
			};

			for(j = 2; j < cols; j++){
				kind = kindFor(j);

				switch(kind){
					case "int":
						row["c" + j] = Math.floor(rand() * 100000);
						break;
					case "category":
						row["c" + j] = CATEGORIES[Math.floor(rand() * CATEGORIES.length)];
						break;
					case "float":
						row["c" + j] = Math.round(rand() * 1000000) / 100;
						break;
					case "bool":
						row["c" + j] = rand() > 0.5;
						break;
					case "date":
						row["c" + j] = "20" + String(Math.floor(rand() * 26)).padStart(2, "0") + "-" + String(1 + Math.floor(rand() * 12)).padStart(2, "0") + "-" + String(1 + Math.floor(rand() * 28)).padStart(2, "0");
						break;
				}
			}

			data[i] = row;
		}

		return data;
	}

	function makeColumns(cols, extra){
		var columns = [
			Object.assign({title:"ID", field:"id", width:80, sorter:"number"}, extra || {}),
			Object.assign({title:"Name", field:"name", width:200, sorter:"string"}, extra || {}),
		];

		for(var j = 2; j < cols; j++){
			var kind = kindFor(j),
			def = {title:kind + " " + j, field:"c" + j, width:120};

			switch(kind){
				case "int":
				case "float":
					def.sorter = "number";
					break;
				case "bool":
					def.sorter = "boolean";
					break;
				default:
					def.sorter = "string";
			}

			columns.push(Object.assign(def, extra || {}));
		}

		return columns;
	}

	//////////////////////////////////////////////////
	// Helpers
	//////////////////////////////////////////////////

	var root = document.getElementById("bench-root");

	function freshContainer(){
		var old = document.getElementById("bench-table");

		if(old){
			old.remove();
		}

		var el = document.createElement("div");
		el.id = "bench-table";
		root.appendChild(el);

		return el;
	}

	function once(table, event, timeoutMs){
		return new Promise(function(resolve, reject){
			var timer = setTimeout(function(){
				table.off(event, handler);
				reject(new Error("Timed out waiting for table event '" + event + "'"));
			}, timeoutMs || 60000);

			function handler(){
				clearTimeout(timer);
				table.off(event, handler);
				resolve(Array.prototype.slice.call(arguments));
			}

			table.on(event, handler);
		});
	}

	function settle(){
		return new Promise(function(resolve){
			requestAnimationFrame(function(){
				requestAnimationFrame(resolve);
			});
		});
	}

	function timeSync(fn){
		var t0 = performance.now();
		fn();
		return performance.now() - t0;
	}

	function timeAsync(fn){
		var t0 = performance.now();
		return Promise.resolve(fn()).then(function(){
			return performance.now() - t0;
		});
	}

	// Build a table and resolve once the initial data has been rendered.
	// `tableBuilt` fires after _loadInitialData, which includes the first
	// renderTable, so timing to tableBuilt covers the whole cold start.
	function buildTable(options){
		var el = freshContainer(),
		t0 = performance.now(),
		table = new Tabulator(el, options);

		return once(table, "tableBuilt").then(function(){
			return {table:table, ms:performance.now() - t0};
		});
	}

	function destroyTable(state){
		if(state && state.table && !state.table.destroyed){
			state.table.destroy();
		}

		freshContainer();
	}

	function holderOf(table){
		return table.rowManager.getElement();
	}

	// Set scrollTop/scrollLeft and run Tabulator's scroll handler synchronously.
	// The native scroll event fires later, but RowManager compares against its
	// cached position and ignores it, so nothing is processed twice.
	function scrollSync(holder, top, left){
		if(typeof top === "number"){
			holder.scrollTop = top;
		}

		if(typeof left === "number"){
			holder.scrollLeft = left;
		}

		holder.dispatchEvent(new Event("scroll"));
	}

	function domRowCount(){
		return document.querySelectorAll("#bench-table .tabulator-row").length;
	}

	function baseOptions(params, overrides){
		return Object.assign({
			height:"600px",
			index:"id",
			data:params.data,
			columns:params.columns,
		}, overrides || {});
	}

	//////////////////////////////////////////////////
	// Scenarios
	//////////////////////////////////////////////////

	var scenarios = {};

	// 1. Cold start with the (default) vertical virtual DOM renderer.
	scenarios["init-virtual"] = {
		tier:1,
		description:"new Tabulator() to tableBuilt, virtual vertical renderer",
		params:[
			{rows:1000, cols:10},
			{rows:20000, cols:10},
			{rows:250000, cols:10},
		],
		setup:function(p){
			return {data:makeData(p.rows, p.cols, 1), columns:makeColumns(p.cols)};
		},
		measure:function(p, state){
			return buildTable(baseOptions(state)).then(function(built){
				state.table = built.table;

				return {
					metrics:{ms:built.ms},
					guards:{dom_rows:domRowCount()},
				};
			});
		},
		teardown:destroyTable,
	};

	// 2. Cold start with the basic renderer (every row in the DOM).
	scenarios["init-basic"] = {
		tier:1,
		description:"new Tabulator() to tableBuilt, basic vertical renderer (all rows in DOM)",
		// The basic renderer measures every row's height as it goes, so cost
		// grows faster than linearly: 2k rows already takes seconds.
		params:[
			{rows:500, cols:10},
			{rows:2000, cols:10},
		],
		setup:function(p){
			return {data:makeData(p.rows, p.cols, 1), columns:makeColumns(p.cols)};
		},
		measure:function(p, state){
			return buildTable(baseOptions(state, {renderVertical:"basic"})).then(function(built){
				state.table = built.table;

				return {
					metrics:{ms:built.ms},
					guards:{dom_rows:domRowCount()},
				};
			});
		},
		teardown:destroyTable,
	};

	// 3. Vertical scrolling through the virtual renderer.
	scenarios["scroll-vertical"] = {
		tier:1,
		description:"viewport-by-viewport sweep, random jumps and scrollToRow on the virtual renderer",
		params:[
			{rows:20000, cols:10, steps:150, jumps:10},
		],
		setup:function(p){
			var state = {data:makeData(p.rows, p.cols, 1), columns:makeColumns(p.cols)};

			return buildTable(baseOptions(state)).then(function(built){
				state.table = built.table;
				return settle();
			}).then(function(){
				return state;
			});
		},
		measure:function(p, state){
			var table = state.table,
			holder = holderOf(table),
			viewport = holder.clientHeight,
			maxTop = holder.scrollHeight - viewport,
			rand = mulberry32(7),
			domMax = 0,
			sweepMs = 0,
			jumpMs = 0,
			top = 0,
			i;

			for(i = 0; i < p.steps && top < maxTop; i++){
				top = Math.min(top + viewport, maxTop);
				sweepMs += timeSync(function(){
					scrollSync(holder, top);
				});
				domMax = Math.max(domMax, domRowCount());
			}

			for(i = 0; i < p.jumps; i++){
				top = Math.floor(rand() * maxTop);
				jumpMs += timeSync(function(){
					scrollSync(holder, top);
				});
				domMax = Math.max(domMax, domRowCount());
			}

			return timeAsync(function(){
				return table.scrollToRow(Math.floor(p.rows / 2), "top", true);
			}).then(function(scrollToRowMs){
				return settle().then(function(){
					return {
						metrics:{
							sweep_ms:sweepMs,
							jump_ms:jumpMs,
							scroll_to_row_ms:scrollToRowMs,
						},
						guards:{dom_rows_max:domMax},
					};
				});
			});
		},
		teardown:destroyTable,
	};

	// 4. Sorting.
	scenarios["sort"] = {
		tier:1,
		description:"setSort on a numeric column, a string column and a three-column sort",
		params:[
			{rows:20000, cols:10},
			{rows:250000, cols:10},
		],
		setup:function(p){
			var state = {data:makeData(p.rows, p.cols, 1), columns:makeColumns(p.cols)};

			return buildTable(baseOptions(state)).then(function(built){
				state.table = built.table;
				return settle();
			}).then(function(){
				return state;
			});
		},
		measure:function(p, state){
			var table = state.table;

			var numeric = timeSync(function(){
				table.setSort("c2", "asc");
			});

			var numericReverse = timeSync(function(){
				table.setSort("c2", "desc");
			});

			var string = timeSync(function(){
				table.setSort("name", "asc");
			});

			var multi = timeSync(function(){
				table.setSort([
					{column:"name", dir:"asc"},
					{column:"c2", dir:"desc"},
					{column:"c3", dir:"asc"},
				]);
			});

			table.clearSort();

			return settle().then(function(){
				return {
					metrics:{
						numeric_ms:numeric,
						numeric_reverse_ms:numericReverse,
						string_ms:string,
						multi_ms:multi,
					},
					guards:{dom_rows:domRowCount()},
				};
			});
		},
		teardown:destroyTable,
	};

	// 5. Filtering.
	scenarios["filter"] = {
		tier:1,
		description:"setFilter with one and three conditions, clearFilter, and progressive header-filter values",
		params:[
			{rows:20000, cols:10},
		],
		setup:function(p){
			var columns = makeColumns(p.cols);
			columns[1].headerFilter = "input";

			var state = {data:makeData(p.rows, p.cols, 1), columns:columns};

			return buildTable(baseOptions(state, {headerFilterLiveFilterDelay:0})).then(function(built){
				state.table = built.table;
				return settle();
			}).then(function(){
				return state;
			});
		},
		measure:function(p, state){
			var table = state.table,
			typed = "",
			keystrokes = 0,
			rowsAfterSingle, rowsAfterMulti;

			var single = timeSync(function(){
				table.setFilter("c3", "=", "cat07");
			});
			rowsAfterSingle = table.getDataCount("active");

			var clear = timeSync(function(){
				table.clearFilter();
			});

			var multi = timeSync(function(){
				table.setFilter([
					{field:"c3", type:"=", value:"cat07"},
					{field:"c2", type:">", value:500},
					{field:"name", type:"like", value:"a"},
				]);
			});
			rowsAfterMulti = table.getDataCount("active");

			table.clearFilter();

			"alpha".split("").forEach(function(ch){
				typed += ch;
				keystrokes += timeSync(function(){
					table.setHeaderFilterValue("name", typed);
				});
			});

			table.clearHeaderFilter();
			table.clearFilter();

			return settle().then(function(){
				return {
					metrics:{
						single_ms:single,
						clear_ms:clear,
						multi_ms:multi,
						header_keystrokes_ms:keystrokes,
					},
					guards:{rows_after_single:rowsAfterSingle, rows_after_multi:rowsAfterMulti},
				};
			});
		},
		teardown:destroyTable,
	};

	// 6. Re-rendering an existing table.
	scenarios["rerender"] = {
		tier:1,
		description:"redraw(true), replaceData, updateData, addData and deleteRow with and without blockRedraw",
		params:[
			// each unblocked deleteRow is a full re-render, so keep the count modest
			{rows:20000, cols:10, batch:1000, deletes:50},
		],
		setup:function(p){
			var state = {data:makeData(p.rows, p.cols, 1), columns:makeColumns(p.cols)};

			return buildTable(baseOptions(state)).then(function(built){
				state.table = built.table;
				return settle();
			}).then(function(){
				return state;
			});
		},
		measure:function(p, state){
			var table = state.table,
			metrics = {},
			updates = [],
			extra = makeData(p.batch, p.cols, 2),
			i;

			for(i = 0; i < p.batch; i++){
				updates.push({id:i * 10 + 1, c2:i});
			}

			for(i = 0; i < extra.length; i++){
				extra[i].id = p.rows + 1 + i;
			}

			metrics.redraw_ms = timeSync(function(){
				table.redraw(true);
			});

			return timeAsync(function(){
				return table.replaceData(state.data);
			}).then(function(ms){
				metrics.replace_data_ms = ms;

				return timeAsync(function(){
					return table.updateData(updates);
				});
			}).then(function(ms){
				metrics.update_data_ms = ms;

				return timeAsync(function(){
					return table.addData(extra);
				});
			}).then(function(ms){
				metrics.add_data_ms = ms;

				return timeAsync(function(){
					var promises = [];

					for(var i = 0; i < p.deletes; i++){
						promises.push(table.deleteRow(p.rows + 1 + i));
					}

					return Promise.all(promises);
				});
			}).then(function(ms){
				metrics.delete_rows_ms = ms;

				return timeAsync(function(){
					var promises = [];

					table.blockRedraw();

					for(var i = p.deletes; i < p.deletes * 2; i++){
						promises.push(table.deleteRow(p.rows + 1 + i));
					}

					table.restoreRedraw();

					return Promise.all(promises);
				});
			}).then(function(ms){
				metrics.delete_rows_blocked_ms = ms;

				return settle();
			}).then(function(){
				return {
					metrics:metrics,
					guards:{row_count:table.getDataCount()},
				};
			});
		},
		teardown:destroyTable,
	};

	// 7. Wide tables, basic vs virtual horizontal renderer.
	scenarios["wide"] = {
		tier:1,
		description:"cold start, small horizontal scroll steps and viewport-sized jumps on a wide table",
		// steps are small wheel-style increments (below the virtual renderer's
		// window buffer, so columns are added/removed incrementally); jumps are
		// viewport-sized moves that make the virtual renderer rerender columns.
		// The jump path currently reinitialises every row in the table, so it
		// scales with rows, not with the viewport; keep the jump count low.
		params:[
			{rows:5000, cols:200, renderHorizontal:"basic", steps:40, jumps:5},
			{rows:5000, cols:200, renderHorizontal:"virtual", steps:40, jumps:5},
			{rows:10000, cols:300, renderHorizontal:"basic", steps:40, jumps:5},
			{rows:10000, cols:300, renderHorizontal:"virtual", steps:40, jumps:5},
		],
		setup:function(p){
			return {data:makeData(p.rows, p.cols, 1), columns:makeColumns(p.cols)};
		},
		measure:function(p, state){
			return buildTable(baseOptions(state, {renderHorizontal:p.renderHorizontal})).then(function(built){
				state.table = built.table;
				return settle().then(function(){
					return built.ms;
				});
			}).then(function(initMs){
				var holder = holderOf(state.table),
				viewport = holder.clientWidth,
				maxLeft = holder.scrollWidth - viewport,
				rand = mulberry32(11),
				left = 0,
				stepMs = 0,
				jumpMs = 0,
				i;

				for(i = 0; i < p.steps && left < maxLeft; i++){
					left = Math.min(left + 200, maxLeft);
					stepMs += timeSync(function(){
						scrollSync(holder, undefined, left);
					});
				}

				for(i = 0; i < p.jumps; i++){
					left = Math.floor(rand() * maxLeft);
					jumpMs += timeSync(function(){
						scrollSync(holder, undefined, left);
					});
				}

				return settle().then(function(){
					return {
						metrics:{
							init_ms:initMs,
							hscroll_steps_ms:stepMs,
							hscroll_jumps_ms:jumpMs,
						},
						guards:{
							dom_rows:domRowCount(),
							dom_cells:document.querySelectorAll("#bench-table .tabulator-cell").length,
						},
					};
				});
			});
		},
		teardown:destroyTable,
	};

	//////////////////////////////////////////////////
	// Runner interface
	//////////////////////////////////////////////////

	var state = null;

	window.__bench = {
		list:function(){
			return Object.keys(scenarios).map(function(id){
				var s = scenarios[id];
				return {id:id, tier:s.tier, description:s.description, params:s.params};
			});
		},

		setup:function(id, params){
			var s = scenarios[id];

			if(!s){
				throw new Error("Unknown scenario: " + id);
			}

			return Promise.resolve(s.setup(params)).then(function(result){
				state = result;
				return true;
			});
		},

		measure:function(id, params){
			var s = scenarios[id];

			return Promise.resolve(s.measure(params, state));
		},

		teardown:function(id){
			var s = scenarios[id],
			current = state;

			state = null;

			return Promise.resolve(s.teardown(current)).then(function(){
				return true;
			});
		},

		version:function(){
			return typeof Tabulator !== "undefined" && Tabulator.version ? Tabulator.version : null;
		},
	};
})();
