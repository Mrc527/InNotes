/* global chrome */
const URL = "https://innotes.me/api"
//const URL = "http://localhost:3000/api"
//const URL = "http://localhost"

export async function getRequest(url = "", data = {}, headers = {}) {
    const settings = (await chrome.storage.sync.get("InNotes_Background"))["InNotes_Background"]
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

    if (response.status === 401) {
        throw new Error("Unauthorized");
    }

    try {
        return response.json();// parses JSON response into native JavaScript objects
    } catch (e) {
        return {};
    }
}


async function postData(url = "", data = {}, headers = {}) {
    const settings = (await chrome.storage.sync.get("InNotes_Background"))["InNotes_Background"] || []
    // Default options are marked with *
    return fetch(URL + url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
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
        body: typeof data === 'string'? data : JSON.stringify(data), // body data type must match "Content-Type" header
    });

}


export async function loadDataFromUniqueKey(key) {
    return await loadData(key,false)
}


export async function loadData(key,username) {
    let url = "/note/";
    if (key !== undefined && key !== "") {
        url += key;
    } else {
        url += "xx";
    }
    if (username) {
        url += "?username="+username;
    }
    return await getRequest(url, null);


}


export async function saveData(key, value) {
    return await postData("/note", value)
}
export async function registerNewUser(value) {
    return await postData("/user", value)
}

export async function saveFullData(value) {
    Object.keys(value).forEach((key) => {
        if(!key || !value[key].note|| 'undefined'===value[key].note){
            return;
        }
        value[key].linkedinUser=key
        saveData("",value[key])
    })

}

export async function getFullData() {
    return await getRequest("/note", null)
}
