/* global chrome */
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