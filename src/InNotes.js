// /src/InNotes.js
/* global chrome */
import React, {useEffect, useState, useCallback} from "react";
import "./App.css";
import {loadData, saveData} from "./utils";

const NoteItem = ({note, index, editNote, deleteNote}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(decodeURIComponent(note.text)); // Initialize with decoded text

    const handleEdit = () => {
        editNote(index, text);
        setIsEditing(false);
    };

    return (
        <div className="note-item">
            {isEditing ? (
                <>
                    <textarea value={text} onChange={(e) => setText(e.target.value)}/>
                    <button onClick={handleEdit}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </>
            ) : (
                <>
                    <div className="display-linebreak">{decodeURIComponent(note.text)}</div>
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                    <button onClick={() => deleteNote(index)}>Delete</button>
                </>
            )}
        </div>
    );
};


const InNotes = () => {
    const [notes, setNotes] = useState({});
    const [newNotes, setNewNotes] = useState({});
    const [oldNotes, setOldNotes] = useState({});
    const [readOnly, setReadOnly] = useState(true);
    const [username, setUsername] = useState(window.location.href.split("/in/")[1].split("/")[0]);

    useEffect(() => {
        if (username === "") {
            return;
        }
        setReadOnly(true);
        let key = ""
        try {
            key = document.getElementsByClassName("pv-top-card--list pv-top-card--list-bullet")[0].childNodes[4].childNodes[2].href.split("%22")[1]
        } catch (e) {
        }
        loadData(key === "" ? username : key, key === "").then((item) => {
            if (item) {
                if (item.data && typeof item.data === 'string') {
                    item.data = JSON.parse(item.data);
                }
                // Normalize the data to ensure 'creationDate' exists and create a new array
                const normalizedData = item.data ? item.data.map(note => {
                    const newNote = {...note}; // Create a copy
                    if (newNote.date) {
                        newNote.creationDate = newNote.date;
                        delete newNote.date;
                    }
                    return newNote;
                }) : [];
                const newItem = {...item, data: normalizedData};

                setOldNotes(newItem);
                setNotes(newItem);
                setNewNotes(newItem);
            } else {
                setNotes({});
                setNewNotes({});
                setOldNotes({});
            }
        });
    }, [username]);

    const saveDataToBackend = useCallback((notesToBeSaved) => {
        saveData(username, notesToBeSaved)
            .then(() => {
                setOldNotes(notesToBeSaved);
            })
            .catch(() => window.alert("Cannot save data.\nInNotes requires a separate login, please check to be logged in via the browser extension."));
    }, [username]);

    useEffect(() => {
        if (!newNotes) {
            return;
        }

        // Deep compare newNotes with oldNotes
        const notesChanged = JSON.stringify(newNotes) !== JSON.stringify(oldNotes);

        if (notesChanged) {
            // Create a new object for notesToBeSaved
            let notesToBeSaved = {...newNotes};
            notesToBeSaved.timestamp = new Date().getTime();
            notesToBeSaved.linkedinUser = username;

            if (!notesToBeSaved.data && newNotes.note) {
                notesToBeSaved.data = [
                    {
                        creationDate: new Date().getTime(),
                        lastUpdate: new Date().getTime(),
                        text: newNotes.note
                    }
                ];
                delete notesToBeSaved.note;
            } else if (notesToBeSaved.data) {
                // Create a new array with updated lastUpdate
                notesToBeSaved.data = notesToBeSaved.data.map(note => ({
                    ...note,
                    lastUpdate: new Date().getTime()
                }));
            }

            if (!notesToBeSaved.key) {
                try {
                    notesToBeSaved.key = document.getElementsByClassName("pv-top-card--list pv-top-card--list-bullet")[0].childNodes[4].childNodes[2].href.split("%22")[1];
                } catch (e) {
                }
            }

            saveDataToBackend(notesToBeSaved);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newNotes, saveDataToBackend]);

    const handleChange = (e) => {
        const editedText = {note: e.target.value, key: notes.key};
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
            if (request.message === 'url_update') {
                setUsername(request.url.split("/in/")[1].split("/")[0]);
            }
        });

    const addNote = () => {
        const newNote = {
            creationDate: new Date().getTime(),
            lastUpdate: new Date().getTime(),
            text: ""
        };
        // Create a new object for updatedNotes
        const updatedNotes = {...notes, data: [...(notes.data || []), newNote]};
        setNotes(updatedNotes);
        setNewNotes(updatedNotes);
    };

    const editNote = useCallback((index, text) => {
        // Create a new object for updatedNotes
        const updatedNotes = {
            ...notes,
            data: notes.data.map((note, i) =>
                i === index ? {...note, text: encodeURIComponent(text), lastUpdate: new Date().getTime()} : note
            )
        };
        setNotes(updatedNotes);
        setNewNotes(updatedNotes);
    }, [notes]);

    const deleteNote = useCallback((index) => {
        // Create a new object for updatedNotes
        const updatedNotes = {
            ...notes,
            data: notes.data.filter((_, i) => i !== index)
        };
        setNotes(updatedNotes);
        setNewNotes(updatedNotes);
    }, [notes]);


    const renderNotes = () => {
        if (readOnly) {
            if (notes.data) {
                return (
                    <div>
                        {notes.data.map((note, index) => (
                            <div key={index} className="note-item">
                                <div className="display-linebreak">{decodeURIComponent(note.text)}</div>
                            </div>
                        ))}
                    </div>
                );
            } else {
                return <div
                    className="display-linebreak">{notes?.note ? decodeURIComponent(notes.note) : "No notes yet for " + username}</div>;
            }
        } else {
            if (notes.data) {
                return (
                    <div>
                        {notes.data.map((note, index) => (
                            <NoteItem
                                key={index}
                                note={note}
                                index={index}
                                editNote={editNote}
                                deleteNote={deleteNote}
                            />
                        ))}
                        <button onClick={addNote}>Add Note</button>
                    </div>
                );
            } else {
                return <textarea
                    name="notes"
                    onChange={handleChange}
                    style={{width: "100%", height: "100%", minHeight: "100px", boxSizing: "border-box"}}
                    value={decodeURIComponent(notes?.note || "")}
                />;
            }
        }
    };

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
