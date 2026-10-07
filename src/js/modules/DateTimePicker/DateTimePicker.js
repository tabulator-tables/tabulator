import Module from '../../core/Module.js';

import Picker from './Picker.js';
import {parseValue, formatValue, nowParts, localParts} from './dateParts.js';

import extensions from './extensions/extensions.js';

//Adds "date", "time" and "datetime" cell buttons, which open a calendar and time picker beside the cell:
//
//  cellButton:"datetime"
//  cellButton:{type:"datetime", params:{seconds:false, firstDayOfWeek:1}}
//
//Params:
//  seconds - show the seconds input (default true)
//  clearable - show a "Clear" button that sets the value to null (default true)
//  firstDayOfWeek - 0 (Sunday) to 6, defaults to the locale's first day
//  locale - locale for month and day names, defaults to the table locale
//  format - how values are stored. Left unset, values are read from ISO style strings, Date objects or
//           millisecond timestamps and written back in the same style. A function(parts, cell) returns
//           the value to store. Any other value is handled by luxon in the same way as the "format"
//           param of the date, time and datetime editors ("iso", "x", true or a luxon format string)
//  parse - function(value, cell) returning parts, a Date or null, for values the default parsing can't read
export default class DateTimePicker extends Module{

	static moduleName = "dateTimePicker";
	static moduleExtensions = extensions;

	constructor(table){
		super(table);
	}

	//open a picker for a cell, from a cell button action
	open(mode, cell, params, button){
		var parsed = this.parse(cell.getValue(), params, cell),
		locale = this.lookupLocale(params),
		picker, popup;

		picker = new Picker({
			mode:mode,
			parts:parsed.parts,
			seconds:params.seconds,
			clearable:params.clearable,
			locale:locale,
			firstDayOfWeek:this.lookupFirstDayOfWeek(params, locale),
			text:(key) => {
				return this.langText("dateTimePicker|" + key);
			},
			now:() => {
				return this.now(parsed.shape, params);
			},
			onApply:(parts) => {
				var value = parts ? this.format(parts, mode, params, parsed.shape, cell) : null;

				if(button.commit(value)){
					popup.hide();
				}else{
					picker.setInvalid(true);
				}
			},
			onCancel:() => {
				popup.hide();
			},
		});

		popup = button.popup(picker.element);

		picker.focus();

		return picker;
	}

	///////////////////////////////////
	//////// Value Conversion /////////
	///////////////////////////////////

	parse(value, params, cell){
		var parts;

		if(typeof params.parse === "function"){
			parts = params.parse(value, cell);

			if(parts instanceof Date){
				parts = isNaN(parts.getTime()) ? null : localParts(parts);
			}

			return {parts:parts || null, shape:{type:"string"}};
		}

		if(this.usesLuxon(params)){
			return this.luxonParse(value, params.format);
		}

		return parseValue(value);
	}

	format(parts, mode, params, shape, cell){
		if(typeof params.format === "function"){
			return params.format(parts, cell);
		}

		if(this.usesLuxon(params)){
			return this.luxonFormat(parts, mode, params.format, shape);
		}

		return formatValue(parts, mode, shape, {seconds:params.seconds});
	}

	now(shape, params){
		var DT;

		if(this.usesLuxon(params)){
			DT = this.luxon();

			if(DT){
				return this.luxonParts(shape.zone ? DT.now().setZone(shape.zone) : DT.now());
			}
		}

		return nowParts(shape);
	}

	usesLuxon(params){
		return typeof params.format !== "undefined" && typeof params.format !== "function";
	}

	luxon(){
		var DT = this.table.dependencyRegistry.lookup(["luxon", "DateTime"], "DateTime");

		if(!DT){
			console.error("DateTimePicker Error - The 'format' param is dependant on luxon.js");
		}

		return DT;
	}

	luxonParts(dt){
		return {year:dt.year, month:dt.month, day:dt.day, hour:dt.hour, minute:dt.minute, second:dt.second};
	}

	luxonParse(value, format){
		var DT = this.luxon(),
		dt;

		if(DT && value !== null && typeof value !== "undefined" && value !== ""){
			if(DT.isDateTime(value)){
				dt = value;
			}else if(format === "x"){
				dt = DT.fromMillis(Number(value));
			}else if(format === "iso" || format === true){
				//keep the offset written in the value so its wall clock time is edited as written
				dt = DT.fromISO(String(value), {setZone:true});
			}else{
				dt = DT.fromFormat(String(value), format);
			}

			if(dt.isValid){
				return {parts:this.luxonParts(dt), shape:{type:"luxon", zone:dt.zone, millisecond:dt.millisecond}};
			}
		}

		return {parts:null, shape:{type:"luxon"}};
	}

	luxonFormat(parts, mode, format, shape){
		var DT = this.luxon(),
		dt;

		if(!DT){
			return;
		}

		dt = DT.fromObject(Object.assign({}, parts, {millisecond:shape.millisecond || 0}), shape.zone ? {zone:shape.zone} : {});

		switch(format){
			case true:
				return dt;

			case "x":
				return dt.toMillis();

			case "iso":
				return mode === "date" ? dt.toISODate() : (mode === "time" ? dt.toISOTime() : dt.toISO());

			default:
				return dt.toFormat(format);
		}
	}

	///////////////////////////////////
	///////////// Locale //////////////
	///////////////////////////////////

	lookupLocale(params){
		var locale = params.locale || this.langLocale();

		if(locale === "default"){
			locale = undefined;
		}

		try{
			return new Intl.DateTimeFormat(locale).resolvedOptions().locale;
		}catch{
			return new Intl.DateTimeFormat().resolvedOptions().locale;
		}
	}

	lookupFirstDayOfWeek(params, locale){
		var info;

		if(typeof params.firstDayOfWeek === "number"){
			return ((params.firstDayOfWeek % 7) + 7) % 7;
		}

		try{
			locale = new Intl.Locale(locale);
			info = typeof locale.getWeekInfo === "function" ? locale.getWeekInfo() : locale.weekInfo;

			//week info numbers days 1 (Monday) to 7 (Sunday)
			if(info && info.firstDay){
				return info.firstDay % 7;
			}
		}catch{}

		return 0;
	}
}
