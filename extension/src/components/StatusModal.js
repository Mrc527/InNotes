import React, { useState, useEffect } from 'react';
import { postData, deleteData } from '../utils';

const StatusModal = ({ isModalOpen, setIsModalOpen, statuses, setStatuses, fetchStatuses }) => {
    const [newStatus, setNewStatus] = useState('');
    const [editingStatusId, setEditingStatusId] = useState(null);
    const [editedStatusName, setEditedStatusName] = useState('');

    useEffect(() => {
        if (editingStatusId) {
            const statusToEdit = statuses.find(status => status.id === editingStatusId);
            if (statusToEdit) {
                setEditedStatusName(statusToEdit.name);
            }
        } else {
            setEditedStatusName('');
        }
    }, [editingStatusId, statuses]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStatusId(null);
        setEditedStatusName('');
    };

    const handleAddStatus = async () => {
        if (newStatus.trim() !== '') {
            try {
                await postData('/statuses', { name: newStatus });
                setNewStatus('');
                await fetchStatuses();
            } catch (error) {
                console.error("Error adding status:", error);
            }
        }
    };

    const handleDeleteStatus = async (id) => {
        try {
            await deleteData(`/statuses/${id}`);
            await fetchStatuses();
        } catch (error) {
            console.error("Error deleting status:", error);
        }
    };

    const handleEditStatus = (id) => {
        setEditingStatusId(id);
    };

    const handleCancelEdit = () => {
        setEditingStatusId(null);
        setEditedStatusName('');
    };

    const handleSaveEdit = async (id) => {
        if (editedStatusName.trim() !== '') {
            try {
                await postData(`/statuses/${id}`, { name: editedStatusName });
                setEditingStatusId(null);
                setEditedStatusName('');
                await fetchStatuses();
            } catch (error) {
                console.error("Error updating status:", error);
            }
        }
    };

    return (
        <>
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Manage Statuses</h2>
                            <button className="close-button" onClick={handleCloseModal}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <ul>
                                {statuses.map(status => (
                                    <li key={status.id}>
                                        {editingStatusId === status.id ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={editedStatusName}
                                                    onChange={(e) => setEditedStatusName(e.target.value)}
                                                />
                                                <button onClick={() => handleSaveEdit(status.id)}>Save</button>
                                                <button onClick={handleCancelEdit}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                {status.name}
                                                <button onClick={() => handleEditStatus(status.id)}>Edit</button>
                                                <button onClick={() => handleDeleteStatus(status.id)}>Delete</button>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <div>
                                <input
                                    type="text"
                                    placeholder="New Status Name"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                />
                                <button onClick={handleAddStatus}>Add Status</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StatusModal;
