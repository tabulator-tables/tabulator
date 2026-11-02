export default function parseRows(clipboard){
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
	if(!rowEnded){
		row.push(value);
		data.push(row);
	}

	return data;
}
