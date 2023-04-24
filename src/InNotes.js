/* global chrome */
import React, {useEffect, useState} from "react";
import "./App.css";
import {loadData, saveData} from "./utils";

const InNotes = () => {
    const [notes, setNotes] = useState({});
    const [newNotes, setNewNotes] = useState({});
    const [readOnly, setReadOnly] = useState(true);
    const [username, setUsername] = useState(window.location.href.split("/in/")[1].split("/")[0]);

    /*const url = window.location.href;
    let username = url.split("/in/")[1].split("/")[0];*/


    // get notes if they're there
    useEffect(() => {
        if(username === ""){
            return;
        }
        setReadOnly(true);
        loadData(username).then((items) => {
            if(items) {
                setNotes(items[username]);
                setNewNotes(items[username]);
            }
            else{
                setNotes({});
                setNewNotes({});
            }
        });
    }, [username]);

    useEffect(() => {
        saveData(username,newNotes);
    }, [newNotes]);

    const handleChange = (e) => {
        const editedText = {note:e.target.value};
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
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            // listen for messages sent from background.js
            if (request.message === 'url_update') {
                //console.log("Setting username to "+request.url.split("/in/")[1].split("/")[0])
                setUsername(request.url.split("/in/")[1].split("/")[0]);
            }
        });
    const renderNotes = () =>{
        if(readOnly)
            return <div className="display-linebreak">{notes?.note ? notes.note : "No notes yet for "+ username}</div>
        return <textarea
                name="notes"
                onChange={handleChange}
                style={{width: "100%", height: "100%", minHeight: "100px", boxSizing: "border-box"}}
                value={notes?.note || ""}
            />
    }

    return (
        <div className="artdeco-card ember-view relative break-words pb3 mt2">
            <div className="pvs-header__container">
                <div className="pvs-header__top-container--no-stack">
                    <div className="pvs-header__left-container--stack">
                        <div className="title-container pvs-header__title-container">
                            <h2 className="pvs-header__title text-heading-large">
                                <span aria-hidden="true" style={{float:"left"}}>InNotes</span>
                                <button id="innotes-edit" name="editButton" onClick={editButtonClick}
                                        className={"notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button"+ (readOnly? "--primary" : "--secondary")}>
                                    {readOnly? "Edit" : "Save"}
                                </button>
                                {!readOnly &&
                                    <button  name="cancelButton" onClick={cancelButtonClick}
                                            className={"notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--secondary artdeco-button--muted"}>
                                        Cancel
                                    </button>
                                }
                                <div id="innotes-username" style={{display:"none"}}>{username}</div>
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
