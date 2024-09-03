function toc() {
	"use strict";
	const headings = document.getElementById("main-body").querySelectorAll(["h2", "h3"]);
	let tableOfContents = "<div class=\"toc-ul\"><ul>";
	for (const heading of headings) {
		heading.setAttribute("id", beautifyTOC(heading.textContent));
		tableOfContents += "<li><div class=\"toc-entry\"><a href=\"#" + heading.id + "\"><div class=\"toc-link\">" + heading.textContent + "</div></a></div></li>"
	}
	// console.log(tableOfContents);
	document.getElementById("toc").innerHTML = tableOfContents + "</ul></div>";
}


function beautifyTOC(title) {
	"use strict";
	const delimeter = /\s+/;
	const titleArray = title.split(delimeter);
	let beautifulTitle = "";
	for (let i=0; i<titleArray.length-1; i++) {
		beautifulTitle += titleArray[i] + "-";
	}
	beautifulTitle += titleArray[titleArray.length-1];
	return beautifulTitle;
}
