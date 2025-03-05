import React, {useRef} from 'react';

const TagManagement = ({ tags, handleAddTag, handleRemoveTag, addingTag, newTag, handleAddTagClick, handleNewTagChange, handleSaveNewTag, handleCancelNewTag }) => {
    const newTagInputRef = useRef(null);

    return (
        <div className="ph5 pv3">
            <div className="display-flex align-items-center">
                <label htmlFor="tags" className="text-body-small mb1" style={{ marginRight: '0.5rem' }}>Tags:</label>
            </div>
            <ul className="list-style-none display-flex flex-wrap mt2">
                {tags.map(tag => (
                    <li key={tag} className="mr1 mb1">
                        <div className="align-items-center display-flex border rounded-pill overflow-hidden" style={{
                            border: '1px solid #d0d0d0',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '9999px',
                            backgroundColor: '#e9e5df',
                            color: '#000000',
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            lineHeight: '1.3',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxHeight: '20px',
                        }}>
                            <span className="t-14 t-black t-bold ph3" style={{ padding: '0px' }}>{tag}</span>
                            <button
                                onClick={() => handleRemoveTag(tag)}
                                className="artdeco-button artdeco-button--circle artdeco-button--tertiary artdeco-button--3 artdeco-button--muted"
                                aria-label={`Remove tag ${tag}`}
                                style={{ width: '16px', height: '16px', minWidth: '16px' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" data-supported-dps="16x16" fill="currentColor" width="16" height="16" focusable="false">
                                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </li>
                ))}
                {!addingTag ? (
                    <li className="mr1 mb1">
                        <div
                            onClick={handleAddTagClick}
                            style={{
                                border: '1px dashed #d0d0d0',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '9999px',
                                backgroundColor: '#ffffff',
                                color: '#000000',
                                fontSize: '0.7rem',
                                fontWeight: '500',
                                lineHeight: '1.3',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxHeight: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" data-supported-dps="16x16" fill="currentColor" width="12" height="12" focusable="false" style={{ marginRight: '0.2rem' }}>
                                <path d="M8 3a1 1 0 00-1 1v3H4a1 1 0 000 2h3v3a1 1 0 002 0V9h3a1 1 0 000-2H9V4a1 1 0 00-1-1z"></path>
                            </svg>
                            Add Tag
                        </div>
                    </li>
                ) : null}
            </ul>
            {addingTag && (
                <div className="mt2" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="newTagInput" className="text-body-small mb1" style={{ marginRight: '0.5rem', flexShrink: 0 }}>New Tag:</label>
                    <input
                        type="text"
                        id="newTagInput"
                        className="artdeco-text-input"
                        value={newTag}
                        onChange={handleNewTagChange}
                        ref={newTagInputRef}
                        style={{ marginRight: '0.5rem' }}
                    />
                    <button className="notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--primary" style={{ marginRight: '0.5rem', flexShrink: 0 }} onClick={handleSaveNewTag}>Add</button>
                    <button className="notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--secondary artdeco-button--muted" style={{ flexShrink: 0 }} onClick={handleCancelNewTag}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default TagManagement;
