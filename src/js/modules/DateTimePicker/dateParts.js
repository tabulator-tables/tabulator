//Converts cell values to and from plain {year, month, day, hour, minute, second} objects (month is
//1-12). The picker works on these rather than Date objects so wall clock values are edited exactly as
//written, with no time zone or daylight saving shifts. Parsing also records the "shape" of the value
//(its type, separator, seconds, fraction and any trailing time zone) so that formatting can hand back
//a value in the same style, only changing the parts the picker edited.

const DATETIME_REGEX = /^(\d{4,})-(\d{1,2})-(\d{1,2})(?:([T ])(\d{1,2}):(\d{2})(?::(\d{2})(\.\d+)?)?)?(.*)$/;
const TIME_REGEX = /^(\d{1,2}):(\d{2})(?::(\d{2})(\.\d+)?)?(.*)$/;
const OFFSET_REGEX = /^\s*(?:(Z)|([+-])(\d{2}):?(\d{2})?)\s*$/i;

export function pad(value, length = 2){
	return String(value).padStart(length, "0");
}

export function daysInMonth(year, month){
	var date = new Date(0);

	//day 0 of the following month is the last day of this one
	date.setUTCFullYear(year, month, 0);

	return date.getUTCDate();
}

//day of the week, 0 (Sunday) to 6
export function dayOfWeek(year, month, day){
	var date = new Date(0);

	date.setUTCFullYear(year, month - 1, day);

	return date.getUTCDay();
}

//move a date by a number of days, returning new parts
export function addDays(parts, days){
	var date = new Date(0);

	date.setUTCFullYear(parts.year, parts.month - 1, parts.day + days);

	return Object.assign({}, parts, {year:date.getUTCFullYear(), month:date.getUTCMonth() + 1, day:date.getUTCDate()});
}

//move a date by a number of months, keeping the day within the new month
export function addMonths(parts, months){
	var index = (parts.year * 12) + (parts.month - 1) + months,
	year = Math.floor(index / 12),
	month = (index - (year * 12)) + 1;

	return Object.assign({}, parts, {year, month, day:Math.min(parts.day, daysInMonth(year, month))});
}

export function localParts(date){
	return {
		year:date.getFullYear(),
		month:date.getMonth() + 1,
		day:date.getDate(),
		hour:date.getHours(),
		minute:date.getMinutes(),
		second:date.getSeconds(),
	};
}

function utcParts(date){
	return {
		year:date.getUTCFullYear(),
		month:date.getUTCMonth() + 1,
		day:date.getUTCDate(),
		hour:date.getUTCHours(),
		minute:date.getUTCMinutes(),
		second:date.getUTCSeconds(),
	};
}

function validDate(parts){
	return parts.month >= 1 && parts.month <= 12 && parts.day >= 1 && parts.day <= daysInMonth(parts.year, parts.month);
}

function validTime(parts){
	return parts.hour <= 23 && parts.minute <= 59 && parts.second <= 59;
}

function parseTime(parts, shape, hour, minute, second, fraction){
	parts.hour = Number(hour);
	parts.minute = Number(minute);
	parts.second = typeof second === "undefined" ? 0 : Number(second);

	shape.time = true;
	shape.seconds = typeof second !== "undefined";
	shape.fraction = fraction || "";
}

export function parseValue(value){
	var parts = null,
	shape = {type:"string"},
	match, date;

	if(value instanceof Date || typeof value === "number"){
		date = new Date(value);

		if(!isNaN(date.getTime())){
			parts = localParts(date);
			shape = {type:value instanceof Date ? "date" : "number", millisecond:date.getMilliseconds()};
		}
	}else if(typeof value === "string"){
		value = value.trim();
		match = value.match(DATETIME_REGEX);

		if(match){
			parts = {year:Number(match[1]), month:Number(match[2]), day:Number(match[3])};
			shape = {type:"string", date:true, time:false, separator:match[4] || "T", suffix:match[9]};

			if(match[4]){
				parseTime(parts, shape, match[5], match[6], match[7], match[8]);
			}
		}else{
			match = value.match(TIME_REGEX);

			if(match){
				parts = {};
				shape = {type:"string", date:false, time:false, suffix:match[5]};

				parseTime(parts, shape, match[1], match[2], match[3], match[4]);
			}
		}

		if(parts && ((shape.date && !validDate(parts)) || (shape.time && !validTime(parts)))){
			parts = null;
			shape = {type:"string"};
		}
	}

	return {parts, shape};
}

//build a value from parts, in the same style as the value that was originally parsed
export function formatValue(parts, mode, shape = {type:"string"}, options = {}){
	var hasDate = mode !== "time" || !!shape.date,
	hasTime = mode !== "date" || !!shape.time,
	output = [],
	date, time;

	if(shape.type === "date" || shape.type === "number"){
		date = new Date(0);
		date.setFullYear(parts.year, parts.month - 1, parts.day);
		date.setHours(parts.hour || 0, parts.minute || 0, parts.second || 0, shape.millisecond || 0);

		return shape.type === "number" ? date.getTime() : date;
	}

	if(hasDate){
		output.push(pad(parts.year, 4) + "-" + pad(parts.month) + "-" + pad(parts.day));
	}

	if(hasTime){
		time = pad(parts.hour || 0) + ":" + pad(parts.minute || 0);

		//keep seconds if the value had them, if they have been set, or if a new value is being created with them
		if(shape.seconds || parts.second || (!shape.time && options.seconds !== false)){
			time += ":" + pad(parts.second || 0) + (shape.fraction || "");
		}

		output.push(time);
	}

	return output.join(shape.separator || "T") + (shape.suffix || "");
}

//the current date and time, in the time zone of the original value where it had one
export function nowParts(shape = {}){
	var match = shape.type === "string" && shape.time && typeof shape.suffix === "string" ? shape.suffix.match(OFFSET_REGEX) : null,
	offset;

	if(match){
		offset = match[1] ? 0 : (Number(match[3]) * 60 + Number(match[4] || 0)) * (match[2] === "-" ? -1 : 1);

		return utcParts(new Date(Date.now() + (offset * 60000)));
	}

	return localParts(new Date());
}
