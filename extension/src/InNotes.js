/* global chrome */
import React, {useEffect, useState, useCallback, useRef} from "react";
import "./App.css";
import {loadData, saveData, getRequest, postData, deleteData} from "./utils";
import NoteList from "./components/NoteList";
import TagManagement from "./components/TagManagement";
import StatusManagement from "./components/StatusManagement";
import StatusModal from "./components/StatusModal";

const noteHasToBeSaved = (previous, current) => {
    console.log("Checking for changes", JSON.stringify(previous), JSON.stringify(current))
    if (JSON.stringify(previous) === JSON.stringify(current)) {
        return false;
    }
    if (!previous?.linkedinKey && !previous?.linkedinUser) {
        return false;
    }

    if (!current.note && (!current.notes || current.notes.length === 0)) {
        if (previous.note || (previous.notes && previous.notes.length > 0)) {
            return true;
        }
    }
    if (!previous.notes && current.notes && current.notes.length === 0) {
        return false;
    }


    function findDifferences(previous, current) {
        const differences = {};

        for (let key in current) {
            if (current.hasOwnProperty(key)) {
                if (previous[key] !== current[key]) {
                    differences[key] = {
                        previous: previous[key],
                        current: current[key]
                    };
                }
            }
        }

        return differences;
    }

    const differences = findDifferences(previous, current);

    if (Object.keys(differences).length === 1 && differences.linkedinUser) {
        return false;
    }


    console.log("JSON has changed", differences);

    if (Object.keys(previous).length === 0) {
        if (current?.id > 0) {
            // If there is an ID, it means the data has just loaded from the backend.
            return false;
        }
    }
    return true;
}

const getKey = () => {
    return new Promise((resolve) => {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            // Document is already loaded
            resolve(getKeyInner());
        } else {
            // Wait for the document to load
            document.addEventListener('DOMContentLoaded', () => {
                resolve(getKeyInner());
            });
        }
    });
};
const getKeyInner = () => {
    let value = "";
    try {
        const href = decodeURIComponent(document.querySelector('a[href*="linkedin.com/in/"][href*="miniProfileUrn="]')?.href);
        const miniProfileUrn = href.substring(href.indexOf("miniProfileUrn=") + "miniProfileUrn=".length);
        value = miniProfileUrn.substring(miniProfileUrn.indexOf(":") + 3);
        value = value.substring(value.lastIndexOf("fs_miniProfile:") + 15);
    } catch (e) {
    }
    return value;
};

const InNotes = () => {
    const [notes, setNotes] = useState(null);
    const [username, setUsername] = useState(window.location.href.split("/in/")[1].split("/")[0]);
    const [newNoteIndex, setNewNoteIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registrationError, setRegistrationError] = useState(false);
    const [tags, setTags] = useState([]);
    const [statusId, setStatusId] = useState("");
    const [addingTag, setAddingTag] = useState(false);
    const [newTag, setNewTag] = useState('');
    const newTagInputRef = useRef(null);
    const [statuses, setStatuses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openRegistrationPopup = () => {
        chrome.runtime.sendMessage({message: "openRegistrationPopup"});
    };

    const previousNotes = useRef(notes);

    const fetchStatuses = useCallback(async () => {
        try {
            const data = await getRequest('/statuses');
            setStatuses(data);
        } catch (error) {
            console.error("Error fetching statuses:", error);
        }
    }, []);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);

    useEffect(() => {
        if (username) {
            setLoading(true);
            setRegistrationError(false);
            getKey().then(key => loadData(key, username)
                .then(item => {
                    setLoading(false);
                    if (item) {
                        if (!item.notes && item.note) {
                            item.notes = [{
                                creationDate: new Date().getTime(),
                                lastUpdate: new Date().getTime(),
                                text: item.note
                            }];
                            delete item.note;
                        }
                        if (item.notes && typeof item.notes === 'string') {
                            item.notes = JSON.parse(item.notes);
                        }
                        const normalizedData = item.notes ? item.notes.map(note => ({
                            ...note,
                            creationDate: note.date || note.creationDate,
                        })) : [];
                        setNotes({...item, notes: normalizedData});
                        setTags(item.tags || []);
                        setStatusId(item.statusId || "");
                        previousNotes.current = {...item, notes: normalizedData}
                    } else {
                        setNotes({});
                        setTags([]);
                        setStatusId("");
                        previousNotes.current = {}
                    }
                })
                .catch(error => {
                    setLoading(false);
                    setRegistrationError(true);
                    setNotes(null);
                    console.error("Error loading data", error);
                })
            );
        }
    }, [username]);

    const saveDataToBackend = useCallback(async (notesToSave) => {
        try {
            await saveData("", notesToSave);
        } catch (error) {
            window.alert("Cannot save data. Please check your login.");
            console.error("Error saving data", error);
        }
    }, []);

    useEffect(() => {
        getKey().then(key => {
            const notesToBeSaved = {...notes, tags, statusId}
            if (!notesToBeSaved.linkedinUser || notesToBeSaved.linkedinUser === "") {
                notesToBeSaved.linkedinUser = username
            }
            if ((!notesToBeSaved.linkedinKey || notesToBeSaved.linkedinKey === "") && (key !== "" || previousNotes.current.linkedinKey !== "")) {
                notesToBeSaved.linkedinKey = key !== "" ? key : previousNotes.current.linkedinKey;
            }
            if (notesToBeSaved && noteHasToBeSaved(previousNotes.current, notesToBeSaved)) {
                notesToBeSaved.timestamp = new Date().getTime()
                saveDataToBackend(notesToBeSaved);
            }
            previousNotes.current = notesToBeSaved;
        })
    }, [notes, saveDataToBackend, username, tags, statusId]);

    const handleChange = (e) => {
        setNotes(prevNotes => ({...prevNotes, note: e.target.value}));
    };

    chrome.runtime.onMessage.addListener(
        function (request) {
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
        setNotes(prevNotes => {
            const updatedNotes = {...prevNotes, notes: [...(prevNotes.notes || []), newNote]};
            setNewNoteIndex(updatedNotes.notes.length - 1);
            return updatedNotes;
        });
    };

    const editNote = useCallback((index, text, flagColor) => {
        setNotes(prevNotes => {
            const updatedData = prevNotes.notes.map((note, i) => {
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
                    return {...note};
                }
            });
            return {...prevNotes, notes: updatedData};
        });
        setNewNoteIndex(null);
    }, []);

    const deleteNote = useCallback((index) => {
        setNotes(prevNotes => {
            const updatedData = prevNotes.notes.filter((_, i) => i !== index);
            return {...prevNotes, notes: updatedData};
        });
        setNewNoteIndex(null);
    }, []);

    const cancelNewNote = useCallback((index) => {
        setNotes(prevNotes => {
            const updatedData = prevNotes.notes.filter((_, i) => i !== index);
            return {...prevNotes, notes: updatedData};
        });
        setNewNoteIndex(null);
    }, []);

    const handleAddTag = (tag) => {
        setTags(prevTags => [...prevTags, tag]);
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
    };

    const handleStatusChange = (e) => {
        setStatusId(e.target.value);
    };

    const handleAddTagClick = () => {
        setAddingTag(true);
        setNewTag('');
        setTimeout(() => {
            newTagInputRef.current && newTagInputRef.current.focus();
        }, 0);
    };

    const handleNewTagChange = (e) => {
        setNewTag(e.target.value);
    };

    const handleSaveNewTag = () => {
        if (newTag.trim() !== '') {
            handleAddTag(newTag);
            setNewTag('');
            setAddingTag(false);
        }
    };

    const handleCancelNewTag = () => {
        setNewTag('');
        setAddingTag(false);
    };

    const handleManageStatusesClick = () => {
        setIsModalOpen(true);
    };

    return (
        <div className="artdeco-card ember-view relative break-words pb3 mt2">
            <div className="pvs-header__container" style={{display: "flex", flexDirection: "column"}}>
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
            {registrationError ? (
                <div className="ph5 pv3">
                    Please <button style={{
                    background: 'none',
                    color: 'blue',
                    marginLeft: '3px',
                    marginRight: '3px',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                }} onClick={openRegistrationPopup}>register</button> to use InNotes.
                </div>
            ) : (
                <>
                    <StatusManagement
                      statuses={statuses}
                      statusId={statusId}
                      handleStatusChange={handleStatusChange}
                      handleManageStatusesClick={handleManageStatusesClick}
                    />

                    <TagManagement
                        tags={tags}
                        handleAddTag={handleAddTag}
                        handleRemoveTag={handleRemoveTag}
                        addingTag={addingTag}
                        newTag={newTag}
                        handleAddTagClick={handleAddTagClick}
                        handleNewTagChange={handleNewTagChange}
                        handleSaveNewTag={handleSaveNewTag}
                        handleCancelNewTag={handleCancelNewTag}
                    />

                    <NoteList
                        notes={notes}
                        editNote={editNote}
                        deleteNote={deleteNote}
                        newNoteIndex={newNoteIndex}
                        cancelNewNote={cancelNewNote}
                        loading={loading}
                        addNote={addNote}
                    />
                    <StatusModal
                        isModalOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                        statuses={statuses}
                        setStatuses={setStatuses}
                        fetchStatuses={fetchStatuses}
                    />
                </>
            )}
        </div>
    );
};

export default InNotes;
