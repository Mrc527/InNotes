import React, { useState, useEffect } from 'react';
import { getGroups, getGroupMembers, addGroupMember, deleteGroupMember,
         shareNoteRead, unshareNoteRead, shareNoteEdit, unshareNoteEdit } from '../utils';
import {cancelButtonStyle, deleteButtonStyle, editButtonStyle, saveButtonStyle} from "./style";

const SharingModal = ({ noteId, onClose }) => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [readOnlyUsers, setReadOnlyUsers] = useState([]);
    const [editableUsers, setEditableUsers] = useState([]);

    useEffect(() => {
        // Fetch groups and existing shared users when the component mounts
        fetchGroups();
        // fetchSharedUsers(); // Implement this function to fetch existing shared users
    }, []);

    const fetchGroups = async () => {
        try {
            const groupsData = await getGroups();
            setGroups(groupsData);
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    const handleGroupChange = async (e) => {
        const groupId = e.target.value;
        setSelectedGroup(groupId);
        if (groupId) {
            try {
                const members = await getGroupMembers(groupId);
                setGroupMembers(members);
            } catch (error) {
                console.error("Error fetching group members:", error);
                setGroupMembers([]);
            }
        } else {
            setGroupMembers([]);
        }
    };

    const handleAddGroupMember = async () => {
        if (selectedGroup && selectedUser) {
            try {
                await addGroupMember(selectedGroup, selectedUser);
                // Refresh group members
                const members = await getGroupMembers(selectedGroup);
                setGroupMembers(members);
            } catch (error) {
                console.error("Error adding group member:", error);
            }
        }
    };

    const handleRemoveGroupMember = async (userId) => {
        if (selectedGroup) {
            try {
                await deleteGroupMember(selectedGroup, userId);
                // Refresh group members
                const members = await getGroupMembers(selectedGroup);
                setGroupMembers(members);
            } catch (error) {
                console.error("Error removing group member:", error);
            }
        }
    };

    const handleShareReadOnly = async (userId) => {
        try {
            await shareNoteRead(noteId, userId, null);
            // Refresh shared users
            // fetchSharedUsers();
        } catch (error) {
            console.error("Error sharing note (read-only):", error);
        }
    };

    const handleUnshareReadOnly = async (userId) => {
        try {
            await unshareNoteRead(noteId, userId, null);
            // Refresh shared users
            // fetchSharedUsers();
        } catch (error) {
            console.error("Error unsharing note (read-only):", error);
        }
    };

    const handleShareEditable = async (userId) => {
        try {
            await shareNoteEdit(noteId, userId, null);
            // Refresh shared users
            // fetchSharedUsers();
        } catch (error) {
            console.error("Error sharing note (editable):", error);
        }
    };

    const handleUnshareEditable = async (userId) => {
        try {
            await unshareNoteEdit(noteId, userId, null);
            // Refresh shared users
            // fetchSharedUsers();
        } catch (error) {
            console.error("Error unsharing note (editable):", error);
        }
    };

    return (
        <div className="sharing-modal-backdrop" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
            zIndex: 999, // Below the modal but above the rest of the content
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div className="artdeco-card" style={{
                position: 'relative', // To position the content within the backdrop
                padding: '30px', // Increased padding
                zIndex: 1000, // Above the backdrop
                width: '60%', // Increased width
                maxWidth: '700px', // Increased maxWidth
            }}>
                <h3>Sharing Settings</h3>

                {/* Group Management */}
                <div>
                    <h4>Manage Group Sharing</h4>
                    <select onChange={handleGroupChange} value={selectedGroup}>
                        <option value="">Select a Group</option>
                        {groups.map(group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                    </select>

                    {selectedGroup && (
                        <div>
                            <h5>Group Members</h5>
                            <ul>
                                {groupMembers.map(member => (
                                    <li key={member.id}>
                                        {member.name} ({member.email})
                                        <button onClick={() => handleRemoveGroupMember(member.id)}>Remove</button>
                                    </li>
                                ))}
                            </ul>

                            {/* Add New Member */}
                            <div>
                                <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
                                    <option value="">Select a User</option>
                                    {/* Populate with available users */}
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                                    ))}
                                </select>
                                <button onClick={handleAddGroupMember}>Add Member</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Sharing */}
                <div>
                    <h4>Manage User Sharing</h4>
                    {/* List of users with read-only and editable permissions */}
                    <h5>Read Only</h5>
                    <ul>
                        {readOnlyUsers.map(user => (
                            <li key={user.id}>
                                {user.name} ({user.email})
                                <button onClick={() => handleUnshareReadOnly(user.id)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                    <h5>Editable</h5>
                    <ul>
                        {editableUsers.map(user => (
                            <li key={user.id}>
                                {user.name} ({user.email})
                                <button onClick={() => handleUnshareEditable(user.id)}>Remove</button>
                            </li>
                        ))}
                    </ul>

                    {/* Add New User */}
                    <div>
                        <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
                            <option value="">Select a User</option>
                            {/* Populate with available users */}
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                            ))}
                        </select>
                        <button onClick={() => handleShareReadOnly(selectedUser)}>Share Read Only</button>
                        <button onClick={() => handleShareEditable(selectedUser)}>Share Editable</button>
                    </div>
                </div>

                <button onClick={onClose} className={cancelButtonStyle}>Close</button>
            </div>
        </div>
    );
};

export default SharingModal;
