/* global chrome */
import React, {useEffect, useState} from "react";
import {Button, Card, Image} from 'antd';
import {isSafari} from 'react-device-detect';

import {getFullData, saveFullData} from "./utils";

export const PopupComponent = () => {
    const [notes, setNotes] = useState([]);

    // get notes to display in popup.html
    useEffect(() => {
        getFullData().then((item) => setNotes(item))
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

            //Fix for older JSON Export
            Object.keys(values).forEach((key) => {
                if (values[key].note.indexOf(" ") > 0) {
                    values[key].note = encodeURIComponent(values[key].note)
                }
            })

            setNotes(values);
            saveFullData(values);
        };
    }
    const saveUsername = (e) => {
        const newNotes = {...notes}
        if (!newNotes.InNotes_Background) {
            newNotes.InNotes_Background = {}
        }
        newNotes.InNotes_Background.username = e.target.value
        newNotes.InNotes_Background.enable = newNotes.InNotes_Background.username !== "" && newNotes.InNotes_Background.password !== ""
        setNotes(newNotes)
        saveFullData(newNotes)
        console.log("username", newNotes.InNotes_Background.username)
    }
    const savePassword = (e) => {
        const newNotes = {...notes}
        if (!newNotes.InNotes_Background) {
            newNotes.InNotes_Background = {}
        }
        newNotes.InNotes_Background.password = e.target.value
        newNotes.InNotes_Background.enable = newNotes.InNotes_Background.username !== "" && newNotes.InNotes_Background.password !== ""
        setNotes(newNotes)
        saveFullData(newNotes)
        console.log("password", newNotes.InNotes_Background.password)
    }
    const saveTimeout = (e) => {
        const newNotes = {...notes}
        if (!newNotes.InNotes_Background) {
            newNotes.InNotes_Background = {}
        }
        newNotes.InNotes_Background.refresh_timeout = e.target.value
        setNotes(newNotes)
        saveFullData(newNotes)
        console.log("refresh_timeout", newNotes.InNotes_Background.refresh_timeout)
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
                {isSafari && <div style={{height: "100px", width: "400px", overflow: "overlay"}}>
                    <pre className="card-text"><code id="card-text">{JSON.stringify(notes, undefined, 2)}</code></pre>
                </div>}
                <Button onClick={doDownload} disabled={isSafari}>Download to JSON</Button>
            </Card>
            <Card title="Upload Data">
                <input type="file" id="file_upload" onChange={doUpload}/>
            </Card>
            <Card title="Login Data">
                <input id="username" onChange={saveUsername} value={notes?.InNotes_Background?.username}/><br/>
                <input id="password" onChange={savePassword} value={notes?.InNotes_Background?.password}/><br/>
                <input id="timeout" onChange={saveTimeout} value={notes?.InNotes_Background?.refresh_timeout}/>
            </Card>
            <div className={"footer-container"}>
                Made with <span>❤</span>️ by <a target="_blank" rel="noopener noreferrer" href="http://marcovisin.com">Marco
                Visin -
                www.visin.ch</a>
                <span>Version 0.0.6</span>
            </div>
        </>);
};
