import React from 'react';
import {NoteItem} from "./NoteItem";

const NoteList = ({ notes, editNote, deleteNote, newNoteIndex, cancelNewNote, loading, registrationError, openRegistrationPopup }) => {

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
                    Please <button style={{
                    background: 'none',
                    color: 'blue',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                }} onClick={openRegistrationPopup}>register</button> to use InNotes.
                </div>
            );
        }

        if (notes && (!notes.notes || notes.notes.length === 0)) {
            return (
                <div>
                    Click on "Add Note" to create your first note.
                </div>
            );
        }

        if (notes && notes.notes) {
            return (
                <>
                    {notes.notes.map((note, index) => (
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
                style={{width: "100%", height: "100%", minHeight: "100px", boxSizing: "border-box"}}
                value={decodeURIComponent(notes?.note || "")}
            />;
        }
    };

    return (
        <>
            {renderNotes()}
        </>
    );
};

export default NoteList;
