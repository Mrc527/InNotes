import React, {useEffect, useState} from 'react';
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import {cancelButtonStyle, deleteButtonStyle, editButtonStyle, saveButtonStyle} from "./style";
import SharingModal from "./SharingModal"; // Import the SharingModal component

TimeAgo.addDefaultLocale(en)
TimeAgo.addLocale(en)

const timeAgo = new TimeAgo('en-US')

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

const visibilityIcons = {
    'private': '🔒',    // Private (Lock)
    'shared_read_only': '👁️',  // Shared Read-Only (Eye)
    'shared_editable': '✍️', // Shared Editable (Writing Hand)
    'public': '🌐',     // Public (Globe)
};

export const NoteItem = ({note, index, editNote, deleteNote, autoFocus, isNew, cancelNewNote}) => {
    const [isEditing, setIsEditing] = useState(isNew || false);
    const [text, setText] = useState(decodeURIComponent(note.text));
    const [flagColor, setFlagColor] = useState(note.flagColor || '');
    const [visibility, setVisibility] = useState(note.visibility || 'private');
    const [isSharingModalOpen, setIsSharingModalOpen] = useState(false); // State for modal visibility
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
        editNote(index, text, flagColor === 'none' ? null : flagColor, visibility);
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

    const handleVisibilityChange = (e) => {
        setVisibility(e.target.value);
    };

    const handleOpenSharingModal = () => {
        setIsSharingModalOpen(true);
    };

    const handleCloseSharingModal = () => {
        setIsSharingModalOpen(false);
    };

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
                            className="artdeco-text-input"
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
                                        className="artdeco-dropdown__item"
                                        style={{
                                            maxWidth: '13rem',
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
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <label style={{marginRight: '0.5rem', flexShrink: 0}}>Visibility:</label>
                                    <select value={visibility} onChange={handleVisibilityChange}
                                            className="artdeco-dropdown__item"
                                            style={{
                                                maxWidth: '15rem',
                                                padding: '0.2rem',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc',
                                                marginRight: '0.5rem',
                                                flexShrink: 0
                                            }}>
                                        <option value="private">Private</option>
                                        <option value="shared_read_only">Shared Read-Only</option>
                                        <option value="shared_editable">Shared Editable</option>
                                        <option value="public">Public</option>
                                    </select>
                                    {visibility !== 'private' && (
                                        <button onClick={handleOpenSharingModal} style={{flexShrink: 0}} className={editButtonStyle}>Manage Sharing</button>
                                    )}
                                </div>
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
                            <div title={fullDateString} style={{fontSize: '0.8em', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center'}}>
                                <span
                                    style={{
                                        marginRight: '0.3rem',
                                        opacity: 0.7,
                                        fontSize: '1rem'
                                    }}
                                >
                                    {visibilityIcons[note.visibility] || visibilityIcons['private']}
                                </span>
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
            {/* Render the SharingModal */}
            {isSharingModalOpen && (
                <SharingModal
                    noteId={note.id}
                    onClose={handleCloseSharingModal}
                />
            )}
        </div>
    );
};
