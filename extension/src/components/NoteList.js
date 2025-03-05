import React from 'react';
import {NoteItem} from "./NoteItem";

const NoteList = ({ notes, editNote, deleteNote, newNoteIndex, cancelNewNote, loading, addNote }) => {

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
        <div className="ph5">
            <div className="mb3" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <label htmlFor="status" className="t-16 t-black--light mb1" style={{fontWeight: '600', marginRight: '0.5rem'}}>Notes:</label>
                <button onClick={addNote} className="notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--primary">Add Note</button>
            </div>
            {renderNotes()}
        </div>
    );
};

export default NoteList;
