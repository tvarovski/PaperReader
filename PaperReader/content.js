(function() {
    'use strict';

    function getTextFromPage() {
        const selectors = ['article', 'main', '.post', '.content', 'body'];
        let contentElement = null;
        for (const selector of selectors) {
            contentElement = document.querySelector(selector);
            if (contentElement) break;
        }
        return contentElement ? contentElement.innerText : document.body.innerText;
    }

    function isValidAcronym(term, definition) {
        if (!definition) return false;
        const definitionWords = definition.replace(/[^a-zA-Z\s]/g, "").split(/\s+/);
        const generatedAcronym = definitionWords.map(word => word.charAt(0)).join("").toUpperCase();
        
        // Check for a direct match
        if (generatedAcronym === term) return true;

        // Allow for some flexibility, e.g., if acronym is a subset
        let termIndex = 0;
        for (let i = 0; i < generatedAcronym.length && termIndex < term.length; i++) {
            if (generatedAcronym[i] === term[termIndex]) {
                termIndex++;
            }
        }
        // Consider it valid if at least two letters match in sequence
        return termIndex >= 2;
    }

    function findAndAnnotateAbbreviations() {
        const pageText = getTextFromPage();
        if (!pageText) return;

        const definitions = new Map();
        const termsFound = new Set();

        // Regex for "FullName (Acronym)"
        const preRegex = /([\w\s-]{5,80})\s+\(([A-Z]{2,10})\)/g;
        let match;
        while ((match = preRegex.exec(pageText)) !== null) {
            const definition = match[1].trim();
            const term = match[2];
            if (isValidAcronym(term, definition)) {
                definitions.set(term, definition);
                termsFound.add(term);
            }
        }

        // Regex for "Acronym (FullName)"
        const postRegex = /\b([A-Z]{2,10})\b\s+\(([\w\s-]{5,80})\)/g;
        while ((match = postRegex.exec(pageText)) !== null) {
            const term = match[1];
            const definition = match[2].trim();
            if (isValidAcronym(term, definition)) {
                definitions.set(term, definition);
                termsFound.add(term);
            }
        }

        if (termsFound.size === 0) {
            console.log("No valid abbreviations found.");
            return;
        }

        const textNodes = [];
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while(node = walk.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(node => {
            if (node.parentElement.nodeName === 'SCRIPT' || node.parentElement.nodeName === 'STYLE' || node.parentElement.closest('.paper-reader-term')) {
                return;
            }
            let newHtml = node.nodeValue;
            let hasChanges = false;
            termsFound.forEach(term => {
                const definition = definitions.get(term);
                const termRegex = new RegExp(`\\b(${term})\\b`, 'g');
                if (definition && termRegex.test(newHtml)) {
                    newHtml = newHtml.replace(termRegex, `<span class="paper-reader-term" data-bs-toggle="tooltip" title="${definition}">${term}</span>`);
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                const newNode = document.createElement('span');
                newNode.innerHTML = newHtml;
                node.parentNode.replaceChild(newNode, node);
            }
        });

        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        console.log("Annotation finished!");
    }

    findAndAnnotateAbbreviations();

})();
