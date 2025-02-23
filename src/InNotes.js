/* global chrome */
import React, {useEffect, useState, useCallback} from "react";
import "./App.css";
import {loadData, saveData} from "./utils";
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en)
TimeAgo.addLocale(en)

const timeAgo = new TimeAgo('en-US')

const editButtonStyle = "notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--primary";
const saveButtonStyle = "notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--primary";
const cancelButtonStyle = "notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--secondary artdeco-button--muted";
const deleteButtonStyle = "notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--secondary artdeco-button--destructive";


const NoteItem = ({note, index, editNote, deleteNote, autoFocus, isNew, cancelNewNote}) => {
    const [isEditing, setIsEditing] = useState(isNew || false);
    const [text, setText] = useState(decodeURIComponent(note.text)); // Initialize with decoded text
    const textAreaRef = React.useRef(null);

    useEffect(() => {
        if (isEditing && autoFocus && textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, [isEditing, autoFocus]);

    const handleEdit = () => {
        if (text.trim() === "") {
            if (isNew) {
                cancelNewNote(index);
            }
            return;
        }
        editNote(index, text);
        setIsEditing(false);
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            if (isNew) {
                cancelNewNote(index);
            } else {
                setText(decodeURIComponent(note.text));
                setIsEditing(false);
            }
        }
    };

    const handleCancel = () => {
        if (isNew) {
            cancelNewNote(index);
        } else {
            setText(decodeURIComponent(note.text));
            setIsEditing(false);
        }
    };

    const lastUpdateDate = new Date(note.lastUpdate);
    const timeAgoString = timeAgo.format(lastUpdateDate);
    const fullDateString = lastUpdateDate.toLocaleString();

    return (
        <div className="note-item" style={{marginBottom: "2rem"}}>
            {isEditing ? (
                <>
                    <textarea
                        ref={textAreaRef}
                        value={text}
                        onChange={handleTextChange}
                        onKeyDown={handleKeyDown}
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            overflowY: 'auto',
                            minHeight: '5em',
                            maxHeight: '10em',
                            /* height: 'auto' */
                        }}
                    />
                    <button onClick={handleEdit} className={saveButtonStyle}>Save</button>
                    <button onClick={handleCancel} className={cancelButtonStyle}>Cancel</button>
                </>
            ) : (
                <>
                    <div style={{position: 'relative', minHeight: "4rem"}}>
                        <div style={{position: 'absolute', top: '0', right: '0'}}>
                            <button onClick={() => setIsEditing(true)} className={editButtonStyle}>Edit</button>
                            <button onClick={() => deleteNote(index)} className={deleteButtonStyle}>Delete</button>
                        </div>
                        <div className="display-linebreak">{decodeURIComponent(note.text)}</div>
                        <div title={fullDateString} style={{fontSize: '0.8em', color: '#888'}}>
                            Last modified: {timeAgoString}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const InNotes = () => {
    const [notes, setNotes] = useState({});
    const [newNotes, setNewNotes] = useState({});
    const [oldNotes, setOldNotes] = useState({});
    const [username, setUsername] = useState(window.location.href.split("/in/")[1].split("/")[0]);
    const [newNoteIndex, setNewNoteIndex] = useState(null);

    useEffect(() => {
        if (username === "") {
            return;
        }
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
        setNewNoteIndex(updatedNotes.data.length - 1); // Set the index of the new note
    };

    const editNote = useCallback((index, text) => {
        // Create a new object for updatedNotes
        const updatedNotes = {
            ...notes,
            data: notes.data.map((note, i) =>
              i === index ? {
                  ...note,
                  text: encodeURIComponent(text),
                  lastUpdate: new Date().getTime()
              } : note
            )
        };
        setNotes(updatedNotes);
        setNewNotes(updatedNotes);
        setNewNoteIndex(null);
    }, [notes]);


    const deleteNote = useCallback((index) => {
        // Create a new object for updatedNotes
        const updatedNotes = {
            ...notes,
            data: notes.data.filter((_, i) => i !== index)
        };
        setNotes(updatedNotes);
        setNewNotes(updatedNotes);
        setNewNoteIndex(null);
    }, [notes]);

    const cancelNewNote = useCallback((index) => {
        const updatedNotes = {
            ...notes,
            data: notes.data.filter((_, i) => i !== index)
        };
        setNotes(updatedNotes);
        setNewNotes(updatedNotes);
        setNewNoteIndex(null);
    }, [notes]);


    const renderNotes = () => {
        if (notes.data) {
            return (
                <>
                    {notes.data.map((note, index) => (
                        <NoteItem
                            key={index}
                            note={note}
                            index={index}
                            editNote={editNote}
                            deleteNote={deleteNote}
                            autoFocus={index === newNoteIndex} // Pass autoFocus prop
                            isNew={index === newNoteIndex}
                            cancelNewNote={cancelNewNote}
                        />
                    ))}
                </>
            );
        } else {
            return <textarea
                name="notes"
                onChange={handleChange}
                style={{width: "100%", height: "100%", minHeight: "100px", boxSizing: "border-box"}}
                value={decodeURIComponent(notes?.note || "")}
            />;
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
                                <div id="innotes-username" style={{display: "none"}}>{username}</div>
                            </h2>
                        </div>
                    </div>
                    <div style={{float: 'right', marginTop: '10px'}}>
                        <button onClick={addNote} className={editButtonStyle}>Add Note</button>
                    </div>
                </div>
            </div>
            <div className="display-flex ph5 pv3 notes-container" style={{flexDirection: "column"}}>
                {renderNotes()}
            </div>
        </div>
    );
};

export default InNotes;
