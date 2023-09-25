/* global chrome */
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

import {PopupComponent} from "./PopupComponent";
import {TOP_CARD_CLASS_NAME} from "./constants";
import InNotes from "./InNotes";
import InNotesButton from "./InNotesMessagingCollapse";

//window.onload = loadReact;
window.addEventListener("load", loadReact, false);

function loadReact() {
    //console.log("Starting InNotes")
    if (document.getElementById("insertion-point")) {
        return;
    }
    const popupRoot = document.getElementById("popup-root");
    // PopupComponent / popup.html
    popupRoot && // to suppress minified react error 200
    ReactDOM.render(
        <React.Fragment>
            <PopupComponent/>
        </React.Fragment>,
        popupRoot
    );

    const linkedInElement = document.getElementsByClassName(TOP_CARD_CLASS_NAME);
    const insertionPoint = document.createElement("div");
    insertionPoint.id = "insertion-point";
    if (linkedInElement && linkedInElement.length > 0) {
        linkedInElement[0].parentNode.insertBefore(insertionPoint, linkedInElement[0].nextSibling);
        //updateData()
    } else {
        injectReactInChat();
        //Not on LinkedIn --> Return
        return;
    }

// content script
    !popupRoot &&
    ReactDOM.render(
        <React.StrictMode>
            <InNotes/>
        </React.StrictMode>,
        document.getElementById("insertion-point")
    );


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
    serviceWorker.unregister();
}

function injectReactInChat() {
    const chats = document.getElementsByClassName("msg-title-bar");
    if (chats && chats.length > 0) {
        const existingInsertionPoint = document.getElementById("insertion-point-chat");
        if (existingInsertionPoint) {
            return;
        }
        const insertionPoint = document.createElement("div");
        insertionPoint.id = "insertion-point-chat";
        chats[0].parentNode.insertBefore(insertionPoint, chats[0].nextSibling);
        ReactDOM.render(
            <React.StrictMode>
                <InNotesButton/>
            </React.StrictMode>,
            document.getElementById("insertion-point-chat")
        );
    }
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // listen for messages sent from background.js
        if (request.message === 'url_update') {
            loadReact();
        }
    });