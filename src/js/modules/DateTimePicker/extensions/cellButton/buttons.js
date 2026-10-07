const calendarIcon = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="1.5" y="2.5" width="13" height="12" rx="1.5" fill="none" stroke="currentColor"/><path d="M1.5 6.5h13M5 1v3M11 1v3" fill="none" stroke="currentColor"/><path d="M4 9h2v2H4zM7 9h2v2H7zM10 9h2v2h-2z" fill="currentColor"/></svg>';
const clockIcon = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor"/><path d="M8 4v4l2.5 2" fill="none" stroke="currentColor"/></svg>';

//cell buttons that open the date time picker, "this" is the cellButton module
function picker(mode, icon){
	return {
		icon:icon,
		editable:true,
		label:function(cell, params){
			return this.langText("dateTimePicker|" + mode);
		},
		action:function(e, cell, params, button){
			this.table.modules.dateTimePicker.open(mode, cell, params, button);
		},
	};
}

export default {
	date:picker("date", calendarIcon),
	time:picker("time", clockIcon),
	datetime:picker("datetime", calendarIcon),
};
