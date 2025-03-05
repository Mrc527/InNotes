import React, {useRef, useEffect, useState} from 'react';

const TagManagement = ({tags, handleAddTag, handleRemoveTag}) => {
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const newTagInputRef = useRef(null);

  useEffect(() => {
    if (addingTag && newTagInputRef.current) {
      newTagInputRef.current.focus();
    }
  }, [addingTag]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      handleSaveNewTag();
    }
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

  return (
    <div className="ph5">
      <div className="mb1" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <label htmlFor="tags" className="t-16 t-black--light mb1"
               style={{marginRight: '0.5rem', fontWeight: '600'}}>Tags:</label>
        <button onClick={handleAddTagClick}
                className="notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--primary">Add Tag
        </button>
      </div>
      {addingTag && (
        <div className="mt2" style={{display: 'flex', alignItems: 'center'}}>
          <label htmlFor="newTagInput" className="text-body-small mb1" style={{marginRight: '0.5rem', flexShrink: 0}}>New
            Tag:</label>
          <input
            type="text"
            id="newTagInput"
            className="artdeco-text-input"
            value={newTag}
            onChange={handleNewTagChange}
            ref={newTagInputRef}
            style={{marginRight: '0.5rem'}}
            onKeyDown={handleKeyDown}
          />
          <button className="notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--primary"
                  style={{marginRight: '0.5rem', flexShrink: 0}} onClick={handleSaveNewTag}>Add
          </button>
          <button
            className="notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--secondary artdeco-button--muted"
            style={{flexShrink: 0}} onClick={handleCancelNewTag}>Cancel
          </button>
        </div>
      )}
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
              <span className="t-14 t-black t-bold ph3" style={{padding: '0px'}}>{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="artdeco-button artdeco-button--circle artdeco-button--tertiary artdeco-button--3 artdeco-button--muted"
                aria-label={`Remove tag ${tag}`}
                style={{width: '16px', height: '16px', minWidth: '16px'}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" data-supported-dps="16x16"
                     fill="currentColor" width="16" height="16" focusable="false">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TagManagement;
