
function evaluateLoanApplication(inferences) {
    for (let inference of inferences) {
        if (inference.name === "reject_loan_application") {
            if (inference.sign === true) {
                return -1;
            } else if (inference.sign === false) {
                return 1;
            }
        }
    }
    return 0; // Return 0 if no matching object is found
}





function extractNamesFromGraph(graph, excludeContext) {
    let names = [];
    Object.keys(graph).forEach(property => {
        graph[property].forEach(item => {
			// Filter and add main item names if the switch is on and do not start with '$'
            if (item.name && (!excludeContext || !item.name.startsWith('$')))
				names.push(item.name);
            // Recursive extraction from nested objects like 'head' and 'body' if they exist
            // if (item.head && item.head.name) names.push(item.head.name);
            // if (item.body && item.body.name) names.push(item.body.name);
        });
    });
    return names;
}





function extractJustificationNamesFromGraph(graph, excludeContext) {
    let results = [];
    Object.keys(graph).forEach(property => {
        graph[property].forEach(item => {
            // Check if body exists and does not contain "suppose" or "perceive"
            let bodyNames = [];
            if (item.body && Array.isArray(item.body)) {
                item.body.forEach(bodyItem => {
                    if (bodyItem.name && bodyItem.name !== "suppose" && bodyItem.name !== "perceive") {
                        bodyNames.push(bodyItem.name);
                    }
                });
            }
            // If the body names array is not empty after filtering, include this object
            if ((item.name && (!excludeContext || !item.name.startsWith('$'))) && bodyNames.length > 0) {
                results.push(item.name);
            }
			else if (item.head && item.head.name === "reject_loan_application")
				results.push(item.name);
        });
    });
    return results;
}





function deepExtractNamesFromGraph(graph, excludeContext) {
    let results = [];
    Object.keys(graph).forEach(property => {
        graph[property].forEach(item => {
            // Check if body exists and does not contain "suppose" or "perceive"
            let bodyNames = [];
            if (item.body && Array.isArray(item.body)) {
                item.body.forEach(bodyItem => {
                    if (bodyItem.name && bodyItem.name !== "suppose" && bodyItem.name !== "perceive") {
                        bodyNames.push(bodyItem.name);
                    }
                });
            }
            // If the body names array is not empty after filtering, include this object
            if ((item.name && (!excludeContext || !item.name.startsWith('$'))) && bodyNames.length > 0) {
                results.push([item.name, ...bodyNames]);
            }
        });
    });
    return results;
}




// Function to decrypt a hash with a key
function decryptString(encryptedText, key) {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
}
