/* global chrome */
import React, {useEffect, useState} from "react";
import "./App.css";
import {loadDataFromUniqueKey, saveData} from "./utils";

export default () => {
    const [notes, setNotes] = useState({});
    const [newNotes, setNewNotes] = useState({});
    const [readOnly, setReadOnly] = useState(true);
    const [key, setKey] = useState(null);
    const [username, setUsername] = useState("");


    // get notes if they're there
    useEffect(() => {
        if (!key) {
            try {
                const newKey = document.getElementsByClassName("app-aware-link  msg-thread__link-to-profile")[0].href.split("/in/")[1];
                setKey(newKey);
            } catch (e) {
            }
        }
        setReadOnly(true);
        loadDataFromUniqueKey(key).then((item) => {
            if (Object.keys(item).length > 1) {
                try {
                    const newKey = document.getElementsByClassName("app-aware-link  msg-thread__link-to-profile")[0].href.split("/in/")[1];
                    setKey(newKey);
                } catch (e) {
                }
                return;
            }
            if (Object.keys(item).length < 2 && Object.keys(item)[0] !== undefined && Object.keys(item)[0] !== username) {
                //console.log("Resetting username from " + username + " to " + Object.keys(item)[0]);
                setUsername(Object.keys(item)[0]);
                return;
            }
            if (item) {
                //console.log("Setting notes for "+username+" to "+JSON.stringify(item[username]))
                setNotes(item[username]);
                setNewNotes(item[username]);
            } else {
                setNotes({});
                setNewNotes({});
            }
        });
    }, [username, key]);

    useEffect(() => {
        if (newNotes?.note) {
            saveData(username, newNotes);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newNotes]);

    const handleChange = (e) => {
        const editedText = {note: e.target.value};
        setNotes(editedText);
    };
    const editButtonClick = () => {
        setReadOnly(!readOnly);
        setNewNotes(notes)
    }
    const cancelButtonClick = () => {
        setReadOnly(true);
        setNotes(newNotes)
    }

    const renderNotes = () => {
        if (readOnly)
            return <div
                className="display-linebreak">{notes?.note ? notes.note : "No notes yet for this contact. Please create it in his profile."}</div>
        return <textarea
            name="notes"
            onChange={handleChange}
            style={{width: "100%", height: "100%", minHeight: "100px", boxSizing: "border-box"}}
            value={notes?.note || ""}
        />
    }
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            // listen for messages sent from background.js
            if (request.message === 'url_update') {
                if (!request.url.includes("/messaging/")) {
                    return;
                }
                //console.log("Got new URL " + request.url)
                //console.log("RUNTIME->Refreshing Key")
                const newKey = document.getElementsByClassName("app-aware-link  msg-thread__link-to-profile")[0].href.split("/in/")[1];
                //console.log("RUNTIME->New key: " + newKey);
                setKey(newKey);
            }
        });
    return (
        <div className="ember-view relative break-words">
            <div className="pvs-header__container">
                <div className="pvs-header__top-container--no-stack">
                    <div className="pvs-header__left-container--stack">
                        <div className="title-container pvs-header__title-container">
                            <h2 className="pvs-header__title text-heading-large">
                                <span aria-hidden="true" style={{float: "left"}}>InNotes</span>
                                {notes?.note &&
                                    <button id="innotes-edit" name="editButton" onClick={editButtonClick}
                                            className={"notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button" + (readOnly ? "--primary" : "--secondary")}>
                                        {readOnly ? "Edit" : "Save"}
                                    </button>}
                                {!readOnly &&
                                    <button name="cancelButton" onClick={cancelButtonClick}
                                            className={"notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--secondary artdeco-button--muted"}>
                                        Cancel
                                    </button>
                                }
                                <div id="innotes-username" style={{display: "none"}}>{username}</div>
                                <div id="innotes-key" style={{display: "none"}}>{key}</div>
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
            <div className="display-flex ph5 pv3 notes-container">
                {renderNotes()}
            </div>
        </div>
    );
};

