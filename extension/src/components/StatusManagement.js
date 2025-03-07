import React from 'react';

const StatusManagement = ({ statuses, statusId, handleStatusChange, handleManageStatusesClick }) => {
    return (
        <div className="ph5 pv3">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="status" className="t-16 t-black--light mb1" style={{ fontWeight: '600', marginRight: '0.5rem' }}>Status:</label>
                <div className="select-wrapper">
                    <select
                        id="status"
                        value={statusId}
                        onChange={handleStatusChange}
                        style={{ paddingRight: '3em' }}
                    >
                        <option value="">Select Status</option>
                        {statuses?.map(statusItem => (
                            <option key={statusItem.id} value={statusItem.id}>{statusItem.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleManageStatusesClick}
                    className="t-normal t-black--light"
                    style={{
                        padding: 0,
                        marginLeft: '0.5rem',
                        marginBottom: '0.8rem',
                        alignSelf: 'flex-end',
                        fontSize: '1.4rem'
                    }}
                >
                    Manage Statuses
                </button>
            </div>
        </div>
    );
};

export default StatusManagement;
