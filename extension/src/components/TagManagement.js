import React, {useRef, useEffect, useState, useCallback} from 'react';
import {getRequest} from "../utils";

const TagManagement = ({tags, handleAddTag, handleRemoveTag}) => {
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const newTagInputRef = useRef(null);
  const [allTags, setAllTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);

  useEffect(() => {
    if (addingTag && newTagInputRef.current) {
      newTagInputRef.current.focus();
    }
  }, [addingTag]);

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const tags = await getRequest(`/tags`);
        setAllTags(tags);
      } catch (error) {
        console.error("Error fetching all tags:", error);
        setAllTags([]);
      }
    };

    fetchAllTags();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      handleSaveNewTag();
    }
  };

  const handleAddTagClick = () => {
    setAddingTag(true);
    setNewTag('');
    setSuggestedTags([]);
    setTimeout(() => {
      newTagInputRef.current && newTagInputRef.current.focus();
    }, 0);
  };

  const handleNewTagChange = (e) => {
    const term = e.target.value;
    setNewTag(term);

    if (term.length > 0) {
      const filteredTags = allTags.filter(tag =>
        tag.toLowerCase().includes(term.toLowerCase())
      );
      setSuggestedTags(filteredTags);
    } else {
      setSuggestedTags([]);
    }
  };

  const handleSaveNewTag = () => {
    if (newTag.trim() !== '') {
      handleAddTag(newTag);
      setNewTag('');
      setAddingTag(false);
      setSuggestedTags([]);
    }
  };

  const handleCancelNewTag = () => {
    setNewTag('');
    setAddingTag(false);
    setSuggestedTags([]);
  };

  const handleSelectSuggestedTag = (tag) => {
    setNewTag(tag);
    setSuggestedTags([]);
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
        <div className="mt2" style={{position: 'relative'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <label htmlFor="newTagInput" className="text-body-small mb1"
                   style={{marginRight: '0.5rem', flexShrink: 0}}>New Tag:</label>
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
          {suggestedTags.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '0',
              margin: '0',
              zIndex: '10',
              listStyleType: 'none'
            }}>
              {suggestedTags.map(tag => (
                <li key={tag} style={{padding: '8px', cursor: 'pointer'}}
                    onClick={() => handleSelectSuggestedTag(tag)}>
                  {tag}
                </li>
              ))}
            </ul>
          )}
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
