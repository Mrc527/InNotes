import React from "react";
import "./App.css";
import logo from './icons/Logo_48.png';

import InNotesMessagingSection from "./InNotesMessagingSection";

const InNotesMessagingCollapse = () => {
    return (
        <div className="artdeco-card ember-view relative break-words">
            <details>
                <summary style={{listStyle: 'none', padding: '0', margin: '0'}}>
                    <img src={logo} width="28px" height="28px" alt="InNotes Logo" style={{verticalAlign: 'middle'}}/>
                    InNotes
                </summary>
                <div style={{padding: '10px'}}>
                    <InNotesMessagingSection/>
                </div>
            </details>
        </div>
    );
};

export default InNotesMessagingCollapse;
