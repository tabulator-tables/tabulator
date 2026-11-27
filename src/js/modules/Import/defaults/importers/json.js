export default function(input){
	// JSON text starting with "[" is parsed by the data loader before it reaches the importer
	if(Array.isArray(input)){
		return input;
	}

	try {
		return JSON.parse(input);
	} catch(e) {
		console.warn("JSON Import Error - File contents is invalid JSON", e);
		return Promise.reject();
	}
}