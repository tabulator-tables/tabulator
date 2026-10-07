import Module from '../../core/Module.js';

import defaultButtons from './defaults/buttons.js';

//shown when a button definition doesn't provide its own icon
const defaultIcon = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="3" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="13" cy="8" r="1.5" fill="currentColor"/></svg>';

//events that would otherwise reach the cell and start an edit, a range selection, a cellClick etc.
const isolatedEvents = ["mousedown", "mouseup", "dblclick", "touchstart", "touchend"];

export default class CellButton extends Module{

	static moduleName = "cellButton";

	//load defaults
	static buttons = defaultButtons;

	constructor(table){
		super(table);

		this.buttons = CellButton.buttons;

		this.watching = false; //cell events are only bound once a column uses buttons
		this.hoverCell = null; //cell currently under the mouse
		this.renderedCell = null; //cell currently holding button elements
		this.renderedGroups = [];
		this.renderedButtons = [];
		this.active = null; //details of the button whose popup is open

		this.registerColumnOption("cellButton");
	}

	initialize(){
		this.subscribe("column-init", this.initializeColumn.bind(this));
	}

	initializeColumn(column){
		var definitions = column.definition.cellButton,
		buttons;

		if(definitions){
			buttons = (Array.isArray(definitions) ? definitions : [definitions]).map(this.lookupButton.bind(this)).filter(Boolean);

			if(buttons.length){
				column.modules.cellButton = buttons;
				this.watchCells();
			}
		}
	}

	lookupButton(definition){
		var preset;

		if(typeof definition === "string"){
			definition = {type:definition};
		}

		if(!definition || typeof definition !== "object"){
			console.warn("Cell Button Error - A button must be defined as a string or an object, received:", definition);
			return false;
		}

		if(definition.type){
			preset = this.buttons[definition.type];

			if(!preset){
				console.warn("Cell Button Error - No such button type found:", definition.type);
				return false;
			}

			definition = Object.assign({}, preset, definition, {params:this.mergeParams(preset.params, definition.params)});
		}

		return definition;
	}

	mergeParams(base, overrides){
		if(typeof base === "function" || typeof overrides === "function"){
			return (cell) => {
				return Object.assign({}, typeof base === "function" ? base(cell) : base, typeof overrides === "function" ? overrides(cell) : overrides);
			};
		}

		return Object.assign({}, base, overrides);
	}

	watchCells(){
		if(!this.watching){
			this.watching = true;

			this.subscribe("cell-mouseenter", this.cellMouseEnter.bind(this));
			this.subscribe("cell-mouseleave", this.cellMouseLeave.bind(this));
			this.subscribe("cell-layout", this.cellLayout.bind(this));
			this.subscribe("cell-delete", this.cellDelete.bind(this));
		}
	}

	///////////////////////////////////
	///////// Event Handling //////////
	///////////////////////////////////

	cellMouseEnter(e, cell){
		this.hoverCell = cell;
		this.refresh();
	}

	cellMouseLeave(e, cell){
		if(this.hoverCell === cell){
			this.hoverCell = null;
			this.refresh();
		}
	}

	cellLayout(cell){
		//regenerating the cell contents wipes out its buttons, so put them back
		if(cell === this.targetCell()){
			this.refresh(true);
		}
	}

	cellDelete(cell){
		if(this.active && this.active.cell === cell){
			this.active.failed = false;
			this.active.popup.hide();
		}

		if(this.hoverCell === cell){
			this.hoverCell = null;
		}

		if(this.renderedCell === cell){
			this.clearButtons();
		}
	}

	///////////////////////////////////
	//////////// Rendering ////////////
	///////////////////////////////////

	//buttons are only built for the hovered cell (or the cell with an open popup), rather than for
	//every cell in the table, so they never go stale and cost nothing until they are needed
	targetCell(){
		return this.active ? this.active.cell : this.hoverCell;
	}

	refresh(force){
		var cell = this.targetCell();

		if(force || cell !== this.renderedCell){
			this.clearButtons();

			if(cell){
				this.renderButtons(cell);
			}
		}

		this.updateActiveState();
	}

	clearButtons(){
		this.renderedGroups.forEach((group) => {
			if(group.parentNode){
				group.parentNode.removeChild(group);
			}
		});

		this.renderedGroups = [];
		this.renderedButtons = [];
		this.renderedCell = null;
	}

	renderButtons(cell){
		var buttons = cell.column.modules.cellButton,
		element = cell.getElement(),
		groups = {},
		component;

		//an open editor replaces the cell contents, so leave it alone
		if(!buttons || element.classList.contains("tabulator-editing")){
			return;
		}

		component = cell.getComponent();

		buttons.forEach((button) => {
			var params = this.buttonParams(button, component),
			position = button.position === "left" ? "left" : "right",
			buttonEl;

			if(this.buttonVisible(button, cell, component, params)){
				if(!groups[position]){
					groups[position] = document.createElement("div");
					groups[position].classList.add("tabulator-cell-buttons", "tabulator-cell-buttons-" + position);
				}

				buttonEl = this.buildButton(button, cell, component, params);

				groups[position].appendChild(buttonEl);
				this.renderedButtons.push({button, element:buttonEl});
			}
		});

		Object.values(groups).forEach((group) => {
			element.appendChild(group);
			this.renderedGroups.push(group);
		});

		this.renderedCell = cell;
	}

	buildButton(button, cell, component, params){
		var element = document.createElement("button"),
		icon = button.icon,
		label = button.label;

		element.type = "button";
		element.tabIndex = -1;
		element.classList.add("tabulator-cell-button");

		if(button.cssClass){
			element.classList.add(...button.cssClass.split(" ").filter(Boolean));
		}

		if(typeof icon === "function"){
			icon = icon.call(this, component, params);
		}else if(icon instanceof Node){
			icon = icon.cloneNode(true);
		}

		if(icon instanceof Node){
			element.appendChild(icon);
		}else{
			element.innerHTML = typeof icon === "undefined" || icon === null ? defaultIcon : icon;
		}

		if(typeof label === "function"){
			label = label.call(this, component, params);
		}

		if(label){
			element.title = label;
			element.setAttribute("aria-label", label);
		}

		element.addEventListener("click", (e) => {
			e.stopPropagation();
			this.buttonClick(e, button, cell, element);
		});

		isolatedEvents.forEach((type) => {
			element.addEventListener(type, (e) => {
				e.stopPropagation();
			});
		});

		return element;
	}

	updateActiveState(){
		var active = this.active && this.active.cell === this.renderedCell ? this.active : null;

		this.renderedButtons.forEach((item) => {
			item.element.classList.toggle("tabulator-cell-button-active", !!active && active.button === item.button);
		});

		this.renderedGroups.forEach((group) => {
			group.classList.toggle("tabulator-cell-buttons-active", !!active);
		});
	}

	buttonParams(button, component){
		return (typeof button.params === "function" ? button.params(component) : button.params) || {};
	}

	buttonVisible(button, cell, component, params){
		if(button.editable && !this.cellEditable(cell)){
			return false;
		}

		if(typeof button.visible === "function"){
			return !!button.visible.call(this, component, params);
		}

		return button.visible !== false;
	}

	//cells in columns without an editor have no edit rules for a button to follow
	cellEditable(cell){
		if(this.table.modExists("edit") && cell.column.modules.edit){
			return this.table.modules.edit.allowEdit(cell);
		}

		return true;
	}

	///////////////////////////////////
	///////////// Actions /////////////
	///////////////////////////////////

	buttonClick(e, button, cell, element){
		var component = cell.getComponent(),
		active = this.active;

		//clicking the button that opened the current popup closes it again
		if(active){
			active.popup.hide();

			if(active.cell === cell && active.button === button){
				return;
			}
		}

		if(typeof button.action === "function"){
			button.action.call(this, e, component, this.buttonParams(button, component), this.buttonContext(button, cell, element));
		}
	}

	//helpers handed to a button action
	buttonContext(button, cell, element){
		return {
			element:element,
			popup:(contents, position) => {
				return this.openPopup(button, cell, contents, position);
			},
			commit:(value) => {
				return this.commitValue(cell, value);
			},
		};
	}

	openPopup(button, cell, contents, position){
		var contentsEl = contents,
		active, popup;

		if(this.active){
			this.active.popup.hide();
		}

		if(!(contentsEl instanceof Node)){
			contentsEl = document.createElement("div");
			contentsEl.innerHTML = contents;
		}

		contentsEl.classList.add("tabulator-popup");

		//stop clicks inside the popup reaching the document, which would close it
		contentsEl.addEventListener("click", (e) => {
			e.stopPropagation();
		});

		popup = this.popup(contentsEl);

		active = this.active = {cell, button, popup, failed:false};

		popup.show(cell.getElement(), position || "bottom").hideOnBlur(() => {
			if(this.active === active){
				this.active = null;
			}

			//a rejected value leaves the cell showing the validation failure, so restore its state
			//the same way cancelling an inline editor would
			if(active.failed){
				this.dispatch("edit-editor-clear", cell, true);
			}

			this.refresh();
		});

		this.refresh();

		return popup;
	}

	//save a new value as though it had come from the cell's editor, so it is validated and
	//tracked as an edit when the edit module is installed
	commitValue(cell, value){
		var committed = this.chain("edit-value", [cell, value], undefined, () => {
			cell.setValue(value, true);
			return true;
		});

		if(this.active && this.active.cell === cell){
			this.active.failed = !committed;
		}

		return committed;
	}
}
