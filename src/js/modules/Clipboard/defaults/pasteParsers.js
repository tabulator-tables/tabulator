function parseRows(clipboard){
	var data = [], row = [], value = "", quoted = false, quoteClosed = false, rowEnded = false;

	for(let i = 0; i < clipboard.length; i++){
		var char = clipboard[i];

		if(quoted){
			if(char === '"'){
				if(clipboard[i + 1] === '"'){
					value += char;
					i++;
				}else{
					quoted = false;
					quoteClosed = true;
				}
			}else{
				value += char;
			}
			continue;
		}

		if(char === '"' && value === "" && !quoteClosed){
			quoted = true;
			rowEnded = false;
		}else if(char === "\t" || char === "\r" || char === "\n"){
			row.push(value);
			value = "";
			quoteClosed = false;
			rowEnded = char !== "\t";

			if(rowEnded){
				data.push(row);
				row = [];
				if(char === "\r" && clipboard[i + 1] === "\n"){
					i++;
				}
			}
		}else if(quoteClosed){
			return false;
		}else{
			value += char;
			rowEnded = false;
		}
	}

	if(quoted){
		return false;
	}

	//A record terminator ends the last row; it does not start an extra empty row.
	if(clipboard.length && !rowEnded){
		row.push(value);
		data.push(row);
	}

	return data;
}

export default {
	table:function(clipboard){
		var data = parseRows(clipboard),
		headerFindSuccess = true,
		columns = this.table.columnManager.columns,
		columnMap = [],
		rows = [];
		
		if(data && data.length && !(data.length === 1 && data[0].length < 2 && !/[\r\n]$/.test(clipboard))){
			
			//check if headers are present by title
			data[0].forEach(function(value){
				var column = columns.find(function(column){
					return value && column.definition.title && value.trim() && column.definition.title.trim() === value.trim();
				});
				
				if(column){
					columnMap.push(column);
				}else{
					headerFindSuccess = false;
				}
			});
			
			//check if column headers are present by field
			if(!headerFindSuccess){
				headerFindSuccess = true;
				columnMap = [];
				
				data[0].forEach(function(value){
					var column = columns.find(function(column){
						return value && column.field && value.trim() && column.field.trim() === value.trim();
					});
					
					if(column){
						columnMap.push(column);
					}else{
						headerFindSuccess = false;
					}
				});
				
				if(!headerFindSuccess){
					columnMap = this.table.columnManager.columnsByIndex;
				}
			}
			
			//remove header row if found
			if(headerFindSuccess){
				data.shift();
			}
			
			data.forEach(function(item){
				var row = {};
				
				item.forEach(function(value, i){
					if(columnMap[i]){
						row[columnMap[i].field] = value;
					}
				});
				
				rows.push(row);
			});
			
			return rows;
		}else{
			return false;
		}
	},
};