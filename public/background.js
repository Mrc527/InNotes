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

async function postData(url = "", data = {}, headers = {}) {
    // Default options are marked with *
    const response = await fetch(URL + url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
            ...headers
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

async function getRequest(url = "", data = {}, headers = {}) {
    const settings = (await chrome.storage.local.get("InNotes_Background"))["InNotes_Background"]
    // Default options are marked with *
    const response = await fetch(URL + url, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            "username": settings["username"],
            "password": settings["password"],
            // 'Content-Type': 'application/x-www-form-urlencoded',
            ...headers
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

async function sendData() {
    const data = await chrome.storage.local.get()
    return await postData("/", data)
}

async function getData() {
    return await getRequest("/", null)
}

async function getLastUpdate() {
    return await getRequest("/lastUpdate", null)
}

chrome.storage.local.get("InNotes_Background").then((value) => {
    console.log("Setting background refresh rate every " + (value["InNotes_Background"]["refresh_timeout"] || "600") + " seconds");
    setInterval(async function () {
        const settings = (await chrome.storage.local.get("InNotes_Background"))["InNotes_Background"]
        if (settings.enable) {
            const lastUpdateResult = await getLastUpdate()
            //console.log("lastUpdateResult.lastUpdate",lastUpdateResult)
            if (lastUpdateResult.lastUpdate > (settings.lastUpdate || 0)) {
                //console.log("fetching new data")
                //Fetch latest changes from remote
                getData().then((data) => {
                    const receivedData = JSON.parse(data)
                    settings.lastUpdate = new Date().getTime()
                    receivedData["InNotes_Background"] = settings
                    chrome.storage.local.set(receivedData, () => {
                    });
                    //console.log("Received Data",receivedData)
                })
            }
        }
    }, parseInt(value["InNotes_Background"]["refresh_timeout"] || "600") * 1000);
});