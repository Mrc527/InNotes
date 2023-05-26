/* global chrome */
const URL = "https://innotes.visin.ch"

export async function checkForUpdates() {
    const settings = (await chrome.storage.local.get("InNotes_Background"))["InNotes_Background"]
    if (settings.enable) {
        const lastUpdateResult = await getLastUpdate()
        if (lastUpdateResult.lastUpdate > (settings.lastUpdate || 0)) {
            //Fetch latest changes from remote
            const data = await getRequest("/", null)
            const receivedData = JSON.parse(data)
            settings.lastUpdate = new Date().getTime()
            receivedData["InNotes_Background"] = settings
            await chrome.storage.local.set(receivedData, () => {
            });
        }
    }
}

async function getLastUpdate() {
    return await getRequest("/lastUpdate", null)
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

async function sendData() {
    const data = await chrome.storage.local.get()

    const username = data["InNotes_Background"]["username"]
    const password = data["InNotes_Background"]["password"]

    //Cleanup
    delete data["InNotes_Background"];
    delete data[""];
    return await postData("/", data, {"username": username, "password": password})
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key].key === value);
}

export async function loadDataFromUniqueKey(key) {
    //console.log("loadDataFromUniqueKey->key",key)
    const fullDB = await chrome.storage.local.get();
    //console.log("loadDataFromUniqueKey->DB",JSON.stringify(fullDB));
    const newKey = getKeyByValue(fullDB, key);
    //console.log("loadDataFromUniqueKey->newKey",newKey)
    if (!newKey) {
        let result = {}
        result[key] = {}
        return result;
    }
    return await chrome.storage.local.get(newKey);
}


export async function loadData(key) {
    return await chrome.storage.local.get(key);
}


export async function saveData(key, value) {
    await chrome.storage.local.set({[key]: value}, () => {
        sendData()
    });

}

export async function saveFullData(value) {
    await chrome.storage.local.set(value, () => {
        sendData()
    });

}

export async function getFullData() {
    return await chrome.storage.local.get();
}