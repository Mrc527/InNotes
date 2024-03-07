/* global chrome */
import React, {useEffect, useState} from "react";
import {Button, Card, Image} from 'antd';
import {isSafari} from 'react-device-detect';

import {getFullData, registerNewUser, saveFullData} from "./utils";

export const PopupComponent = () => {
    const [notes, setNotes] = useState([]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [settings, setSettings] = useState({});
    const [register, setRegister] = useState(false);

    useEffect(() => {
        chrome.storage.sync.get("InNotes_Background").then((v) => {
            setSettings(v["InNotes_Background"])
        })    }, []);

    // get notes to display in popup.html
    useEffect(() => {
        if(settings && settings.username && settings.password) {
            setUsername(settings.username)
            setPassword(settings.password)
            chrome.storage.sync.set({"InNotes_Background": settings}).then(() => {
            })
            getFullData().then((item) => {
                saveSettings(settings.validLogin=true)
                setNotes(item)
            }).catch(() => {
                setUsername("")
                setPassword("")
                saveSettings(settings.validLogin=false)
            })
        }
    }, [settings]);


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
        setUsername(e.target.value)
    }
    const savePassword = (e) => {
        setPassword(e.target.value)
    }
    const saveSettings = () => {
        const newSettings = {...settings}
        newSettings.username=username
        newSettings.password=password
        setSettings(newSettings)
    }
    const registerUser = () => {
        registerNewUser({username:username,password:password}).then((response)=> {
            setUsername("")
            setPassword("")
            if (response.ok){
                saveSettings()
                window.alert("User registration successful.")
                return
            }
            streamToString(response.body).then((body) => {
                window.alert("User registration failed: " + body)
            })
        })

    }
    async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
        return await new Response(stream).text();
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

                {register && <>
                    <center>
                        Username: <input id="username" onChange={saveUsername} value={username}/><br/>
                        Password: <input id="password" type="password" onChange={savePassword} value={password}/><br/>
                        <Button onClick={registerUser}>Register</Button><br/>
                        <a onClick={() => setRegister(!register)}>Login</a>
                    </center>
                    </>}
                {!register && <table>
                    <tbody>
                    <tr>
                    <td>
                            <center>
                            Username: <input id="username" onChange={saveUsername} value={username}/><br/>
                            Password: <input id="password" type="password" onChange={savePassword} value={password}/><br/>
                            <Button onClick={saveSettings}>Save</Button><br/>
                            <a onClick={() => setRegister(!register)}>Register</a>
                        </center>
                    </td>
                        <td>
                            {settings.validLogin? <center>✅<br/>Valid Login!</center>:<center>⚠️<br/>Missing login information</center>}
                        </td>
                    </tr>
                    </tbody>
                </table>}
            </Card>
            <div className={"footer-container"}>
                Made with <span>❤</span>️ by <a target="_blank" rel="noopener noreferrer" href="http://marcovisin.com">Marco
                Visin -
                www.visin.ch</a><br/>
                <span>Version 1.1.7</span>
            </div>
        </>);
};
