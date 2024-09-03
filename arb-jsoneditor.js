// JSON Control required definitions and declarations
var systemOutputContainer = document.getElementById("systemOutput");
var jsonEditorOptions = {
	mode: 'tree',
	modes: ['code', 'form', 'text', 'tree', 'view'], // allowed modes
};

var systemOutputEditor = new JSONEditor(systemOutputContainer, jsonEditorOptions);
