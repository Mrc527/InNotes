/* global chrome */
chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
        // read changeInfo data and do something with it
        // like send the new url to contentscripts.js
        try {
            if (changeInfo.url) {
                if(!changeInfo.url.includes("www.linkedin.com")){
                    return;
                }
                console.log(changeInfo.url)
                chrome.tabs.sendMessage(tabId, {
                    message: 'url_update',
                    url: changeInfo.url
                })
                return;
            }
            if (tab.url) {
                if(!tab.url.includes("www.linkedin.com")){
                    return;
                }
                console.log(tab.url)
                chrome.tabs.sendMessage(tabId, {
                    message: 'url_update',
                    url: tab.url
                })
            }
        }
        catch (e){
            console.error(e);
        }
    }
);
