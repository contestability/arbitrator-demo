let globalcurrentArgument = 0;
let globalCurrentNLDialogue = '';
let globalCurrentPrudensDialogue = '@KnowledgeBase\n';
let globalCurrentInterlocutor = "";

let globalCurrentArgumentText = "";

const constContestDialogue = [
    ["Your loan application is rejected.", "S01 :: suppose implies reject_loan_application | 00;", "Bank Officer", "N01", 0],
    ["Why is my loan application rejected?", "S02 :: suppose implies -reject_loan_application | 00;", "Loan Applicant", "N02", 1],
    ["Your loan application has been rejected because your care-giving obligations are considered high and your credit score is low.", "S03 :: suppose implies caregiving_obligations(high) | 00;\nS05 :: suppose implies credit_score(low) | 00;\nA01 :: caregiving_obligations(high), credit_score(low) implies reject_loan_application | 11;", "Bank Officer", "N03", 2],
    ["My loan application should not have been rejected because I am a good existing customer: I own an account for a long time and I make frequent transactions.", "A03 :: good_existing_customer implies -reject_loan_application | 13;\nP01 :: perceive implies account_owner_for_long | 21;\nP02 :: perceive implies transaction_frequency(high) | 22;\nA02 :: account_owner_for_long, transaction_frequency(high) implies good_existing_customer | 12;", "Loan Applicant", "N04", 3],
    ["You are not qualified as a good existing customer because your account balance is low for more than one year.", "P03 :: perceive implies account_balance_low_for(1, year) | 23;\nA04 :: account_balance_low_for(1, year) implies -good_existing_customer | 24;", "Bank Officer", "N05", 4],
    ["Why is my credit score low?", "S06 :: suppose implies -credit_score(low) | 00;", "Loan Applicant", "N06", 5],
    ["Your credit score is considered low because it is 582.", "C01 :: credit_score_value(582) # credit_score_value(590);\nP07 :: perceive implies credit_score_value(582) | 27;\nA05 :: credit_score_value(582) implies credit_score(low) | 15;", "Bank Officer", "N07", 6],
    ["My credit score is 590.", "P08 :: perceive implies credit_score_value(590) | 28;", "Loan Applicant", "N08", 7],
    ["Your credit score is considered low because it is below 600.", "A06 :: credit_score_value(590) implies credit_score_less_than(600) | 16;\nA07 :: credit_score_less_than(600) implies credit_score(low) | 17;", "Bank Officer", "N09", 8],
    ["Why are my care-giving obligations considered high?", "S04 :: suppose implies -caregiving_obligations(high) | 00;", "Loan Applicant", "N10", 9],
    ["Your care-giving obligations are considered high because you are female and have two children.", "P04 :: perceive implies gender(female) | 24;\nP05 :: perceive implies have(child, 2) | 25;\nA08 :: gender(female) implies female_obligations | 18;\nA09 :: have(child, 2), female_obligations implies caregiving_obligations(high) | 19;", "Bank Officer", "N11", 10],
    ["Gender should not be used to determine care-giving obligations.", "P06 :: perceive implies -female_obligations | 26;", "Loan Applicant", "N12", 11]
];

const constArgumentSet = [
    ["Loan application is rejected.", "S01", "S01 :: suppose implies reject_loan_application | 00;", "reject_loan_application", "Bank Officer", 0],
    ["Why is my loan application rejected?", "S02", "S02 :: suppose implies -reject_loan_application | 00;", "-reject_loan_application", "Loan Applicant", 1],
    ["Applicant's care-giving obligations are considered high.", "S03", "S03 :: suppose implies caregiving_obligations(high) | 00;", "caregiving_obligations(high)", "Bank Officer", 2],
    ["Why are my care-giving obligations considered high?", "S04", "S04 :: suppose implies -caregiving_obligations(high) | 00;", "-caregiving_obligations(high)", "Loan Applicant", 3],
    ["Applicant's credit score is considered low.", "S05", "S05 :: suppose implies credit_score(low) | 00;", "credit_score(low)", "Bank Officer", 4],
    ["Why is my credit score low?", "S06", "S06 :: suppose implies -credit_score(low) | 00;", "-credit_score(low)", "Loan Applicant", 5],
    ["Loan application should be rejected because applicant's care-giving obligations are considered high and credit score low.", "A01", "A01 :: caregiving_obligations(high), credit_score(low) implies reject_loan_application | 11;", "reject_loan_application", "Bank Officer", 6],
    ["I am a good existing customer because I own an account for a long time and I make frequent transactions.", "A02", "A02 :: account_owner_for_long, transaction_frequency(high) implies good_existing_customer | 12;", "good_existing_customer", "Loan Applicant", 7],
    ["Loan application should not be rejected because I am a good existing customer.", "A03", "A03 :: good_existing_customer implies -reject_loan_application | 13;", "-reject_loan_application", "Loan Applicant", 8],
    ["Applicant is not a good existing customer because applicant's account balance is low for more than one year.", "A04", "A04 :: account_balance_low_for(1, year) implies -good_existing_customer | 24;", "-good_existing_customer", "Bank Officer", 9],
    ["Credit score of 582 is considered low.", "A05", "A05 :: credit_score_value(582) implies credit_score(low) | 15;", "credit_score(low)", "Bank Officer", 10],
    ["Credit score of 590 is below 600.", "A06", "A06 :: credit_score_value(590) implies credit_score_less_than(600) | 16;", "credit_score_less_than(600)", "Bank Officer", 11],
    ["Credit score below 600 is considered low.", "A07", "A07 :: credit_score_less_than(600) implies credit_score(low) | 17;", "credit_score(low)", "Bank Officer", 12],
    ["Females have female obligations.", "A08", "A08 :: gender(female) implies female_obligations | 18;", "female_obligations", "Bank Officer", 13],
    ["Applicant's care-giving obligations are considered high because applicant has female obligations and has two children.", "A09", "A09 :: have(child, 2), female_obligations implies caregiving_obligations(high) | 19;", "caregiving_obligations(high)", "Bank Officer", 14],
    ["I own an account for a long time.", "P01", "P01 :: perceive implies account_owner_for_long | 21;", "account_owner_for_long", "Loan Applicant", 15],
    ["I make frequent transactions.", "P02 ", "P02 :: perceive implies transaction_frequency(high) | 22;", "transaction_frequency(high)", "Loan Applicant", 16],
    ["Applicant's account balance is low for more than one year.", "P03", "P03 :: perceive implies account_balance_low_for(1, year) | 23;", "account_balance_low_for(1, year)", "Bank Officer", 17],
    ["Applicant is a female.", "P04", "P04 :: perceive implies gender(female) | 24;", "gender(female)", "Bank Officer", 18],
    ["Applicant has two children.", "P05", "P05 :: perceive implies have(child, 2) | 25;", "have(child, 2)", "Bank Officer", 19],
    ["There is no such a thing as female obligations. Gender is irrelevant.", "P06", "P06 :: perceive implies -female_obligations | 26;", "-female_obligations", "Loan Applicant", 20],
    ["Applicant's credit score is 582.", "P07", "P07 :: perceive implies credit_score_value(582) | 27;", "credit_score_value(582)", "Bank Officer", 21],
    ["My credit score is 590.", "P08", "P08 :: perceive implies credit_score_value(590) | 28;", "credit_score_value(590)", "Loan Applicant", 22], 
    ["Credit score cannot be 590 and 582 simultaneously", "C01", "C01 :: credit_score_value(582) # credit_score_value(590);", "", "System", 23] 
];

const constExplanations = [
    ["Loan application should be rejected. ", "S01", "reject_loan_application", "Bank Officer"],
    ["Loan application should not be rejected. ", "S02", "-reject_loan_application", "Loan Applicant"],
    ["Applicant's care-giving obligations are considered high. ", "S03", "caregiving_obligations(high)", "Bank Officer"],
    ["Applicant's credit score is considered low. ", "S05", "credit_score(low)", "Bank Officer"],
    ["Loan application should be rejected because applicant's care-giving obligations are considered high and credit score low. ", "A01", "reject_loan_application", "Bank Officer"],
    ["Loan application should not be rejected because applicant is a good existing customer. ", "A03", "-reject_loan_application", "Loan Applicant"],
    ["Applicant owns an account for a long time. ", "P01", "account_owner_for_long", "Loan Applicant"],
    ["Applicant makes frequent transactions. ", "P02 ", "transaction_frequency(high)", "Loan Applicant"],
    ["Applicant is a good existing customer because applicant owns an account for a long time and makes frequent transactions. ", "A02", "good_existing_customer", "Loan Applicant"],
    ["Applicant's account balance is low for more than one year. ", "P03", "account_balance_low_for(1, year)", "Bank Officer"],
    ["Applicant is not a good existing customer because applicant's account balance is low for more than one year. ", "A04", "-good_existing_customer", "Bank Officer"],
    ["Applicant's credit score should not be considered low. ", "S06", "-credit_score(low)", "Loan Applicant"],
    ["Applicant's credit score is 582. ", "P07", "credit_score_value(582)", "Bank Officer"],
    ["Credit score of 582 is considered low. ", "A05", "credit_score(low)", "Bank Officer"],
    ["Applicant's credit score is 590. ", "P08", "credit_score_value(590)", "Loan Applicant"],
    ["Credit score of 590 is below 600. ", "A06", "credit_score_less_than(600)", "Bank Officer"],
    ["Credit score below 600 is considered low. ", "A07", "credit_score(low)", "Bank Officer"],
    ["Applicant's care-giving obligations should not be considered high. ", "S04", "-caregiving_obligations(high)", "Loan Applicant"],
    ["Applicant is a female. ", "P04", "gender(female)", "Bank Officer"],
    ["Applicant has two children. ", "P05", "have(child, 2)", "Bank Officer"],
    ["Females have female obligations (implicit claim). ", "A08", "female_obligations", "Bank Officer"],
    ["Applicant's care-giving obligations are considered high because applicant has female obligations and has two children. ", "A09", "caregiving_obligations(high)", "Bank Officer"],
    ["There is no such a thing as female obligations. ", "P06", "-female_obligations", "Loan Applicant"]
];

const constSystemPromptToSelectNLArgument = JSON.stringify(constContestDialogue) + "\nThe above JSON object contains a 2D table which represents a map between natural language arguments and their formal representation In Prudens. The first column of the table contains the natural language text and the second column contains the Prudens expressions. You should act as a translator of natural language text to Prudens expressions by using the table provided and return the index of the formal expressions mapped to the input natural language text. The index is the number in the last column of each row. If the input natural language text is paraphrased or expressed in a different way, you should match it with the natural language text closer to the meaning of the input text and then return the index of the mapped row. The input natural language text will be given in the prompt and you should return only the index. Do not return any explanations or any other output, just the index. If you cannot match the input text with the natural language text in the table, not matter how hard you try, return -1. Do not be strict: match natural language text with the closest suitable meaning."

const constSystemPromptToSelectPrudensArguments = JSON.stringify(constArgumentSet) + "\n1. The JSON array above is a 2D table that represents a map between natural language text and its formal representation in the form of Prudens expressions and it is named NL2PrudensMap. The columns of interest of table NL2PrudensMap are the first (NLT) and the sixth (IDX) column (last column). NLT column is a string that contains a natural language text. IDX column is an integer that represents the index of each row.\n2. The user input prompt will have the following format:\nNL: Natural language text\n3. Given the NL2PrudensMap table above, your task is to match the meaning of input natural language text in the user input prompt (NL) with the meaning of the natural language text in column NLT of the table. The following meta-rules (A to E) should be followed for the matching process. You should return to the user the index or the indexes of the matched row or rows (value in column IDX) in a JSON array.\n	A. General matching rule: If the NL is paraphrased or expressed in a different way than the text in NLT column, you should match it with the natural language text in NLT column closer to the meaning of the input natural language text in the user input prompt (NL).\nB. Single Match: If the meaning of the input natural language text in the user input prompt (NL) matches the natural language of NLT column in exactly one row, return the index (IDX) of that row in a JSON array with the value of the index as the single element of the array.\nC. Multiple Matches: If the meaning of the input natural language text in the user input prompt (NL) matches the natural language text of NLT column in more than one row, then return the index (IDX) of the row where the meaning of the natural language text in column NLT is closest to the meaning of the input natural language text in the user input prompt (NL) (i.e., the most relevant row) in a JSON array with the value of the index as the single element of the array.\nD. Cumulative Matches: If the meaning of the input natural language text in the user input prompt (NL) is matched with the natural language text in NLT column across multiple rows cumulatively, meaning the combined meaning of the NLT column of those rows best captures the meaning of NL, then return a JSON array with the values of the indexes (IDX) of all matched rows as the elements of the array.\nE. If no row is matched, return a JSON array with number -1 as the single element.\n**CRITICAL:**\n4. **Do not return any explanation**. **Return only a JSON array of integers as described in above meta-rules**. **Strictly follow the JSON format without additional commentary**.\n5. Below are some examples:\nNL: Why is my loan application rejected?\nReturn Value: [1]\nNL: Your credit score is considered low because it is 582.\nReturn Value: [10, 23]\nNL: My credit score is 590.\nReturn Value:[22, 23]\nNL: NL: Your credit score is considered low because it is below 600.\nReturn Value:[11, 12, 23]\nNL: Your care-giving obligations are considered high because you are female and have two children.\nReturn Value: [13, 14]\nNL: Gender should not be used to determine care-giving obligations.\nReturn Value: [20]"


async function loadPage(showOverlay) {

	globalcurrentArgument = 0;
	globalCurrentNLDialogue = '';
	globalCurrentPrudensDialogue = '@KnowledgeBase\n';

	let lResponseJSON = '{ "context": [], "inferences" : [], "facts" : [], "graph" : {}, "dilemmas" : [], "defeatedRules" : [], logs : [] }';

	if (showOverlay) {

		overlayOn();

		try {

			lResponseJSON = await prudens_ping();
			responseJSON = lResponseJSON;

			if (responseJSON.type == 'error')
				throw new Error(`${responseJSON.name}: ${responseJSON.message}`);

			else if (responseJSON.inferences[0].name != 'echo')
				throw new Error(`Unexpected Response: ${responseJSON.inferences[0].name}`);

			showPage(showOverlay);
		}

		catch (err) {
			showErrorConnectingToWebService(err);
		}
		
		console.log(lResponseJSON);
	}

	else
		showPage(showOverlay);


}



function showPage(showOverlay) {
	document.getElementById("loader").style.display = "none";

	nlArgumentsTextArea.setValue("");

	nlConclusionsTextArea.setValue("");
	document.getElementById("nextButton").textContent = "Start Dialogue";
	//document.getElementById("writeNextButton").disabled = true;
	document.getElementById("nestorPageContent").style.display = "block";

	if (showOverlay) {
		// Dirty workaround to load data correctly in control
		let prudensDialogue = globalCurrentPrudensDialogue + '\n\n' + constContestDialogue[0][1];
		prudensFormalDialogueTextarea.setValue(prudensDialogue);
		prudensDialogue += '\n\n' + constContestDialogue[1][1];;
		prudensFormalDialogueTextarea.setValue(prudensDialogue);
		prudensDialogue += '\n\n' + constContestDialogue[2][1];;
		prudensFormalDialogueTextarea.setValue(prudensDialogue);

		document.getElementById("textOverlay").innerHTML = "Contesting dialogue demo is ready! Click on the screen to start...";
		document.getElementById("nestorOverlay").addEventListener("click", overlayOff);
	}

	prudensFormalDialogueTextarea.setValue("");
	formalConclusionsTextArea.setValue("");
	document.getElementById("consoleNESTOR").textContent = "";

	getNextArgument();
}



function showErrorConnectingToWebService(errorMessage) {
	document.getElementById("loader").style.display = "none";
	document.getElementById("textOverlay").innerHTML = "Connection to Prudens Web Service could not be established (" + errorMessage + ")!"
}



function overlayOn() {
	document.getElementById("nestorOverlay").style.display = "block";
}



function overlayOff() {
	document.getElementById("nestorOverlay").style.display = "none";
}



async function getNextArgument() {

	document.getElementById("nextButton").textContent = "Next Argument";
	document.getElementById("writeNextButton").disabled = false;
    document.getElementById("btnViewSystemOutput").style.opacity = "0";

	try {
		if (globalcurrentArgument < constContestDialogue.length) {

			globalCurrentInterlocutor = constContestDialogue[globalcurrentArgument][2];
			let nlArgument = `${globalCurrentInterlocutor}: ${constContestDialogue[globalcurrentArgument][0]} (${constContestDialogue[globalcurrentArgument][3]})`;
			let nlDialogue = (globalCurrentNLDialogue == '') ? nlArgument : globalCurrentNLDialogue + '\n\n' + nlArgument;
			let prudensDialogue = globalCurrentPrudensDialogue + '\n\n' + constContestDialogue[globalcurrentArgument][1];;

			nlArgumentsTextArea.setValue(nlDialogue);

			// Scroll to the end of the editor
			var lastLineNL = nlArgumentsTextArea.lastLine();
			nlArgumentsTextArea.scrollTo(null, nlArgumentsTextArea.charCoords({line: lastLineNL, ch: 0}, "local").bottom);

			prudensFormalDialogueTextarea.setValue(prudensDialogue);
			// Scroll to the end of the editor
			var lastLine = prudensFormalDialogueTextarea.lastLine();
			prudensFormalDialogueTextarea.scrollTo(null, prudensFormalDialogueTextarea.charCoords({line: lastLine, ch: 0}, "local").bottom);

			globalCurrentNLDialogue = nlDialogue;
			globalCurrentPrudensDialogue = prudensDialogue;
			globalcurrentArgument++;

			inferConclusion();
		}
	}

	catch (err) {
		console.log(err);
	}
		
	console.log(`currentArgument=${globalcurrentArgument}`);

}





async function writeNextArgument() {

	document.getElementById("writeNextButton").textContent = "Write Next Argument";
	document.getElementById("writeNextButton").disabled = false;
    document.getElementById("btnViewSystemOutput").style.opacity = "0";

	try {

			openPopupFlex('argumentInputPopup', null);

			const {text, passkey} = await waitForUserInput();
			globalCurrentArgumentText = text;
			console.log('User input:', globalCurrentArgumentText);

		
			prudensIndex = await makeApiCallToChatGPT(constSystemPromptToSelectNLArgument, globalCurrentArgumentText, passkey);
			console.log("prudensIndex:", prudensIndex);

			if (prudensIndex >=0 && prudensIndex < constContestDialogue.length) {

				globalCurrentInterlocutor = (globalcurrentArgument % 2 == 0) ? "Bank Officer" : "Loan Applicant";
				let nlArgument = globalCurrentInterlocutor + ": " + globalCurrentArgumentText +
									` (Nw${(globalcurrentArgument+1).toString().padStart(2, '0')})`;
				let nlDialogue = (globalCurrentNLDialogue == '') ? nlArgument : globalCurrentNLDialogue + '\n\n' + nlArgument;

				let prudensDialogue = globalCurrentPrudensDialogue + '\n\n' + constContestDialogue[prudensIndex][1];
				nlArgumentsTextArea.setValue(nlDialogue);

				// Scroll to the end of the editor
				var lastLineNL = nlArgumentsTextArea.lastLine();
				nlArgumentsTextArea.scrollTo(null, nlArgumentsTextArea.charCoords({line: lastLineNL, ch: 0}, "local").bottom);

				prudensFormalDialogueTextarea.setValue(prudensDialogue);

				// Scroll to the end of the editor
				var lastLine = prudensFormalDialogueTextarea.lastLine();
				prudensFormalDialogueTextarea.scrollTo(null, prudensFormalDialogueTextarea.charCoords({line: lastLine, ch: 0}, "local").bottom);

				globalCurrentNLDialogue = nlDialogue;
				globalCurrentPrudensDialogue = prudensDialogue;
				globalcurrentArgument++;

				inferConclusion();
			}

			else {
				alert("Translation Error! Cannot match with an argument of translation map");
				throw new Error("Translation Error! Cannot match with an argument of translation map");
			}
	}

	catch (err) {
		console.log(err);
	}
		
}





async function writeAnArgument() {

	document.getElementById("writeNextButton").textContent = "Write An Argument";
	document.getElementById("writeNextButton").disabled = false;
    document.getElementById("btnViewSystemOutput").style.opacity = "0";

	try {

		openPopupFlex('argumentInputPopup', null);

		const {interlocutor, text, passkey} = await waitForUserInput();
		globalCurrentArgumentText = text;
		console.log(`${interlocutor}: ${globalCurrentArgumentText}`);
		
		let prudensIndexes = "";
		prudensIndexes = await makeApiCallToChatGPT(constSystemPromptToSelectPrudensArguments, "NL: " + globalCurrentArgumentText, passkey);
		console.log("prudensIndexes:", prudensIndexes);


		// First, try to convert string representation to an array
		if (typeof prudensIndexes === 'string') {
			try {
				prudensIndexes = JSON.parse(prudensIndexes);
			} catch (e) {
				// Handle parsing error
				alert("Translation Error! Cannot match with an argument of translation map (LLM returned unparsable array)");
				throw new Error("Translation Error! Cannot match with an argument of translation map");
			}
		}

		if (Array.isArray(prudensIndexes)) {

			if (prudensIndexes.length > 0) {

				let currentArgumentPrudensRepresentation = "";
				let initialCurrentArgumentPrudensRepresentation = "";
				let rulesAlreadyInPolicy = 0;

				for (var i = 0; i < prudensIndexes.length; i++) {

					var value = prudensIndexes[i];

					// If value is non-number
					if (typeof value !== 'number') {
						// Index value is non-number. Log and continue to next rule
						console.log(`Translation Error! LLM returned a non-numeric value: ${value} for index ${i}`);
						continue;
					}

					// else if value is less than zeto
					else if (value < 0) {
						// Index value is less than zero. Log and continue to next rule
						console.log(`Translation Error! LLM returned a negative value: ${value} for index ${i}`);
						continue;
					}
							
					// else if the new rule is already included in Prudens Dialogue
					else if (ruleIsIncludedInPolicy(globalCurrentPrudensDialogue, constArgumentSet[value][2], true, false)) {
						// This rule is already included in Prudens Dialogue. Log and continue to next rule
						console.log(`Rule ${constArgumentSet[value][2]} is already included in Prudens Dialogue`);
						rulesAlreadyInPolicy++;
						continue;
					}

					// else if all checks are OK add rule to initial Prudens representation of current argument
					else {
						initialCurrentArgumentPrudensRepresentation += constArgumentSet[value][2] + "\n";
					}
				
				}


				// Temporarily include new rule in current Prudens dialog in search for supporting rules
				let updatedCurrentPrudensDialogue = globalCurrentPrudensDialogue + "\n" + initialCurrentArgumentPrudensRepresentation;

				// Get supporting rules for initial new Prudens rules
				let supportingRules = "";
				supportingRules = getSupportingRules(updatedCurrentPrudensDialogue, initialCurrentArgumentPrudensRepresentation, constArgumentSet, true, false);

				// While there are no more supporting rules
				while (supportingRules != "") {

					// Add supporting rules found at the beginning of the Prudens representation of the argument
					currentArgumentPrudensRepresentation = supportingRules + currentArgumentPrudensRepresentation;

					// Temporarily include supporting rules in current Prudens dialog in search for more supporting rules
					updatedCurrentPrudensDialogue += "\n" + supportingRules;

					// Get new supporting rules for the previous supporting Prudens rules
					let previousSupportingRules = supportingRules;
					supportingRules = "";						
					supportingRules = getSupportingRules(updatedCurrentPrudensDialogue, previousSupportingRules, constArgumentSet, true, false);

				}

				// Add initial Prudens representation at the end of the Prudens representation of the argument
				currentArgumentPrudensRepresentation += initialCurrentArgumentPrudensRepresentation;


				// We have a translation. Let's see if we can do something with it...

				// Proceed to update the Natural Language Dialogue text
				if (interlocutor === "Auto") {

					if (globalCurrentInterlocutor === "Loan Applicant")
						globalCurrentInterlocutor = "Bank Officer";
					else
						globalCurrentInterlocutor = "Loan Applicant";

				}
				else
					globalCurrentInterlocutor = interlocutor;

				let nlArgument = globalCurrentInterlocutor +	": " + globalCurrentArgumentText +
				` (Nw${(globalcurrentArgument+1).toString().padStart(2, '0')})`;
				let nlDialogue = (globalCurrentNLDialogue == '') ? nlArgument : globalCurrentNLDialogue + '\n\n' + nlArgument;


				// If we managed to get a Prudens representation for this argument, go ahead to update Prudens Dialogue
				if (currentArgumentPrudensRepresentation !== "") {

					// Proceed to update the Prudens DIalogue text
					let prudensDialogue = globalCurrentPrudensDialogue + '\n\n' + currentArgumentPrudensRepresentation;

					// Set Natural Language Dialogue textbox with updated text
					nlArgumentsTextArea.setValue(nlDialogue);

					// Scroll to the end of the Natural Language Dialogue textbox
					var lastLineNL = nlArgumentsTextArea.lastLine();
					nlArgumentsTextArea.scrollTo(null, nlArgumentsTextArea.charCoords({line: lastLineNL, ch: 0}, "local").bottom);

					// Set Prudens Dialogue textbox with updated text
					prudensFormalDialogueTextarea.setValue(prudensDialogue);

					// Scroll to the end of the Prudens Dialogue textbox
					var lastLine = prudensFormalDialogueTextarea.lastLine();
					prudensFormalDialogueTextarea.scrollTo(null, prudensFormalDialogueTextarea.charCoords({line: lastLine, ch: 0}, "local").bottom);

					// Set global variables accordingly
					globalCurrentNLDialogue = nlDialogue;
					globalCurrentPrudensDialogue = prudensDialogue;
					globalcurrentArgument++;

					// Infer Conclusion by calling Prudens Reasoning Engine
					inferConclusion();

				}

				// Else if all rules returned are already in Prudens DIalogue (policy), just log the error
				else if (rulesAlreadyInPolicy == prudensIndexes.length) {
					console.log(`All rules returned (${rulesAlreadyInPolicy}) are already in Prudens DIalogue (policy)`);
				}

				// Else if no Prudens representation can be created for this argument, log it and report it
				else {
					// Handle empty Prudens representation
					alert("Prudens representation for this argument could not be created.");
					throw new Error("Prudens representation for this argument could not be created.");
				}

			}
			
			else {
				// Handle empty array
				alert("Translation Error! Cannot match with an argument of translation map (LLM returned empty array)");
				throw new Error("Translation Error! Cannot match with an argument of translation map");
			}
		}
			
		else {
			// Handle the case when prudensIndexes is null, undefined, or not an array
			alert("Translation Error! Cannot match with an argument of translation map (LLM returned invalid data)");
			throw new Error("Translation Error! Cannot match with an argument of translation map");
		}

	}

	catch (err) {
		console.log(err);
	}
		
}





async function inferConclusion() {

	let lResponseJSON = '{ "context": [], "inferences" : [], "facts" : [], "graph" : {}, "dilemmas" : [], "defeatedRules" : [], logs : [] }';

	try {

		lResponseJSON = await prudens_deduce(globalCurrentPrudensDialogue.replace(/[\t\n\r]/g, ''), "suppose; perceive;");
		responseJSON = lResponseJSON;
		let conclusionExpressions = [];

		if (lResponseJSON.type == 'error')
			throw new Error(`${responseJSON.name}: ${responseJSON.message}`);

		document.getElementById("btnViewSystemOutput").style.opacity = "1";

		let resultData = "Inferences:\n"
		resultData += responseJSON.inferences.map(obj => 
			obj ? 
			(obj.sign === false ? '-' : '') + obj.name + 
			(obj.arity > 0 && obj.args ? 
				`(${obj.args.map(argsObj => argsObj ? argsObj.value : '').join(", ")})` : 
				'') : 
			''
		).join(", ");


		resultData += "\nDilemmas:\n";
		resultData += responseJSON.dilemmas.map(arr => arr.filter(obj => obj).map(obj => obj ? obj.name : '').join(" # ")).join("\n");

		resultData += "\nKey Supporting Arguments:\n";
		conclusionExpressions = extractJustificationNamesFromGraph(responseJSON.graph, true);
		resultData += conclusionExpressions.join(', ');
		formalConclusionsTextArea.setValue(resultData);
		setTimeout(function () {
				formalConclusionsTextArea.refresh()
			},
			100
		)

		let nlJustification = "";
		let suggestion = "";

		evalResult = evaluateLoanApplication(responseJSON.inferences);
		if (evalResult == 0)
			suggestion = "Loan application rejection must be further supported otherwise it will be dismissed!"
		else {
			if (evalResult == 1)
				suggestion = "Loan application rejection is dismissed!"
			else
				suggestion = "Loan application rejection is upheld!"

			constExplanations.forEach(row => {
				if (row.length >= 2 && conclusionExpressions.includes(row[1])) {
					nlJustification += row[0];
				}
			});
		}

		let nlConclusions = "Determination: " + suggestion;
		nlConclusions += (nlJustification !== "") ? ("\n\nJustification:\n" + nlJustification) : "";

		//document.getElementById("inferredNLConclusions").innerHTML = nlConclusions;
		nlConclusionsTextArea.setValue(nlConclusions);
	}

	catch (err) {
		responseJSON = '{ "type": "", "name" : "", "message" : "" }';
		responseJSON.type =  'error';
		responseJSON.name = "Web call error";
		responseJSON.message =  err;
		document.getElementById("consoleNESTOR").innerHTML = lResponseJSON.message;
	}
	
	console.log(lResponseJSON);

}





function viewSystemOutput() {
	systemOutputEditor.set(responseJSON);
}





function openPopup(popupElement, actionNESTOR = null) {
	if (actionNESTOR)
		actionNESTOR();
    document.getElementById(popupElement).style.display = "block";
}





function openPopupFlex(popupElement, actionNESTOR = null) {
	if (actionNESTOR)
		actionNESTOR();
	setInterlocutorDefault();
    document.getElementById(popupElement).style.display = "flex";
}





function closePopup(popupElement) {
    document.getElementById(popupElement).style.display = "none";
}





// Function to return a promise that resolves when the user submits text
function waitForUserInput() {
    return new Promise((resolve, reject) => {
        // Replace the handleSubmit function with a new implementation
        window.handleSubmit = function() {
            text = document.getElementById('popupTextControl').value;
			passkey = document.getElementById('popupPassKey').value;
			interlocutor = document.getElementById('interlocutor').value;
			document.getElementById('popupTextControl').value = "";
            closePopup("argumentInputPopup");
            resolve({interlocutor, text, passkey});
        };

        // Handle the cancel button to reject the promise
        window.handleCancel = function() {
			document.getElementById('popupTextControl').value = "";
			document.getElementById('interlocutor').value = "Auto";
            closePopup("argumentInputPopup");
            reject(new Error('User canceled the input'));
        };
    });
}


function setInterlocutorDefault() {

	if (globalCurrentInterlocutor === "Loan Applicant")
		document.getElementById('interlocutor').value = "Bank Officer";

	else if (globalCurrentInterlocutor === "Bank Officer")
		document.getElementById('interlocutor').value = "Loan Applicant";

	else
	document.getElementById('interlocutor').value = "Auto";

}




document.querySelectorAll('.actionCommandIcon, .checkmark, .actionIcon').forEach(icon => {
    let tooltipTimeout;

    icon.addEventListener('mouseover', function() {
        const tooltip = this.querySelector('.tooltiptext');
        clearTimeout(tooltipTimeout); // Clear any existing timeout
        tooltip.style.visibility = 'visible';

        // Set a timeout to hide the tooltip after 2 seconds
        tooltipTimeout = setTimeout(() => {
            tooltip.style.visibility = 'hidden';
        }, 1000);
    });

    icon.addEventListener('mouseleave', function() {
        const tooltip = this.querySelector('.tooltiptext');
        clearTimeout(tooltipTimeout); // Clear the timeout
        tooltip.style.visibility = 'hidden'; // Hide the tooltip immediately
    });
});
