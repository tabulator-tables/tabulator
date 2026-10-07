import {pad, daysInMonth, dayOfWeek, addDays, addMonths} from './dateParts.js';

const fallbackMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fallbackDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const timeFields = [
	{key:"hour", max:23, label:"hours"},
	{key:"minute", max:59, label:"minutes"},
	{key:"second", max:59, label:"seconds"},
];

const dayKeys = {
	ArrowLeft:{days:-1},
	ArrowRight:{days:1},
	ArrowUp:{days:-7},
	ArrowDown:{days:7},
	PageUp:{months:-1},
	PageDown:{months:1},
};

//Calendar and time picker. Options:
//  mode - "date", "time" or "datetime"
//  parts - the current value as {year, month, day, hour, minute, second}, or null when empty
//  seconds - show the seconds input (default true)
//  clearable - show a button to clear the value (default true)
//  firstDayOfWeek - 0 (Sunday) to 6
//  locale - used for month and day names
//  text(key) - looks up localized button text
//  now() - the current date and time as parts
//  onApply(parts|null), onCancel()
export default class Picker{

	constructor(options){
		this.options = options;
		this.mode = options.mode;
		this.hasDate = this.mode !== "time";
		this.hasTime = this.mode !== "date";

		this.parts = Object.assign({year:0, month:1, day:1, hour:0, minute:0, second:0}, this.dateDefaults(options.parts), options.parts);

		//an empty date picker opens on today without selecting it, so any click on a day picks it
		this.selected = !!options.parts || this.mode === "datetime";

		this.view = {year:this.parts.year, month:this.parts.month, day:this.parts.day};

		this.timeInputs = {};
		this.calendarBody = null;
		this.monthLabel = null;
		this.yearInput = null;

		this.element = this.build();
	}

	dateDefaults(parts){
		var now;

		if(!parts || typeof parts.year === "undefined"){
			now = this.options.now();

			return {year:now.year, month:now.month, day:now.day};
		}

		return {};
	}

	text(key){
		return this.options.text(key);
	}

	///////////////////////////////////
	///////////// Building ////////////
	///////////////////////////////////

	build(){
		var element = document.createElement("div");

		element.classList.add("tabulator-datetime-picker", "tabulator-datetime-picker-" + this.mode);
		element.setAttribute("role", "dialog");
		element.setAttribute("aria-label", this.text(this.mode));

		element.addEventListener("keydown", this.keydown.bind(this));

		if(this.hasDate){
			element.appendChild(this.buildHeader());
			element.appendChild(this.buildCalendar());
		}

		if(this.hasTime){
			element.appendChild(this.buildTime());
		}

		element.appendChild(this.buildFooter());

		if(this.hasDate){
			this.renderCalendar();
		}

		return element;
	}

	buildButton(classNames, text, callback){
		var button = document.createElement("button");

		button.type = "button";
		button.classList.add(...classNames);
		button.textContent = text;
		button.addEventListener("click", callback);

		return button;
	}

	buildHeader(){
		var header = document.createElement("div"),
		prev = this.buildButton(["tabulator-datetime-picker-nav", "tabulator-datetime-picker-prev"], "\u2039", this.changeMonth.bind(this, -1)),
		next = this.buildButton(["tabulator-datetime-picker-nav", "tabulator-datetime-picker-next"], "\u203A", this.changeMonth.bind(this, 1));

		header.classList.add("tabulator-datetime-picker-header");

		prev.setAttribute("aria-label", this.text("prevMonth"));
		prev.title = this.text("prevMonth");

		next.setAttribute("aria-label", this.text("nextMonth"));
		next.title = this.text("nextMonth");

		this.monthLabel = document.createElement("span");
		this.monthLabel.classList.add("tabulator-datetime-picker-month");
		this.monthLabel.setAttribute("aria-live", "polite");

		this.yearInput = document.createElement("input");
		this.yearInput.type = "number";
		this.yearInput.min = 1;
		this.yearInput.max = 9999;
		this.yearInput.classList.add("tabulator-datetime-picker-year");
		this.yearInput.setAttribute("aria-label", this.text("year"));
		this.yearInput.addEventListener("change", this.yearChange.bind(this));

		header.appendChild(prev);
		header.appendChild(this.monthLabel);
		header.appendChild(this.yearInput);
		header.appendChild(next);

		return header;
	}

	buildCalendar(){
		var table = document.createElement("table"),
		head = document.createElement("thead"),
		row = document.createElement("tr"),
		names = this.dayNames();

		table.classList.add("tabulator-datetime-picker-calendar");
		table.setAttribute("role", "grid");

		for(let i = 0; i < 7; i++){
			let index = (this.options.firstDayOfWeek + i) % 7,
			cell = document.createElement("th");

			cell.scope = "col";
			cell.textContent = names.short[index];
			cell.setAttribute("abbr", names.long[index]);

			row.appendChild(cell);
		}

		head.appendChild(row);
		table.appendChild(head);

		this.calendarBody = document.createElement("tbody");
		this.calendarBody.addEventListener("click", this.dayClick.bind(this));

		table.appendChild(this.calendarBody);

		return table;
	}

	buildTime(){
		var element = document.createElement("div");

		element.classList.add("tabulator-datetime-picker-time");

		timeFields.forEach((field, index) => {
			var input;

			if(field.key === "second" && this.options.seconds === false){
				return;
			}

			if(index){
				let separator = document.createElement("span");

				separator.classList.add("tabulator-datetime-picker-time-separator");
				separator.textContent = ":";

				element.appendChild(separator);
			}

			input = document.createElement("input");
			input.type = "text";
			input.inputMode = "numeric";
			input.maxLength = 2;
			input.value = pad(this.parts[field.key]);
			input.classList.add("tabulator-datetime-picker-time-input", "tabulator-datetime-picker-" + field.key);
			input.setAttribute("aria-label", this.text(field.label));

			input.addEventListener("focus", () => {
				input.select();
			});

			input.addEventListener("change", this.readTimeInput.bind(this, field, input));

			input.addEventListener("keydown", (e) => {
				var step = {ArrowUp:1, ArrowDown:-1}[e.key];

				if(step){
					e.preventDefault();
					this.readTimeInput(field, input);
					this.parts[field.key] = (this.parts[field.key] + step + field.max + 1) % (field.max + 1);
					input.value = pad(this.parts[field.key]);
					input.select();
				}
			});

			this.timeInputs[field.key] = {field, input};

			element.appendChild(input);
		});

		return element;
	}

	buildFooter(){
		var footer = document.createElement("div"),
		spacer = document.createElement("span");

		footer.classList.add("tabulator-datetime-picker-footer");
		spacer.classList.add("tabulator-datetime-picker-spacer");

		footer.appendChild(this.buildButton(["tabulator-datetime-picker-action", "tabulator-datetime-picker-now"], this.text(this.hasTime ? "now" : "today"), this.setNow.bind(this)));

		if(this.options.clearable !== false){
			footer.appendChild(this.buildButton(["tabulator-datetime-picker-action", "tabulator-datetime-picker-clear"], this.text("clear"), this.clear.bind(this)));
		}

		footer.appendChild(spacer);

		//picking a day is enough to choose a date, so only pickers with a time need confirming
		if(this.hasTime){
			footer.appendChild(this.buildButton(["tabulator-datetime-picker-action", "tabulator-datetime-picker-cancel"], this.text("cancel"), this.cancel.bind(this)));
			footer.appendChild(this.buildButton(["tabulator-datetime-picker-action", "tabulator-datetime-picker-apply"], this.text("apply"), this.apply.bind(this)));
		}

		return footer;
	}

	dayNames(){
		var names = {short:fallbackDays.slice(), long:fallbackDays.slice()};

		try{
			let shortFormat = new Intl.DateTimeFormat(this.options.locale, {weekday:"short", timeZone:"UTC"}),
			longFormat = new Intl.DateTimeFormat(this.options.locale, {weekday:"long", timeZone:"UTC"});

			for(let i = 0; i < 7; i++){
				//3rd January 2021 was a Sunday
				let date = Date.UTC(2021, 0, 3 + i);

				names.short[i] = shortFormat.format(date);
				names.long[i] = longFormat.format(date);
			}
		}catch{}

		return names;
	}

	monthName(month){
		try{
			return new Intl.DateTimeFormat(this.options.locale, {month:"long", timeZone:"UTC"}).format(Date.UTC(2021, month - 1, 1));
		}catch{
			return fallbackMonths[month - 1];
		}
	}

	///////////////////////////////////
	//////////// Rendering ////////////
	///////////////////////////////////

	renderCalendar(){
		var view = this.view,
		offset = (dayOfWeek(view.year, view.month, 1) - this.options.firstDayOfWeek + 7) % 7,
		date = addDays({year:view.year, month:view.month, day:1}, -offset),
		today = this.options.now(),
		row;

		this.monthLabel.textContent = this.monthName(view.month);
		this.yearInput.value = view.year;

		while(this.calendarBody.firstChild) this.calendarBody.removeChild(this.calendarBody.firstChild);

		//always show six weeks so the picker doesn't change size between months
		for(let i = 0; i < 42; i++){
			let cell = document.createElement("td"),
			button = document.createElement("button"),
			isSelected = this.selected && this.isSameDay(date, this.parts),
			isFocused = this.isSameDay(date, view);

			if(i % 7 === 0){
				row = document.createElement("tr");
				this.calendarBody.appendChild(row);
			}

			button.type = "button";
			button.tabIndex = isFocused ? 0 : -1;
			button.textContent = date.day;
			button.classList.add("tabulator-datetime-picker-day");
			button.dataset.date = pad(date.year, 4) + "-" + pad(date.month) + "-" + pad(date.day);

			if(date.month !== view.month){
				button.classList.add("tabulator-datetime-picker-day-other");
			}

			if(this.isSameDay(date, today)){
				button.classList.add("tabulator-datetime-picker-day-today");
				button.setAttribute("aria-current", "date");
			}

			if(isSelected){
				button.classList.add("tabulator-datetime-picker-day-selected");
			}

			cell.setAttribute("role", "gridcell");
			cell.setAttribute("aria-selected", isSelected ? "true" : "false");
			cell.appendChild(button);
			row.appendChild(cell);

			date = addDays(date, 1);
		}
	}

	isSameDay(a, b){
		return a.year === b.year && a.month === b.month && a.day === b.day;
	}

	focus(){
		var target = this.hasDate ? this.calendarBody.querySelector("button[tabindex='0']") : this.element.querySelector(".tabulator-datetime-picker-time-input");

		if(target){
			target.focus({preventScroll:true});
		}
	}

	setInvalid(invalid){
		this.element.classList.toggle("tabulator-datetime-picker-invalid", invalid);
	}

	///////////////////////////////////
	///////// Event Handling //////////
	///////////////////////////////////

	keydown(e){
		var move = dayKeys[e.key];

		//keep keystrokes away from the table's keybindings
		e.stopPropagation();

		switch(e.key){
			case "Escape":
				e.preventDefault();
				this.cancel();
				return;

			case "Enter":
				if(e.target.classList.contains("tabulator-datetime-picker-time-input")){
					e.preventDefault();
					this.apply();
				}
				return;
		}

		if(move && e.target.classList.contains("tabulator-datetime-picker-day")){
			e.preventDefault();
			this.moveView(move.days ? addDays(this.view, move.days) : addMonths(this.view, move.months));
			this.focus();
		}
	}

	moveView(date){
		this.view = {year:date.year, month:date.month, day:date.day};
		this.renderCalendar();
	}

	changeMonth(months){
		this.moveView(addMonths(this.view, months));
	}

	yearChange(){
		var year = parseInt(this.yearInput.value, 10);

		if(year >= 1 && year <= 9999){
			this.moveView(Object.assign({}, this.view, {year, day:Math.min(this.view.day, daysInMonth(year, this.view.month))}));
		}else{
			this.yearInput.value = this.view.year;
		}
	}

	dayClick(e){
		var button = e.target.closest(".tabulator-datetime-picker-day"),
		date;

		if(button){
			date = button.dataset.date.split("-").map(Number);

			this.parts.year = date[0];
			this.parts.month = date[1];
			this.parts.day = date[2];
			this.selected = true;

			this.moveView(this.parts);

			if(this.hasTime){
				this.focus();
			}else{
				this.apply();
			}
		}
	}

	readTimeInput(field, input){
		var value = parseInt(input.value, 10);

		if(value >= 0 && value <= field.max){
			this.parts[field.key] = value;
		}

		input.value = pad(this.parts[field.key]);
	}

	setNow(){
		var now = this.options.now();

		if(this.hasDate){
			this.parts.year = now.year;
			this.parts.month = now.month;
			this.parts.day = now.day;
		}

		if(this.hasTime){
			this.parts.hour = now.hour;
			this.parts.minute = now.minute;
			this.parts.second = now.second;
		}

		this.options.onApply(Object.assign({}, this.parts));
	}

	apply(){
		Object.values(this.timeInputs).forEach((item) => {
			this.readTimeInput(item.field, item.input);
		});

		this.options.onApply(Object.assign({}, this.parts));
	}

	clear(){
		this.options.onApply(null);
	}

	cancel(){
		this.options.onCancel();
	}
}
