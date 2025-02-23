/* global chrome */
import React, {useEffect, useState} from "react";
import {Button, Card, Image} from 'antd';
import {isSafari} from 'react-device-detect';
import MD5 from "crypto-js/md5";

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
        console.log("Current Settings",settings);
        if(settings && settings.username && settings.password) {
            setUsername(settings.username)
            setPassword(settings.password)
            chrome.storage.sync.set({"InNotes_Background": settings}).then(() => {
            })
            if(!settings.validLogin) {
                console.log("Getting Full Data")
                getFullData().then((item) => {
                    saveSettings({validLogin: true})
                    setNotes(item)
                }).catch(() => {
                    setPassword("")
                    saveSettings({password:undefined, validLogin: false})
                })
            }
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
    const saveSettings = (s) => {
        const newSettings = {...settings,...s}
        console.log("Saving Settings",newSettings)
        setSettings(newSettings)
    }
    const logout = () => {
        setUsername("")
        setPassword("")
        chrome.storage.sync.set({"InNotes_Background": {}}).then(() => {
        })
        saveSettings({password: undefined,username:undefined,validLogin:false})

    }
    const submitCredentials = () => {
        let newPassword = password
        if(newPassword && !newPassword.startsWith("-IN-"))
        {
            console.log("Calculating password hash")
            newPassword ="-IN-"+MD5(newPassword).toString();
            setPassword(newPassword);
        }
        saveSettings({password: newPassword,username:username})
    }
    const registerUser = () => {
        registerNewUser({username:username,password:password}).then((response)=> {
            logout()
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
                {settings?.validLogin && <div><center>✅<br/>Valid Login!</center><Button onClick={logout}>Logout</Button><br/></div>}
                {register && <>
                    <center>
                        Username: <input id="username" onChange={saveUsername} value={username}/><br/>
                        Password: <input id="password" type="password" onChange={savePassword} value={password}/><br/>
                        <Button onClick={registerUser}>Register</Button><br/>
                        <a onClick={() => setRegister(!register)}>Login</a>
                    </center>
                    </>}
                {!register && !(settings?.validLogin) && <table>
                    <tbody>
                    <tr>
                    <td>
                            <center>
                            Username: <input id="username" onChange={saveUsername} value={username}/><br/>
                            Password: <input id="password" type="password" onChange={savePassword} value={password}/><br/>
                            <Button onClick={submitCredentials}>Save</Button><br/>
                            <a onClick={() => setRegister(!register)}>Register</a>
                        </center>
                    </td>
                        <td>
                            {settings?.validLogin? <center>✅<br/>Valid Login!</center>:<center>⚠️<br/>Missing login information</center>}
                        </td>
                    </tr>
                    </tbody>
                </table>}
            </Card>
            <div className={"footer-container"}>
                Made with <span>❤</span>️ by <a target="_blank" rel="noopener noreferrer" href="http://marcovisin.com">Marco
                Visin -
                www.visin.ch</a><br/>
                <span>Version 1.1.8</span>
            </div>
        </>);
};
