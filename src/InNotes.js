/* global chrome */
import React, {useEffect, useState, useCallback, useRef} from "react";
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

const NoteItem = ({note, index, editNote, deleteNote, autoFocus, isNew, cancelNewNote}) => {
  const [isEditing, setIsEditing] = useState(isNew || false);
  const [text, setText] = useState(decodeURIComponent(note.text));
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
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
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
      <div style={{
        width: '0.5rem',
        backgroundColor: flagColor && flagColor !== 'none' ? flagColor : 'transparent',
        marginRight: '0.5rem'
      }}/>
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
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div style={{flex: 1}}>
              <div className="display-linebreak" style={{
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
              }}>{decodeURIComponent(note.text)}</div>
              <div title={fullDateString} style={{fontSize: '0.8em', color: '#888'}}>
                Last modified: {timeAgoString}
              </div>
            </div>
            <div>
              <button onClick={() => setIsEditing(true)} className={editButtonStyle}>Edit</button>
              <button onClick={() => deleteNote(index)} className={deleteButtonStyle}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InNotes = () => {
  const [notes, setNotes] = useState(null);
  const [username, setUsername] = useState(window.location.href.split("/in/")[1].split("/")[0]);
  const [newNoteIndex, setNewNoteIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrationError, setRegistrationError] = useState(false);

  const openRegistrationPopup = () => {
    chrome.runtime.sendMessage({message: "openRegistrationPopup"});
  };

  const previousNotes = useRef(notes);

  useEffect(() => {
    if (username) {
      setLoading(true);
      setRegistrationError(false);
      getKey().then(key => loadData(key, username)
        .then(item => {
          setLoading(false);
          if (item) {
            if (!item.data && item.note) {
              item.data = [{
                creationDate: new Date().getTime(),
                lastUpdate: new Date().getTime(),
                text: item.note
              }];
              delete item.note;
            }
            if (item.data && typeof item.data === 'string') {
              item.data = JSON.parse(item.data);
            }
            const normalizedData = item.data ? item.data.map(note => ({
              ...note,
              creationDate: note.date || note.creationDate,
            })) : [];
            setNotes({ ...item, data: normalizedData });
          } else {
            setNotes({});
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
      await saveData(username, notesToSave);
    } catch (error) {
      window.alert("Cannot save data. Please check your login.");
      console.error("Error saving data", error);
    }
  }, [username]);

  useEffect(() => {
    getKey().then(key => {
      const notesToBeSaved = {...notes}
      if (!notesToBeSaved.linkedinUser) {
        notesToBeSaved.linkedinUser = username
      }
      if (!notesToBeSaved.linkedinKey && key !== "") {
        notesToBeSaved.linkedinKey = key
      }
      if (!notesToBeSaved.key && key !== "") {
        notesToBeSaved.key = key
      }
      if (notesToBeSaved && noteHasToBeSaved(previousNotes.current,notesToBeSaved)) {
        notesToBeSaved.timestamp = new Date().getTime()
        saveDataToBackend(notesToBeSaved);
      }
      previousNotes.current = notesToBeSaved;
    })
  }, [notes, saveDataToBackend, username]);

  const noteHasToBeSaved = (previous, current) => {
    console.log("Checking for changes")
    if (JSON.stringify(previous) === JSON.stringify(current)){
      return false;
    }
    if(!previous.id && !previous.username){
      return false;
    }
    if(!current.note && (!current.data || current.data.length === 0)){
      if(previous.note || (previous.data && previous.data.length > 0)){
        return true;
      }
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

    console.log("JSON has changed", findDifferences(previous, current));

    if (Object.keys(previous).length === 0) {
      if ( current.id > 0){
        // If there is an ID, it means the data has just loaded from the backend.
        return false;
      }
    }
    return true;
  }
  const handleChange = (e) => {
    setNotes(prevNotes => ({...prevNotes, note: e.target.value}));
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
    setNotes(prevNotes => {
      const updatedNotes = {...prevNotes, data: [...(prevNotes.data || []), newNote]};
      setNewNoteIndex(updatedNotes.data.length - 1);
      return updatedNotes;
    });
  };

  const editNote = useCallback((index, text, flagColor) => {
    setNotes(prevNotes => {
      const updatedData = prevNotes.data.map((note, i) => {
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
      return {...prevNotes, data: updatedData};
    });
    setNewNoteIndex(null);
  }, []);

  const deleteNote = useCallback((index) => {
    setNotes(prevNotes => {
      const updatedData = prevNotes.data.filter((_, i) => i !== index);
      return {...prevNotes, data: updatedData};
    });
    setNewNoteIndex(null);
  }, []);

  const cancelNewNote = useCallback((index) => {
    setNotes(prevNotes => {
      const updatedData = prevNotes.data.filter((_, i) => i !== index);
      return {...prevNotes, data: updatedData};
    });
    setNewNoteIndex(null);
  }, []);


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
          Please <a href="#" onClick={openRegistrationPopup}>register</a> to use InNotes.
        </div>
      );
    }

    if (notes && (!notes.data || notes.data.length === 0)) {
      return (
        <div>
          Click on "Add Note" to create your first note.
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
              autoFocus={index === newNoteIndex}
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
          {!registrationError && (
            <div style={{float: 'right', marginTop: '10px'}}>
              <button onClick={addNote} className={editButtonStyle}>Add Note</button>
            </div>
          )}
        </div>
      </div>
      <div className="display-flex ph5 pv3 notes-container" style={{flexDirection: "column"}}>
        {renderNotes()}
      </div>
    </div>
  );
};

export default InNotes;
