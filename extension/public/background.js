/* global chrome */
const URL = "https://innotes.visin.ch"
chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        try {
            if (changeInfo.url) {
                if (!changeInfo.url.includes("www.linkedin.com")) {
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
                if (!tab.url.includes("www.linkedin.com")) {
                    return;
                }
                console.log(tab.url)
                chrome.tabs.sendMessage(tabId, {
                    message: 'url_update',
                    url: tab.url
                })
            }
        } catch (e) {
            //console.error(e);
        }
    }
);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.message === "openRegistrationPopup") {
          chrome.windows.create({
              url: "popup.html", // Replace with the actual URL of your popup
              type: "popup",
              width: 400,
              height: 600
          });
      }
  }
);
