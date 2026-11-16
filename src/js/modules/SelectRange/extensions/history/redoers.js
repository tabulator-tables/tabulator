export default {
	rangeEdit:function(action){
		action.component.getCells().forEach((cell, index) => {
			cell.setValueProcessData(action.data.cells[index].newValue);
			cell.cellRendered();
		});
	},
};
