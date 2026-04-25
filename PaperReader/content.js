(function() {
    'use strict';

    function getPlainText(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.nodeValue;
        }
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
            let text = '';
            for (const child of node.childNodes) {
                text += getPlainText(child);
            }
            return text;
        }
        return '';
    }

    function getTextFromPage() {
        const selectors = ['article', 'main', '.post', '.content'];
        for (const selector of selectors) {
            const contentElement = document.querySelector(selector);
            if (contentElement) {
                return getPlainText(contentElement);
            }
        }
        return getPlainText(document.body);
    }

    function cleanDefinition(definition) {
        return definition
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/^(?:and|or|the|a|an)\s+/i, '');
    }

    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function isValidAcronym(term, definition) {
        if (!definition || !term) return false;

        const normalizedTerm = term
            .toUpperCase()
            .replace(/[^A-Z]/g, '')
            .replace(/S$/, '');

        const definitionWords = definition
            .replace(/[^a-zA-Z\s-]/g, ' ')
            .split(/\s+/)
            .filter(Boolean);

        const generatedAcronym = definitionWords.map(word => word.charAt(0)).join('').toUpperCase();

        if (!normalizedTerm || !generatedAcronym) return false;
        if (generatedAcronym === normalizedTerm) return true;

        let termIndex = 0;
        for (let i = 0; i < generatedAcronym.length && termIndex < normalizedTerm.length; i++) {
            if (generatedAcronym[i] === normalizedTerm[termIndex]) {
                termIndex++;
            }
        }
        return termIndex >= 2;
    }

    function processNode(node, termPattern, definitions) {
        if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (!parent) return;

            const blockedTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE']);
            if (blockedTags.has(parent.nodeName) || parent.closest('.paper-reader-term')) {
                return;
            }

            const text = node.nodeValue;
            if (!text) return;

            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            let hasChanges = false;
            let match;

            termPattern.lastIndex = 0;
            while ((match = termPattern.exec(text)) !== null) {
                hasChanges = true;

                if (match.index > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
                }

                const matchedTerm = match[0];
                const definition = definitions.get(matchedTerm.toUpperCase());
                if (definition) {
                    const span = document.createElement('span');
                    span.className = 'paper-reader-term';
                    span.setAttribute('data-bs-toggle', 'tooltip');
                    span.title = definition;
                    span.textContent = matchedTerm;
                    fragment.appendChild(span);
                } else {
                    fragment.appendChild(document.createTextNode(matchedTerm));
                }

                lastIndex = termPattern.lastIndex;
            }

            if (!hasChanges) return;

            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
            }
            parent.replaceChild(fragment, node);
            return;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && !node.classList.contains('paper-reader-term')) {
                Array.from(node.childNodes).forEach(child => processNode(child, termPattern, definitions));
            }
        }
    }

    function findAndAnnotateAbbreviations() {
        const pageText = getTextFromPage();
        if (!pageText) return;

        const definitions = new Map();
        const termsFound = new Set();

        const preRegex = /([A-Za-z][A-Za-z0-9-]*(?:\s+[A-Za-z][A-Za-z0-9-]*){1,15})\s*\(([A-Z][A-Za-z]{1,14})\)\s*(?:\[\d+\]|\(\d+\)|\d+)?/g;
        let match;
        while ((match = preRegex.exec(pageText)) !== null) {
            const definition = cleanDefinition(match[1]);
            const term = match[2].trim();
            if (isValidAcronym(term, definition)) {
                definitions.set(term.toUpperCase(), definition);
                termsFound.add(term);
            }
        }

        const postRegex = /\b([A-Z][A-Za-z]{1,14})\b\s*\(([A-Za-z][A-Za-z0-9-]*(?:\s+[A-Za-z][A-Za-z0-9-]*){1,15})\)/g;
        while ((match = postRegex.exec(pageText)) !== null) {
            const term = match[1].trim();
            const definition = cleanDefinition(match[2]);
            if (isValidAcronym(term, definition)) {
                definitions.set(term.toUpperCase(), definition);
                termsFound.add(term);
            }
        }

        if (termsFound.size === 0) {
            console.log("No valid abbreviations found.");
            return;
        }

        const selectors = ['article', 'main', '.post', '.content', 'body'];
        let contentElement = null;
        for (const selector of selectors) {
            contentElement = document.querySelector(selector);
            if (contentElement) break;
        }
        
        const escapedTerms = Array.from(termsFound)
            .sort((a, b) => b.length - a.length)
            .map(escapeRegExp);

        if (escapedTerms.length === 0) {
            return;
        }

        const termPattern = new RegExp(`\\b(?:${escapedTerms.join('|')})\\b`, 'g');
        processNode(contentElement || document.body, termPattern, definitions);

        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    findAndAnnotateAbbreviations();
})();
