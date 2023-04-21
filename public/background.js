/* global chrome */
chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
        // read changeInfo data and do something with it
        // like send the new url to contentscripts.js
        if (changeInfo.url) {
            console.log(changeInfo.url)
            chrome.tabs.sendMessage( tabId, {
                message: 'url_update',
                url: changeInfo.url
            })
            return;
        }
        if (tab.url) {
            console.log(tab.url)
            chrome.tabs.sendMessage( tabId, {
                message: 'url_update',
                url: tab.url
            })
        }
    }
);
