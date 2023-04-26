/* global chrome */

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key].key === value);
}

export async function loadDataFromUniqueKey(key) {
    //console.log("loadDataFromUniqueKey->key",key)
    const fullDB = await chrome.storage.sync.get();
    //console.log("loadDataFromUniqueKey->DB",JSON.stringify(fullDB));
    const newKey = getKeyByValue(fullDB, key);
    //console.log("loadDataFromUniqueKey->newKey",newKey)
    if (!newKey) {
        let result = {}
        result[key] = {}
        return result;
    }
    return await chrome.storage.sync.get(newKey);
}


export function loadData(key) {
    return chrome.storage.sync.get(key);
}


export function saveData(key, value) {
    chrome.storage.sync.set({[key]: value}, () => {

    });
}

export function saveFullData(value) {
    chrome.storage.sync.set(value, () => {

    });
}