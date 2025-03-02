/* global chrome */
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

import {PopupComponent} from "./PopupComponent";
import {TOP_CARD_CLASS_NAME, TOP_CARD_ID_MOBILE} from "./constants";
import InNotes from "./InNotes";
import InNotesButton from "./InNotesMessagingCollapse";

window.addEventListener('load', loadReact);

function loadReact() {
  //console.log("Starting InNotes")
  if (document.getElementById("insertion-point")) {
    return;
  }
  const popupRoot = document.getElementById("popup-root");
  // PopupComponent / popup.html
  if (popupRoot) {
    // to suppress minified react error 200
    const root = ReactDOM.createRoot(popupRoot);
    root.render(
      <React.Fragment>
        <PopupComponent/>
      </React.Fragment>
    );
  }


  const linkedInElement = document.querySelector(TOP_CARD_CLASS_NAME);
  const linkedInElementMobile = document.getElementById(TOP_CARD_ID_MOBILE);
  const insertionPoint = document.createElement("div");
  insertionPoint.id = "insertion-point";
  insertionPoint.className = "bg-color-background-container";
  if (linkedInElement) {
    linkedInElement.parentNode.insertBefore(insertionPoint, linkedInElement.nextSibling);
    //updateData()
  } else if (linkedInElementMobile) {
    linkedInElementMobile.parentNode.insertBefore(insertionPoint, linkedInElementMobile.nextSibling);
    //updateData()
  } else {
    injectReactInChat();
    //Not on LinkedIn --> Return
    return;
  }

// content script
  if (!popupRoot) {
    const insertionPointElement = document.getElementById("insertion-point");
    const root = ReactDOM.createRoot(insertionPointElement);
    root.render(
      <React.StrictMode>
        <InNotes/>
      </React.StrictMode>
    );
  }


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
    const chatInsertionPoint = document.getElementById("insertion-point-chat");
    const root = ReactDOM.createRoot(chatInsertionPoint);
    root.render(
      <React.StrictMode>
        <InNotesButton/>
      </React.StrictMode>
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
