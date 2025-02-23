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

const colorPalette = [
    {name: 'White', code: '#FFFFFF'},       // White
    {name: 'Red', code: '#FF0000'},         // Red
    {name: 'Green', code: '#00FF00'},       // Green
    {name: 'Blue', code: '#0000FF'},        // Blue
    {name: 'Yellow', code: '#FFFF00'},      // Yellow
    {name: 'Magenta', code: '#FF00FF'},     // Magenta
    {name: 'Cyan', code: '#00FFFF'},        // Cyan
    {name: 'Orange', code: '#FFA500'},       // Orange
    {name: 'Lime', code: '#32CD32'},         // Lime
    {name: 'SlateGray', code: '#708090'}    // SlateGray
];

const NoteItem = ({note, index, editNote, deleteNote, autoFocus, isNew, cancelNewNote}) => {
    const [isEditing, setIsEditing] = useState(isNew || false);
    const [text, setText] = useState(decodeURIComponent(note.text)); // Initialize with decoded text
    const [flagColor, setFlagColor] = useState(note.flagColor || '');
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
        editNote(index, text, flagColor === 'none' ? null : flagColor);
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
        <div className="note-item" style={{marginBottom: "2rem", display: 'flex'}}>
            <div style={{width: '0.5rem', backgroundColor: flagColor && flagColor !== 'none' ? flagColor : 'transparent', marginRight: '0.5rem'}}/>
            <div style={{flex: 1}}>
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
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: '0.5rem',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <label style={{marginRight: '0.5rem', flexShrink: 0}}>Color:</label>
                                <select value={flagColor} onChange={(e) => setFlagColor(e.target.value)}
                                        style={{
                                            maxWidth: '15rem',
                                            padding: '0.2rem',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                            marginRight: '1rem',
                                            flexShrink: 0 // Prevent select from shrinking
                                        }}>
                                    <option value="none">No Flag</option>
                                    {colorPalette.map((color, index) => (
                                        <option key={index} value={color.code}>{color.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <button onClick={handleEdit} className={saveButtonStyle}
                                        style={{marginRight: '0.5rem', flexShrink: 0}}>Save
                                </button>
                                <button onClick={handleCancel} className={cancelButtonStyle}
                                        style={{flexShrink: 0}}>Cancel
                                </button>
                            </div>
                        </div>
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
        </div>
    );
};

const InNotes = () => {
    const [notes, setNotes] = useState(null);
    const [newNotes, setNewNotes] = useState(null);
    const [oldNotes, setOldNotes] = useState(null);
    const [username, setUsername] = useState(window.location.href.split("/in/")[1].split("/")[0]);
    const [newNoteIndex, setNewNoteIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registrationError, setRegistrationError] = useState(false);

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
            setLoading(false);
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
                setRegistrationError(false);
            } else {
                setNotes({});
                setNewNotes({});
                setOldNotes({});
            }
        }).catch(error => {
            setLoading(false);
            setRegistrationError(true);
            setNotes(null);
            console.error("Error Load Data", error);
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
            text: "",
        };
        // Create a new object for updatedNotes
        const updatedNotes = {...notes, data: [...(notes.data || []), newNote]};
        setNotes(updatedNotes);
        setNewNotes(updatedNotes);
        setNewNoteIndex(updatedNotes.data.length - 1); // Set the index of the new note
    };

    const editNote = useCallback((index, text, flagColor) => {
        // Create a new object for updatedNotes
        const updatedNotes = {
            ...notes,
            data: notes.data.map((note, i) => {
                    if (i === index) {
                        const updatedNote = {
                            ...note,
                            text: encodeURIComponent(text),
                            lastUpdate: new Date().getTime()
                        };
                        if (flagColor) {
                            updatedNote.flagColor = flagColor;
                        } else {
                            delete updatedNote.flagColor;
                        }
                        return updatedNote;
                    } else {
                        return {...note}; // Copy other notes
                    }
                }
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
        if (loading) {
            return (
                <div className="skeleton-container">
                    <div className="skeleton-flag"/>
                    <div className="skeleton-text"/>
                    <div className="skeleton-date"/>
                </div>
            );
        }

        if (registrationError) {
            return (
                <div>
                    Please <a href="#">register</a> to use InNotes.
                </div>
            );
        }

        if (notes && notes.data) {
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
                </div>
            </div>
            <div className="display-flex ph5 pv3 notes-container" style={{flexDirection: "column"}}>
                {renderNotes()}
            </div>
        </div>
    );
};

export default InNotes;
