import React from 'react';

const StatusManagement = ({ statuses, statusId, handleStatusChange, handleManageStatusesClick }) => {
    return (
        <div className="ph5 pv3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
                <label htmlFor="status" className="text-body-small mb1">Status:</label>
                <div className="select-wrapper">
                    <select
                        id="status"
                        className="artdeco-dropdown__item"
                        value={statusId}
                        onChange={handleStatusChange}
                        style={{ paddingRight: '3em' }}
                    >
                        <option value="">Select Status</option>
                        {statuses.map(statusItem => (
                            <option key={statusItem.id} value={statusItem.id}>{statusItem.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <button className="notes-edit-button ml2 artdeco-button artdeco-button--2 artdeco-button--primary" onClick={handleManageStatusesClick}>Manage Statuses</button>
        </div>
    );
};

export default StatusManagement;
