
/* global chrome */

import {BASE_URL} from "./constants";

async function getRequest(url = "", data = {}, headers = {}) {
    const settings = (await chrome.storage.sync.get("InNotes_Background"))["InNotes_Background"]
    // Default options are marked with *
    const response = await fetch(BASE_URL + url, {
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
    return fetch(BASE_URL + url, {
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

async function putData(url = "", data = {}, headers = {}) {
    const settings = (await chrome.storage.sync.get("InNotes_Background"))["InNotes_Background"] || []
    // Default options are marked with *
    return fetch(BASE_URL + url, {
        method: "PUT", // *GET, POST, PUT, DELETE, etc.
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

async function deleteData(url = "", data = {}, headers = {}) {
    const settings = (await chrome.storage.sync.get("InNotes_Background"))["InNotes_Background"] || []
    // Default options are marked with *
    return fetch(BASE_URL + url, {
        method: "DELETE", // *GET, POST, PUT, DELETE, etc.
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


async function loadDataFromUniqueKey(key) {
    return await loadData(key,false)
}


async function loadData(key,username) {
    let url = "/linkedin/";
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

async function loadNotes(linkedinDataId) {
    let url = `/note?linkedinDataId=${linkedinDataId}`;
    return await getRequest(url, null);
}

async function saveData(key, value) {
    return await postData("/linkedin", value)
}

async function updateNote(noteId, data) {
    return await putData(`/note/${noteId}`, data);
}
async function saveFullData(value) {
    Object.keys(value).forEach((key) => {
        if(!key || !value[key].note|| 'undefined'===value[key].note){
            return;
        }
        value[key].linkedinUser=key
        saveData("",value[key])
    })

}

async function getFullData() {
    return await getRequest("/linkedin", null)
}

// Group Management
async function getGroups() {
    return await getRequest("/group");
}

async function getGroup(groupId) {
    return await getRequest(`/group/${groupId}`);
}

async function createGroup(data) {
    return await postData("/group", data);
}

async function updateGroup(groupId, data) {
    return await postData(`/group/${groupId}`, data);
}

async function deleteGroup(groupId) {
    return await deleteData(`/group/${groupId}`);
}

// Group Membership
async function getGroupMembers(groupId) {
    return await getRequest(`/group/${groupId}/members`);
}

async function addGroupMember(groupId, userId) {
    return await postData(`/group/${groupId}/members`, { userId });
}

async function deleteGroupMember(groupId, userId) {
    return await deleteData(`/group/${groupId}/members`, { userId });
}

// Note Sharing (Read)
async function shareNoteRead(noteId, userId, groupId) {
    return await postData(`/note/${noteId}/share/read`, { userId, groupId });
}

async function unshareNoteRead(noteId, userId, groupId) {
    return await deleteData(`/note/${noteId}/share/read`, { userId, groupId });
}

// Note Sharing (Edit)
async function shareNoteEdit(noteId, userId, groupId) {
    return await postData(`/note/${noteId}/share/edit`, { userId, groupId });
}

async function unshareNoteEdit(noteId, userId, groupId) {
    return await deleteData(`/note/${noteId}/share/edit`, { userId, groupId });
}

export {
    getRequest,
    postData,
    deleteData,
    loadDataFromUniqueKey,
    loadData,
    saveData,
    loadNotes,
    saveFullData,
    getFullData,
    getGroups,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    addGroupMember,
    deleteGroupMember,
    shareNoteRead,
    unshareNoteRead,
    shareNoteEdit,
    unshareNoteEdit,
    updateNote,
    putData
};
