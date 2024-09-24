
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





// Function to split the body string into predicates, handling commas inside parentheses
function splitPredicates(bodyStr) {

    const predicates = [];
    let currentPredicate = '';
    let depth = 0;

    for (let i = 0; i < bodyStr.length; i++) {

        const char = bodyStr[i];

        if (char === '(') {
            depth++;
            currentPredicate += char;
        }
        
        else if (char === ')') {
            depth--;
            currentPredicate += char;
        }
        
        else if (char === ',' && depth === 0) {
            // At depth zero, comma separates predicates
            predicates.push(currentPredicate.trim());
            currentPredicate = '';
        }
        
        else {
            currentPredicate += char;
        }
    }

    if (currentPredicate.trim() !== '') {
        predicates.push(currentPredicate.trim());
    }

    return predicates;
}





// Function to parse predicates and optionally strip arguments
function parsePredicate(predicateStr, includeArgs = true, ignoreNegation = false) {

    predicateStr = predicateStr.trim();

    // Remove negation if present
    let isNegated = false;
    if (ignoreNegation && predicateStr.startsWith('-')) {
        isNegated = true;
        predicateStr = predicateStr.substring(1).trim();
    }


    if (includeArgs) {
        // Keep the predicate as is, including arguments
        return (isNegated ? '-' : '') + predicateStr;
    }
    
    else {

        // Extract the predicate name without arguments
        const nameMatch = predicateStr.match(/^([a-z][a-zA-Z0-9_]*)(?:\s*\(.*\))?$/);
        if (nameMatch) {
            return (isNegated ? '-' : '') + nameMatch[1];
        }
        else {
            // Invalid predicate format
            console.warn(`Invalid predicate format: ${predicateStr}`);
            return null;
        }
    }
}




// Function to parse rules and extract heads or bodies
function parseRules(rulesString, extractHeads = false, includeArgs = true, ignoreNegation = false, extractName = false) {

    const identifiers = [];

    // Remove @Knowledge keyword if present
    rulesString = rulesString.replace(/@KnowledgeBase\s*/, '');

    // Split the rules by semicolons
    const ruleMatches = rulesString.split(';');

    if (ruleMatches) {

        for (let ruleStr of ruleMatches) {

            ruleStr = ruleStr.trim();

            if (ruleStr === '') continue;

            // Remove any trailing semicolon from the rule string
            ruleStr = ruleStr.replace(/;$/, '').trim();

            // Match rule name, body, head, and optional priority
            const rulePattern = /^(\w+)\s*::\s*(.*?)\s+implies\s+([^\|]+?)(?:\|\s*(-?\d+))?$/;
            const match = ruleStr.match(rulePattern);

            if (match) {

                const ruleName = match[1];
                const bodyStr = match[2].trim();
                let headStr = match[3].trim();

                // Remove any trailing semicolon from headStr
                headStr = headStr.replace(/;$/, '').trim();

                // Extract body predicates
                const bodyPredicates = splitPredicates(bodyStr).map(pred => parsePredicate(pred.trim(), includeArgs, ignoreNegation)).filter(Boolean);
                
                // Extract head predicate
                const headPredicate = parsePredicate(headStr, includeArgs, ignoreNegation);

                if (extractName) {
                    if (ruleName)
                        identifiers.push(ruleName);
                }
                else if (extractHeads && headPredicate) {
                    identifiers.push(headPredicate);
                }
                else if (!extractHeads) {
                    identifiers.push(...bodyPredicates);
                }

            }
            
            else {
                // Handle compatibility constraints or other types of rules
                // Compatibility constraint pattern: ruleName :: pred1 # pred2;
                const compPattern = /^(\w+)\s*::\s*(.*?)\s*#\s*(.*?)\s*$/;
                const compMatch = ruleStr.match(compPattern);

                if (compMatch) {

                    const cRuleName = compMatch[1];
                    if (extractName) {
                        if (cRuleName)
                            identifiers.push(cRuleName);
                    }
                        // const conflictPredtate1 = compMatch[2].trim();
                    // const conflictPredtate2 = compMatch[3].trim();
    
                    // // Remove any trailing semicolon from conflict predicate
                    // conflictPredtate1 = conflictPredtate1.replace(/;$/, '').trim();
                    // conflictPredtate2 = conflictPredtate2.replace(/;$/, '').trim();

                    // if (extractHeads && conflictPredtate1 && conflictPredtate2) {
                    //     identifiers.push(conflictPredtate1);
                    //     identifiers.push(conflictPredtate2);
                    // }
                    continue;
                }

                else {
                    // Invalid rule format
                    console.warn(`Invalid rule format: ${ruleStr}`);
                }
            }

        }

    }

    return identifiers;
}



function getNonExistingBodyPredicates(prudensPolicy, newPrudensRules, includeArgs = true, ignoreNegation = false) {

    // Extract head predicates from prudensPolicy
    const policyHeads = parseRules(prudensPolicy, true, includeArgs, ignoreNegation);

    // Extract head predicates from newPrudensRules
    const newRulesHeads = parseRules(newPrudensRules, true, includeArgs, ignoreNegation);

    // Extract body predicates from newPrudensRules
    const newRulesBodies = parseRules(newPrudensRules, false, includeArgs, ignoreNegation);

    // Remove duplicates from policyHeads for efficient lookup
    const policyHeadsSet = new Set(policyHeads);

    // Remove duplicates from newRulesHeads for efficient lookup
    const newRulesHeadsSet = new Set(newRulesHeads);

    // Filter body predicates that do not exist as heads in prudensPolicy
    var nonExistingBodyPredicates = newRulesBodies.filter(predicate => !policyHeadsSet.has(predicate));

    // Filter remaining body predicates that do not exist as heads in newPrudensRules
    nonExistingBodyPredicates = nonExistingBodyPredicates.filter(predicate => !newRulesHeadsSet.has(predicate));

    // Return unique predicates (in case of duplicates)
    return Array.from(new Set(nonExistingBodyPredicates));

}



function getSupportingRules(prudensPolicy, newPrudensRules, argumentSet, includeArgs = true, ignoreNegation = false) {

    // Get the predicates of the bodies of current argument Prudens representation that
	// are do not appear in the head of any of the rules in current Prudens dialogue policy
	const nonExistingBodyPredicates = getNonExistingBodyPredicates(prudensPolicy, newPrudensRules, includeArgs, ignoreNegation);
    let supportingRules = "";

	// Iterate over the results of getNonExistingBodyPredicates
	for (let j = 0; j < nonExistingBodyPredicates.length; j++) {

	    const predicate = nonExistingBodyPredicates[j];

		// Check that the predicate is a non-null, non-empty string
		if (typeof predicate !== 'string' || predicate.trim() === '') {
			// Skip invalid predicates
			continue;
		}

	    // Iterate over each row in the 2D table
		for (let k = 0; k < argumentSet.length; k++) {

		    // Ensure row is defined**
		    if (argumentSet[k] == null) {
				// Skip undefined or null rows
				continue;
			}

			// If the predicate is found in the argument set, head column
			if (argumentSet[k][3] === predicate) {

				// Add the respective Prudens expression in current argument Prudens representation
				supportingRules = argumentSet[k][2] + "\n" + supportingRules;

				// We only need the first match for now
				break;

			}
        
		}
    
	}

    return supportingRules;

}




function ruleIsIncludedInPolicy(prudensPolicy, prudensRule, includeArgs = true, ignoreNegation = false) {

    const ruleName = parseRules(prudensRule, true, includeArgs, ignoreNegation, true);
    
    const ruleNamesOfPolicy = parseRules(prudensPolicy, true, includeArgs, ignoreNegation, true);

    const ruleNameExists = ruleName.some(name => ruleNamesOfPolicy.includes(name));

    return ruleNameExists;
 
}