import React, {useRef, useEffect, useState} from 'react';
import {getRequest} from "../utils";
import './TagManagement.css';

const TagManagement = ({tags, handleAddTag, handleRemoveTag}) => {
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const newTagInputRef = useRef(null);
  const [allTags, setAllTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [selectedTagIndex, setSelectedTagIndex] = useState(-1);
  const [isMouseOver, setIsMouseOver] = useState(false);

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
      if (selectedTagIndex !== -1) {
        handleSelectSuggestedTag(suggestedTags[selectedTagIndex]);
      } else {
        handleSaveNewTag();
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault(); // Prevent scrolling
      if (suggestedTags.length > 0) {
        setSelectedTagIndex((prevIndex) => (prevIndex + 1) % suggestedTags.length);
        setIsMouseOver(false); // Arrow key navigation takes precedence
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault(); // Prevent scrolling
      if (suggestedTags.length > 0) {
        setSelectedTagIndex((prevIndex) =>
          prevIndex === 0 ? suggestedTags.length - 1 : prevIndex - 1
        );
        setIsMouseOver(false); // Arrow key navigation takes precedence
      }
    }
  };

  const handleAddTagClick = () => {
    setAddingTag(true);
    setNewTag('');
    setSuggestedTags([]);
    setSelectedTagIndex(-1);
    setIsMouseOver(false);
    setTimeout(() => {
      newTagInputRef.current && newTagInputRef.current.focus();
    }, 0);
  };

  const handleNewTagChange = (e) => {
    const term = e.target.value;
    setNewTag(term);
    setSelectedTagIndex(-1);
    setIsMouseOver(false);

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
    if (newTag.trim() !== '' && suggestedTags.length === 0) {
      handleAddTag(newTag);
      setNewTag('');
      setAddingTag(false);
      setSuggestedTags([]);
      setSelectedTagIndex(-1);
      setIsMouseOver(false);
    }
  };

  const handleCancelNewTag = () => {
    setNewTag('');
    setAddingTag(false);
    setSuggestedTags([]);
    setSelectedTagIndex(-1);
    setIsMouseOver(false);
  };

  const handleSelectSuggestedTag = (tag) => {
    handleAddTag(tag);
    setNewTag('');
    setAddingTag(false);
    setSuggestedTags([]);
    setSelectedTagIndex(-1);
    setIsMouseOver(false);
  };

  const handleMouseEnter = (index) => {
    setSelectedTagIndex(index);
    setIsMouseOver(true); // Mouse hover takes precedence
  };

  const handleMouseLeave = () => {
    setIsMouseOver(false);
  };

  return (
    <div className="ph5">
      <div className="mb1 tag-management-header">
        <label htmlFor="tags" className="t-16 t-black--light mb1 tag-label">Tags:</label>
        <button onClick={handleAddTagClick}
                className="notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--primary">Add Tag
        </button>
      </div>
      {addingTag && (
        <div className="mt2 tag-input-container">
          <div className="tag-input-wrapper">
            <label htmlFor="newTagInput" className="text-body-small mb1 tag-input-label">New Tag:</label>
            <input
              type="text"
              id="newTagInput"
              className="artdeco-text-input tag-input"
              value={newTag}
              onChange={handleNewTagChange}
              ref={newTagInputRef}
              onKeyDown={handleKeyDown}
            />
            <button className="notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--primary tag-add-button"
                    onClick={handleSaveNewTag}>Add
            </button>
            <button
              className="notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--secondary artdeco-button--muted tag-cancel-button"
              onClick={handleCancelNewTag}>Cancel
            </button>
          </div>
          {suggestedTags.length > 0 && (
            <ul className="suggested-tags-list">
              {suggestedTags.map((tag, index) => (
                <li
                  key={tag}
                  className={`suggested-tag-item ${
                    (isMouseOver && index === selectedTagIndex) ? 'selected-tag' : (!isMouseOver && index === selectedTagIndex) ? 'selected-tag' : ''
                  }`}
                  onClick={() => handleSelectSuggestedTag(tag)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
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
            <div className="tag-item">
              <span className="t-14 t-black t-bold ph3 tag-text">{tag}</span>
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
