/* global chrome */
import React, {useEffect, useState, useCallback} from "react";
import {Button, Card, Image} from 'antd';
import {isSafari} from 'react-device-detect';
import MD5 from "crypto-js/md5";

import {getFullData, registerNewUser, saveFullData} from "./utils";

const useAuth = () => {
    const [settings, setSettings] = useState({});
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState(false);

    useEffect(() => {
        chrome.storage.sync.get("InNotes_Background").then((v) => {
            setSettings(v["InNotes_Background"] || {});
        });
    }, []);

    useEffect(() => {
        if (settings.username && settings.password) {
            setUsername(settings.username);
            setPassword(settings.password);
            chrome.storage.sync.set({"InNotes_Background": settings});
        }
    }, [settings]);

    const saveSettings = useCallback((newSettings) => {
        setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
    }, []);

    const logout = useCallback(() => {
        setUsername("");
        setPassword("");
        chrome.storage.sync.set({"InNotes_Background": {}}).then(() => {
        });
        saveSettings({password: undefined, username: undefined, validLogin: false});
    }, [saveSettings]);

    const submitCredentials = useCallback(async () => {
        setLoginError(false);
        let newPassword = password;
        if (newPassword && !newPassword.startsWith("-IN-")) {
            newPassword = "-IN-" + MD5(newPassword).toString();
            setPassword(newPassword);
        }
        saveSettings({password: newPassword, username: username});
        try {
            await getFullData();
            saveSettings({validLogin: true});
            return true;
        } catch (error) {
            setPassword("");
            saveSettings({password: undefined, validLogin: false});
            setLoginError(true);
            return false;
        }
    }, [username, password, saveSettings]);

    return {
        settings,
        username,
        password,
        loginError,
        setUsername,
        setPassword,
        saveSettings,
        logout,
        submitCredentials,
    };
};

const useData = (validLogin) => {
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        if (validLogin) {
            getFullData().then(setNotes);
        } else {
            setNotes([]);
        }
    }, [validLogin]);

    return notes;
};

export const PopupComponent = () => {
    const {
        settings,
        username,
        password,
        loginError,
        setUsername,
        setPassword,
        saveSettings,
        logout,
        submitCredentials,
    } = useAuth();
    const notes = useData(settings.validLogin);
    const [register, setRegister] = useState(false);

    const doDownload = useCallback(() => {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(notes)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "InNotes_Data.json";
        link.click();
    }, [notes]);

    const doUpload = useCallback((e) => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            try {
                const values = JSON.parse(event.target.result);
                Object.keys(values).forEach((key) => {
                    if (values[key].note.indexOf(" ") > 0) {
                        values[key].note = encodeURIComponent(values[key].note);
                    }
                });
                saveFullData(values);
            } catch (error) {
                console.error("Error parsing or saving uploaded data", error);
                window.alert("Error uploading data. Please ensure the file is a valid InNotes JSON.");
            }
        };
        fileReader.readAsText(e.target.files[0], "UTF-8");
    }, []);

    const handleRegister = useCallback(() => {
        registerNewUser({username, password})
            .then(response => {
                if (response.ok) {
                    saveSettings();
                    window.alert("User registration successful.");
                } else {
                    return response.text().then(text => {
                        window.alert("User registration failed: " + text);
                    });
                }
            })
            .catch(error => {
                console.error("Registration error", error);
                window.alert("Registration failed. Please try again later.");
            });
    }, [username, password, saveSettings]);

    const handlePasswordKeyDown = (e) => {
        if (e.key === 'Enter') {
            submitCredentials();
        }
    };

    const inputStyle = {
        marginBottom: '10px',
        padding: '5px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        width: '100%',
        boxSizing: 'border-box'
    };

    const buttonStyle = {
        margin: '5px'
    };

    return (
        <div className="popup-container">
            <Image preview={false} style={{margin: "auto", display: "block", width: "200px"}}
                   src="icons/InNotes.png"
                   alt="logo"/>
            <div className={"title-container"}>Easy Note-Taking for LinkedIn</div>
            <Card title="Login Data" bordered={false}>
                {settings?.validLogin ? (
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                        <div style={{marginBottom: '10px'}}>✅ Valid Login!</div>
                        <Button onClick={logout} style={{marginTop: '5px'}}>Logout</Button>
                    </div>
                ) : (
                    <div>
                        {loginError && (
                            <div style={{color: 'red', marginBottom: '10px', textAlign: 'center'}}>
                                Invalid credentials. Please try again.
                            </div>
                        )}
                        <center>
                            <input id="username" style={inputStyle} placeholder="Username" onChange={(e) => setUsername(e.target.value)} value={username}/><br/>
                            <input id="password" type="password" style={inputStyle} placeholder="Password" onChange={(e) => setPassword(e.target.value)} onKeyDown={handlePasswordKeyDown} value={password}/><br/>
                            <Button style={buttonStyle} onClick={submitCredentials}>Login</Button><br/>
                            <a onClick={() => setRegister(true)}>Register</a>
                        </center>
                    </div>
                )}
            </Card>
            {settings?.validLogin && (
                <>
                    <Card title="Download Data">
                        <div>You currently have data
                            for {notes ? Object.keys(notes).length : "0"} users
                        </div>
                        {isSafari && (
                            <div style={{height: "100px", width: "400px", overflow: "overlay"}}>
                                <pre className="card-text"><code id="card-text">{JSON.stringify(notes, undefined, 2)}</code></pre>
                            </div>
                        )}
                        <Button onClick={doDownload} disabled={isSafari}>Download to JSON</Button>
                    </Card>
                    <Card title="Upload Data">
                        <input type="file" id="file_upload" onChange={doUpload}/>
                    </Card>
                </>
            )}
            {register && (
                <Card title="Register">
                    <center>
                        <input id="username" style={inputStyle} placeholder="Username" onChange={(e) => setUsername(e.target.value)} value={username}/><br/>
                        <input id="password" type="password" style={inputStyle} placeholder="Password" onChange={(e) => setPassword(e.target.value)} onKeyDown={handlePasswordKeyDown} value={password}/><br/>
                        <Button style={buttonStyle} onClick={handleRegister}>Register</Button><br/>
                        <a onClick={() => setRegister(false)}>Login</a>
                    </center>
                </Card>
            )}
            <div className={"footer-container"}>
                Made with <span>❤</span>️ by <a target="_blank" rel="noopener noreferrer" href="http://marcovisin.com">Marco
                Visin -
                www.visin.ch</a><br/>
                <span>Version 1.1.8</span>
            </div>
        </div>
    );
};
