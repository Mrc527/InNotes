/* global chrome */
import React, {useEffect, useState} from "react";
import "./App.css";
import {loadData, saveData} from "./utils";

const InNotes = () => {
    const [notes, setNotes] = useState({});
    const [newNotes, setNewNotes] = useState({});
    const [oldNotes, setOldNotes] = useState({});
    const [readOnly, setReadOnly] = useState(true);
    const [username, setUsername] = useState(window.location.href.split("/in/")[1].split("/")[0]);

    /*const url = window.location.href;
    let username = url.split("/in/")[1].split("/")[0];*/


    // get notes if they're there
    useEffect(() => {
        if (username === "") {
            return;
        }
        setReadOnly(true);
        let key = ""
        try{
            key = document.getElementsByClassName("pv-top-card--list pv-top-card--list-bullet")[0].childNodes[4].childNodes[2].href.split("%22")[1]
        } catch (e) {
        }
        loadData(key===""?username:key,key==="").then((item) => {
            if (item) {
                setOldNotes(item);
                setNotes(item);
                setNewNotes(item);
            } else {
                setNotes({});
                setNewNotes({});
                setOldNotes({});
            }
        });
    }, [username]);

    useEffect(() => {
        if (!newNotes || !newNotes.note) {
            return;
        }
        if (oldNotes && oldNotes.note !== newNotes.note) {
            let notesToBeSaved = {...newNotes}
            notesToBeSaved.timestamp = new Date().getTime()
            notesToBeSaved.linkedinUser = username
            if (!notesToBeSaved.key) {
                try {
                    //https://www.linkedin.com/search/results/people/?connectionOf=%5B%22ACoAAB_cYvcBD8_gbMPScHhtCCFwHGaAHVNiWsw%22%5D&network=%5B%22F%22%2C%22S%22%5D&origin=MEMBER_PROFILE_CANNED_SEARCH&sid=Db6
                    notesToBeSaved.key = document.getElementsByClassName("pv-top-card--list pv-top-card--list-bullet")[0].childNodes[4].childNodes[2].href.split("%22")[1];
                } catch (e) {
                }
            }
            saveData(username, notesToBeSaved).then(()=>setOldNotes(notesToBeSaved)).catch(()=> window.alert("Cannot save data.\nInNotes requires a separate login, please check to be logged in via the browser extension."));
        }


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newNotes]);

    const handleChange = (e) => {
        const editedText = {note: encodeURIComponent(e.target.value), key: notes.key};
        setNotes(editedText);
    };
    const editButtonClick = () => {
        setReadOnly(!readOnly);
        if (notes !== newNotes) {
            setNewNotes(notes)
        }
    }
    const cancelButtonClick = () => {
        setReadOnly(true);
        setNotes(newNotes)
    }
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            // listen for messages sent from background.js
            if (request.message === 'url_update') {
                //console.log("Setting username to "+request.url.split("/in/")[1].split("/")[0])
                setUsername(request.url.split("/in/")[1].split("/")[0]);
            }
        });
    const renderNotes = () => {
        if (readOnly)
            return <div
                className="display-linebreak">{notes?.note ? decodeURIComponent(notes.note) : "No notes yet for " + username}</div>
        return <textarea
            name="notes"
            onChange={handleChange}
            style={{width: "100%", height: "100%", minHeight: "100px", boxSizing: "border-box"}}
            value={decodeURIComponent(notes?.note || "")}
        />
    }

    return (
        <div className="artdeco-card ember-view relative break-words pb3 mt2">
            <div className="pvs-header__container">
                <div className="pvs-header__top-container--no-stack">
                    <div className="pvs-header__left-container--stack">
                        <div className="title-container pvs-header__title-container">
                            <h2 className="pvs-header__title text-heading-large">
                                <span aria-hidden="true" style={{float: "left", display: "flex", alignItems: "center"}}>
                                    <img src="https://marco.visin.ch/img/projects/InNotes.png"
                                         style={{marginRight: "5px"}} width="60" alt={"logo"}/>
                                    InNotes
                                </span>

                                <button id="innotes-edit" name="editButton" onClick={editButtonClick}
                                        className={"notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button" + (readOnly ? "--primary" : "--secondary")}>
                                    {readOnly ? "Edit" : "Save"}
                                </button>
                                {!readOnly &&
                                    <button name="cancelButton" onClick={cancelButtonClick}
                                            className={"notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--secondary artdeco-button--muted"}>
                                        Cancel
                                    </button>
                                }
                                <div id="innotes-username" style={{display: "none"}}>{username}</div>
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

export default InNotes;
