chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["bootstrap.min.css", "styles.css"]
    });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["jquery-2.2.0.min.js", "bootstrap.bundle.min.js", "content.js"]
    });
});
