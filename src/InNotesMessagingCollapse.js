import React from "react";
import "./App.css";
import {Collapse, Image} from "antd";
import logo from './icons/Logo_48.png';

import InNotesPopup from "./InNotesMessagingSection";

const {Panel} = Collapse;

export default () => {
    return (
        <div className="artdeco-card ember-view relative break-words">

            <Collapse expandIcon={() => {
                return <Image preview={false} width="28px" height="28px" src={logo}></Image>
            }}>
                <Panel header="InNotes" key="1">
                    <InNotesPopup></InNotesPopup>
                </Panel>
            </Collapse>
        </div>
    );
    /*return (
        <div className="artdeco-card ember-view relative break-words mt7">
            <button className="btn btn-success" onClick={() => {
                setShow(!show)
            }}><Image preview={false} src={Logo} width="40px" height="40px"></Image></button>
            <Modal open={show}>
                <InNotesPopup username={user}></InNotesPopup>
            </Modal>
        </div>
    );*/
};

