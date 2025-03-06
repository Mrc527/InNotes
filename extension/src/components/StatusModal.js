import React, { useState } from 'react';
import { postData, deleteData } from '../utils';
import {cancelButtonStyle, deleteButtonStyle, editButtonStyle, saveButtonStyle} from "./style";

const StatusModal = ({ isModalOpen, setIsModalOpen, statuses, fetchStatuses }) => {
    const [newStatusName, setNewStatusName] = useState('');
    const [editingStatusId, setEditingStatusId] = useState(null);
    const [editedStatusName, setEditedStatusName] = useState('');

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStatusId(null);
    };

    const handleAddStatus = async () => {
        if (newStatusName.trim() !== '') {
            try {
                await postData('/statuses', { name: newStatusName });
                setNewStatusName('');
                await fetchStatuses();
            } catch (error) {
                console.error("Error creating status:", error);
                window.alert("Failed to create status");
            }
        }
    };

    const handleEditStatus = (status) => {
        setEditingStatusId(status.id);
        setEditedStatusName(status.name);
    };

    const handleUpdateStatus = async () => {
        if (editedStatusName.trim() !== '') {
            try {
                await postData(`/statuses/${editingStatusId}`, { name: editedStatusName }, {
                    method: 'PUT',
                });
                setEditingStatusId(null);
                setEditedStatusName('');
                await fetchStatuses();
            } catch (error) {
                console.error("Error updating status:", error);
                window.alert("Failed to update status");
            }
        }
    };

    const handleDeleteStatus = async (id) => {
        try {
            const result = await deleteData(`/statuses/${id}`);
            await fetchStatuses();
            const resultData = await result.json();
            if (resultData.error) {
                window.alert(resultData.error);
            }
        } catch (error) {
            console.error("Error deleting status:", error);
            window.alert("Failed to delete status");
        }
    };

    if (!isModalOpen) return null;

    return (
      <div className="artdeco-card" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          zIndex: 1000,
          width: '50%',
          maxWidth: '600px',
      }}>
          <h2>Manage Statuses</h2>
          <ul>
              {statuses.map(status => (
                <li key={status.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '5px 0',
                    borderBottom: '1px solid #eee'
                }}>
                    {editingStatusId === status.id ? (
                      <>
                          <input
                            type="text"
                            value={editedStatusName}
                            onChange={(e) => setEditedStatusName(e.target.value)}
                            style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '10px'}}
                          />
                          <button onClick={handleUpdateStatus} className={saveButtonStyle}>Update</button>
                      </>
                    ) : (
                      <>
                          <span>{status.name}</span>
                          <div>
                              <button onClick={() => handleEditStatus(status)} className={editButtonStyle}
                                      style={{marginRight: '5px'}}>Edit</button>
                              <button onClick={() => handleDeleteStatus(status.id)} className={deleteButtonStyle}>Delete</button>
                          </div>
                      </>
                    )}
                </li>
              ))}
          </ul>
          <div>
              <input
                type="text"
                placeholder="New Status Name"
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
                style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '10px'}}
              />
              <button onClick={handleAddStatus} className={saveButtonStyle}>Add Status</button>
          </div>
          <button onClick={handleCloseModal} className={cancelButtonStyle} style={{marginTop: '20px'}}>Close</button>
      </div>
    );
};

export default StatusModal;
