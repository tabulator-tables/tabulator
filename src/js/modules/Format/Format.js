import Module from '../../core/Module.js';

import defaultFormatters from './defaults/formatters.js';

export default class Format extends Module{
	
	static moduleName = "format";
	
	//load defaults
	static formatters = defaultFormatters;
	
	constructor(table){
		super(table);
		
		this.registerColumnOption("formatter");
		this.registerColumnOption("formatterParams");
		
		this.registerColumnOption("formatterPrint");
		this.registerColumnOption("formatterPrintParams");
		this.registerColumnOption("formatterClipboard");
		this.registerColumnOption("formatterClipboardParams");
		this.registerColumnOption("formatterHtmlOutput");
		this.registerColumnOption("formatterHtmlOutputParams");
		this.registerColumnOption("titleFormatter");
		this.registerColumnOption("titleFormatterParams");

		this.registerColumnOption("placeholder");
		this.registerColumnOption("cellPlaceholder");
		this.registerColumnOption("formatterPrintPlaceholder");
		this.registerColumnOption("formatterClipboardPlaceholder");
		this.registerColumnOption("formatterHtmlOutputPlaceholder");

		this.registerComponentFunction("cell", "formatPlaceholder", this.formatPlaceholder.bind(this));
	}
	
	initialize(){
		this.subscribe("cell-format", this.formatValue.bind(this));
		this.subscribe("cell-rendered", this.cellRendered.bind(this));
		this.subscribe("column-layout", this.initializeColumn.bind(this));
		this.subscribe("column-format", this.formatHeader.bind(this));
	}
	
	//initialize column formatter
	initializeColumn(column){
		column.modules.format = this.lookupTypeFormatter(column, "");
		
		if(typeof column.definition.formatterPrint !== "undefined" || typeof column.definition.formatterPrintPlaceholder !== "undefined"){
			column.modules.format.print = this.lookupTypeFormatter(column, "Print");
		}
		
		if(typeof column.definition.formatterClipboard !== "undefined" || typeof column.definition.formatterClipboardPlaceholder !== "undefined"){
			column.modules.format.clipboard = this.lookupTypeFormatter(column, "Clipboard");
		}
		
		if(typeof column.definition.formatterHtmlOutput !== "undefined" || typeof column.definition.formatterHtmlOutputPlaceholder !== "undefined"){
			column.modules.format.htmlOutput = this.lookupTypeFormatter(column, "HtmlOutput");
		}
	}
	
	lookupTypeFormatter(column, type){
		var config = {params:column.definition["formatter" + type + "Params"] || {}},
		formatter = column.definition["formatter" + type];
		
		config.formatter = this.lookupFormatter(formatter);
		
		return config;
	}
	
	
	lookupFormatter(formatter){
		var formatterFunc;

		//set column formatter
		switch(typeof formatter){
			case "string":
				if(Format.formatters[formatter]){
					formatterFunc = Format.formatters[formatter];
				}else{
					console.warn("Formatter Error - No such formatter found: ", formatter);
					formatterFunc = Format.formatters.plaintext;
				}
				break;
			
			case "function":
				formatterFunc = formatter;
				break;
			
			default:
				formatterFunc = Format.formatters.plaintext;
				break;
		}
		
		return formatterFunc;
	}
	
	cellRendered(cell){
		if(cell.modules.format && cell.modules.format.renderedCallback && !cell.modules.format.rendered){
			cell.modules.format.renderedCallback();
			cell.modules.format.rendered = true;
		}
	}
	
	//return a formatted value for a column header
	formatHeader(column, title, el){
		var formatter, params, onRendered, mockCell;
		
		if(column.definition.titleFormatter){
			formatter = this.lookupFormatter(column.definition.titleFormatter);
			
			onRendered = (callback) => {
				column.titleFormatterRendered = callback;
			};
			
			mockCell = {
				getValue:function(){
					return title;
				},
				getElement:function(){
					return el;
				},
				getType:function(){
					return "header";
				},
				getColumn:function(){
					return column.getComponent();
				},
				getTable:() => {
					return this.table;
				}
			};
			
			params = column.definition.titleFormatterParams || {};
			
			params = typeof params === "function" ? params() : params;
			
			return formatter.call(this, mockCell, params, onRendered);
		}else{
			return title;
		}
	}
	
	
	getPlaceholder(column, type = ""){
		var placeholder;

		if(type){
			placeholder = column.definition["formatter" + type + "Placeholder"];
		}

		if(typeof placeholder === "undefined"){
			placeholder = column.definition.placeholder;
		}

		if(typeof placeholder === "undefined"){
			placeholder = column.definition.cellPlaceholder;
		}

		if(typeof placeholder === "undefined"){
			var params = column.definition["formatter" + (type || "") + "Params"];
			if(params && typeof params === "object" && typeof params.placeholder !== "undefined"){
				placeholder = params.placeholder;
			}
		}

		if(typeof placeholder === "undefined" && type){
			var baseParams = column.definition.formatterParams;
			if(baseParams && typeof baseParams === "object" && typeof baseParams.placeholder !== "undefined"){
				placeholder = baseParams.placeholder;
			}
		}

		return placeholder;
	}

	formatPlaceholder(cell, placeholder, onRendered){
		var el = cell.getElement ? cell.getElement() : cell.element,
		component = cell._cell ? cell : (cell.getComponent ? cell.getComponent() : cell),
		rendered = placeholder;

		if(typeof rendered === "undefined"){
			var col = cell.column || (cell.getColumn && cell.getColumn()._column);
			if(col){
				rendered = this.getPlaceholder(col);
			}
		}

		if(el && el.classList){
			el.classList.add("tabulator-cell-placeholder");
		}

		if(typeof rendered === "function"){
			rendered = rendered.call(this, component, onRendered);
		}

		return rendered;
	}

	//return a formatted value for a cell
	formatValue(cell){
		var component = cell.getComponent(),
		params = typeof cell.column.modules.format.params === "function" ? cell.column.modules.format.params(component) : cell.column.modules.format.params,
		placeholder = this.getPlaceholder(cell.column, ""),
		value = cell.getValue(),
		isEmpty = value === null || typeof value === "undefined" || value === "",
		el = cell.getElement ? cell.getElement() : cell.element;
		
		function onRendered(callback){
			if(!cell.modules.format){
				cell.modules.format = {};
			}
			
			cell.modules.format.renderedCallback = callback;
			cell.modules.format.rendered = false;
		}

		if(isEmpty && typeof placeholder !== "undefined" && placeholder !== false && placeholder !== null){
			return this.formatPlaceholder(cell, placeholder, onRendered);
		}else{
			if(el && el.classList){
				el.classList.remove("tabulator-cell-placeholder");
			}

			return cell.column.modules.format.formatter.call(this, component, params, onRendered);
		}
	}
	
	formatExportValue(cell, type){
		var formatter = cell.column.modules.format[type],
		placeholder = this.getPlaceholder(cell.column, type),
		value = cell.getValue(),
		isEmpty = value === null || typeof value === "undefined" || value === "",
		params;
		
		function onRendered(callback){
			if(!cell.modules.format){
				cell.modules.format = {};
			}
			
			cell.modules.format.renderedCallback = callback;
			cell.modules.format.rendered = false;
		}

		if(isEmpty && typeof placeholder !== "undefined" && placeholder !== false && placeholder !== null){
			return this.formatPlaceholder(cell, placeholder, onRendered);
		}
		
		if(formatter){
			params = typeof formatter.params === "function" ? formatter.params(cell.getComponent()) : formatter.params;
			
			return formatter.formatter.call(this, cell.getComponent(), params, onRendered);
		}else{
			return this.formatValue(cell);
		}
	}
	
	sanitizeHTML(value){
		if(value){
			var entityMap = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;',
				'/': '&#x2F;',
				'`': '&#x60;',
				'=': '&#x3D;'
			};
			
			return String(value).replace(/[&<>"'`=/]/g, function (s) {
				return entityMap[s];
			});
		}else{
			return value;
		}
	}
	
	emptyToSpace(value){
		return value === null || typeof value === "undefined" || value === "" ? "&nbsp;" : value;
	}
	
}