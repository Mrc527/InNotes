/* global chrome */
import React, {useCallback, useEffect, useRef, useState} from "react";
import "./App.css";
import {deleteData, getRequest, loadData, loadNotes, postData, saveData, updateNote} from "./utils";
import NoteList from "./components/NoteList";
import TagManagement from "./components/TagManagement";
import StatusManagement from "./components/StatusManagement";
import StatusModal from "./components/StatusModal";

const getLinkedInProfileImage = (user) => {
  const img = document.querySelector('img[src^="https://media.licdn.com/dms/image/"][title^="'+user+'"]');
  return img ? img.src : null;
};
const getLinkedInProfileNameFromHTML = () => {
  const title = document.title;
  const parts = title.split("|");
  if (parts.length > 1) {
    return parts[0].replace(/\(\d+\)\s*/, "").trim();
  }
  return null;
};

async function findLinkedInProfileLink(username, attempt = 1) {
  const maxAttempts = 5;
  const delay = 2000;

  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      const links = document.querySelectorAll('a[href^="https://www.linkedin.com/in/' + username + '"]');
      for (let i = 0; i < links.length; i++) {
        const href = links[i].href;
        if (href.includes('profileId=')) {
          let result = href.match(/profileId=(.*)/)?.[1]
          if(result.indexOf('&')>0)
          {
            result=result.split('&')[0]
          }
          resolve(result);
          return;
        }
        if (href.includes('fsd_profile%3A')) {
          let result = href.match(/fsd_profile%3A(.*)/)?.[1];
          if(result.indexOf('&')>0)
          {
            result=result.split('&')[0]
          }
          resolve(result);
          return;
        }
      }

      if (attempt > maxAttempts) {
        console.warn(`Could not find LinkedIn profile link (${username}) after ${maxAttempts} attempts.`);
        resolve(null);
      } else {
        console.log(`Attempt ${attempt} failed (${username}), retrying in ${delay}ms...`);
        setTimeout(() => {
          findLinkedInProfileLink(username, attempt + 1).then(resolve);
        }, delay);
      }

    } else {
      window.addEventListener('load', () => {
        const links = document.querySelectorAll('a[href^="https://www.linkedin.com/in/' + username + '"]');
        for (let i = 0; i < links.length; i++) {
          const href = links[i].href;
          if (href.includes('profileId=')) {
            resolve(href.match(/profileId=(.*)/)?.[1]);
            return;
          }
        }
        if (attempt > maxAttempts) {
          console.warn(`Could not find LinkedIn profile link after ${maxAttempts} attempts.`);
          resolve(null);
        } else {
          console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
          setTimeout(() => {
            findLinkedInProfileLink(username, attempt + 1).then(resolve);
          }, delay);
        }
      });
    }
  });
}

const noteHasToBeSaved = (previous, current) => {
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
  console.log("Has to be saved", differences)
  if (Object.keys(differences).length <1){
    return false
  }
  if (Object.keys(differences).length === 1 && differences.linkedinUser) {
    return false;
  }


  if (Object.keys(previous).length === 0) {
    if (current?.id > 0) {
      // If there is an ID, it means the data has just loaded from the backend.
      return false;
    }
  }
  return true;
}

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
  const [showStatusManagement, setShowStatusManagement] = useState(false);
  const [showTagManagement, setShowTagManagement] = useState(false);
  const [linkedinData, setLinkedinData] = useState(null);
  const [saveLinkedInData, setSaveLinkedInData] = useState(false);

  useEffect(() => {
    if (statusId) {
      setShowStatusManagement(true);
    }
  }, [statusId]);

  useEffect(() => {
    if (tags && tags.length > 0) {
      setShowTagManagement(true);
    }
  }, [tags]);

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

// InNotes.js

  useEffect(() => {
    if (username) {
      setLoading(true);
      setRegistrationError(false);
      findLinkedInProfileLink(username).then(key =>
        loadData(key, username)
          .then(linkedinData => {
            setLinkedinData(linkedinData);
            loadNotes(linkedinData.id)
              .then((notesData) => {
                setLoading(false);
                if (linkedinData) {
                  setTags(linkedinData.tags || []);
                  setStatusId(linkedinData.statusId || "");
                } else {
                  setTags([]);
                  setStatusId("");
                }
                if (notesData) {
                  setNotes({notes: notesData});
                  previousNotes.current = {notes: notesData};
                } else {
                  setNotes({});
                  previousNotes.current = {};
                }
              })
              .catch(error => {
                setLoading(false);
                setRegistrationError(true);
                setNotes(null);
                console.error("Error loading notes", error);
              })
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

  const saveDataToBackend = useCallback(async () => {
    try {
      if (saveLinkedInData) {
        const key = await findLinkedInProfileLink(linkedinData.linkedinUser);
        const name = getLinkedInProfileNameFromHTML()
        const linkedinDataToSave = {
          linkedinKey: linkedinData.linkedinKey && linkedinData.linkedinKey !== "" ? linkedinData.linkedinKey : key,
          linkedinUser: linkedinData.linkedinUser,
          pictureUrl: getLinkedInProfileImage(name),
          name,
          tags,
          statusId
        };
        await saveData("", linkedinDataToSave);
        setSaveLinkedInData(false);
      }
    } catch (error) {
      window.alert("Cannot save data. Please check your login.");
      console.error("Error saving data", error);
    }
  }, [linkedinData, tags, statusId, saveLinkedInData]);

  useEffect(() => {
    saveDataToBackend();
  }, [saveDataToBackend]);

  useEffect(() => {
    const name = getLinkedInProfileNameFromHTML();
    const imageUrl = getLinkedInProfileImage(name);
    findLinkedInProfileLink(username).then(key => {
      console.log("Loading data for key", key)
      if (linkedinData) {
        linkedinData.linkedinKey = key;
      }
      const notesToBeSaved = {linkedinKey: key, linkedinUser: username, tags, statusId, imageUrl, name};
      if (!notesToBeSaved.linkedinUser || notesToBeSaved.linkedinUser === "") {
        notesToBeSaved.linkedinUser = username
      }
      if ((!notesToBeSaved.linkedinKey || notesToBeSaved.linkedinKey === "") && (key !== "" || previousNotes.current?.linkedinKey !== "")) {
        notesToBeSaved.linkedinKey = key !== "" ? key : previousNotes.current?.linkedinKey;
      }
      if (notesToBeSaved && noteHasToBeSaved(previousNotes.current, notesToBeSaved)) {
        notesToBeSaved.timestamp = new Date().toISOString()
        setLinkedinData(notesToBeSaved);
      }
      previousNotes.current = notesToBeSaved;
    });
  }, [linkedinData, statusId, tags, username]);


  chrome.runtime.onMessage.addListener(
    function (request) {
      if (request.message === 'url_update') {
        setUsername(request.url.split("/in/")[1].split("/")[0]);
      }
    });


  const addNote = () => {
    const newNote = {
      linkedinDataId: linkedinData?.id,
      creationDate: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      text: "",
    };
    setNotes(prevNotes => {
      const updatedNotes = {...prevNotes, notes: [...(prevNotes.notes || []), newNote]};
      setNewNoteIndex(updatedNotes.notes.length - 1);
      return updatedNotes;
    });
  };

  const editNote = useCallback(async (index, text, flagColor, visibility) => {
    try {
      const updatedData = notes.notes.map((note, i) => {
        if (i === index) {
          const updatedNote = {
            ...note,
            text: encodeURIComponent(text),
            lastUpdate: new Date().toISOString(),
            visibility: visibility
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
      setNotes(prevNotes => ({...prevNotes, notes: updatedData}));
      setNewNoteIndex(null);

      // Update the note on the backend immediately after editing
      const noteToUpdate = updatedData[index];
      if (noteToUpdate.id) {
        await updateNote(noteToUpdate.id, noteToUpdate);
      } else {
        if (noteToUpdate.text !== "") {
          await postData("/note", noteToUpdate);
          loadNotes(linkedinData.id)
            .then((notesData) => {
              if (notesData) {
                setNotes({notes: notesData});
                previousNotes.current = {notes: notesData};
              }
            })
        }
      }
    } catch (error) {
      console.error("Error updating note:", error);
      window.alert("Failed to update note. Please try again.");
    }
  }, [linkedinData?.id, notes?.notes]);

  const deleteNote = useCallback(async (index) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        const noteToDelete = notes.notes[index];
        if (noteToDelete.id) {
          await deleteData(`/note/${noteToDelete.id}`);
        }
        setNotes(prevNotes => {
          const updatedData = prevNotes.notes.filter((_, i) => i !== index);
          return {...prevNotes, notes: updatedData};
        });
        setNewNoteIndex(null);
      } catch (error) {
        console.error("Error deleting note:", error);
        window.alert("Failed to delete note. Please try again.");
      }
    }
  }, [notes]);

  const cancelNewNote = useCallback((index) => {
    setNotes(prevNotes => {
      const updatedData = prevNotes.notes.filter((_, i) => i !== index);
      return {...prevNotes, notes: updatedData};
    });
    setNewNoteIndex(null);
  }, []);

  const handleAddTag = (tag) => {
    setTags(prevTags => [...prevTags, tag]);
    setSaveLinkedInData(true);
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
    setSaveLinkedInData(true);
  };

  const handleStatusChange = (e) => {
    setStatusId(e.target.value);
    setSaveLinkedInData(true);
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

  const showStatusManagementHandler = () => {
    setShowStatusManagement(true);
  };
  const showTagManagementHandler = () => {
    setShowTagManagement(true);
  };

  return (
    <div className="artdeco-card ember-view relative break-words pb3 mt2">
      <div className="pvs-header__container" style={{display: "flex", flexDirection: "column"}}>
        <div className="pvs-header__top-container--no-stack">
          <div className="pvs-header__left-container--stack">
            <div className="title-container pvs-header__title-container">
              <h2 className="pvs-header__title text-heading-large"
                  style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <div>
                                    <span aria-hidden="true"
                                          style={{float: "left", display: "flex", alignItems: "center"}}>
                                        <img src="https://marco.visin.ch/img/projects/InNotes.png"
                                             style={{marginRight: "5px"}} width="60" alt={"logo"}/>
                                        InNotes
                                    </span>
                  <div id="innotes-username" style={{display: "none"}}>{username}</div>
                </div>
                <div>
                  {!showStatusManagement && !statusId && (
                    <button
                      onClick={showStatusManagementHandler}
                      className="artdeco-button artdeco-button--secondary artdeco-button--link"
                      style={{
                        padding: 0,
                        marginLeft: '0.5rem',
                        alignSelf: 'flex-end',
                      }}
                    >
                      Show Status
                    </button>
                  )}
                  {!showTagManagement && (!tags || tags.length === 0) && (
                    <button
                      onClick={showTagManagementHandler}
                      className="artdeco-button artdeco-button--secondary artdeco-button--link"
                      style={{
                        padding: 0,
                        marginLeft: '0.5rem',
                        alignSelf: 'flex-end',
                      }}
                    >
                      Show Tags
                    </button>
                  )}
                </div>
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
          {(showStatusManagement || statusId) && (
            <StatusManagement
              statuses={statuses}
              statusId={statusId}
              handleStatusChange={handleStatusChange}
              handleManageStatusesClick={handleManageStatusesClick}
            />
          )}

          {(showTagManagement || (tags && tags.length > 0)) && (
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
          )}

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
