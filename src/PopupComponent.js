/* global chrome */
import React, {useState, useEffect} from "react";
import {Card, Image} from 'antd';
import {isSafari} from 'react-device-detect';

import {saveFullData} from "./utils";
import {Button} from "antd";

export const PopupComponent = () => {
    const [notes, setNotes] = useState([]);

    // get notes to display in popup.html
    useEffect(() => {
        chrome.storage.sync.get((items) => {
            setNotes(items);
        });
    }, []);


    const doDownload = () => {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(notes)
        )}`;
        var link = document.createElement("a");
        link.href = jsonString;
        link.download = "InNotes_Data.json";

        link.click();
    }

    const doUpload = (e) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
            const values = JSON.parse(e.target.result);
            setNotes(values);
            saveFullData(values);
        };
    }

    return (
        <>
            <Image preview={false} style={{margin: "auto", display: "block", width: "200px"}}
                   src="icons/InNotes.png"
                   alt="logo"/>
            <div className={"title-container"}>Easy Note-Taking for LinkedIn</div>
            <Card title="Download Data">
                <div>You currently have data
                    for {notes ? Object.keys(notes).length : "0"} users
                </div>
                {isSafari && <div style={{height: "100px", width: "400px", overflow:"overlay"}} >
                    <pre className="card-text" ><code id="card-text">{JSON.stringify(notes, undefined, 2)}</code></pre>
                </div>}
                <Button onClick={doDownload} disabled={isSafari}>Download to JSON</Button>
            </Card>
            <Card title="Upload Data">
                <input type="file" id="file_upload" onChange={doUpload}/>
            </Card>
            <div className={"footer-container"}>
                Made with <span>❤</span>️ by <a target="_blank" rel="noopener noreferrer" href="http://marcovisin.com">Marco Visin -
                www.visin.ch</a>
            </div>
        </>);
};
