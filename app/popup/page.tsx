"use client";

import React, {useEffect, useState, useCallback} from "react";
import MD5 from 'crypto-js/md5';
import {debounce} from 'lodash';

type Settings = {
    username: string | undefined;
    password: string | undefined;
    validLogin?: boolean | undefined;
};
type Note = {
    data?: [{ text: string, date: string }];
    note: string;
    linkedinUser?: string;
    linkedinKey?: string;
};

const URL = "https://innotes.me/api";

async function getRequest(url = "", username?: string, password?: string) {
    const headers: { [key: string]: string } = {
        "Content-Type": "application/json",
    };
    if (username && password) {
        headers["username"] = username;
        headers["password"] = password;
    }

    const response = await fetch(URL + url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        headers: headers,
        redirect: "follow",
        referrerPolicy: "no-referrer",
    });

    if (response.status === 401) {
        throw new Error("Unauthorized");
    }

    try {
        return await response.json();
    } catch (e) {
        return {};
    }
}

async function postData(url = "", data = {}, username?: string, password?: string) {
    const headers: { [key: string]: string } = {
        "Content-Type": "application/json",
    };
    if (username && password) {
        headers["username"] = username;
        headers["password"] = password;
    }

    const response = await fetch(URL + url, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        headers: headers,
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: typeof data === 'string' ? data : JSON.stringify(data),
    });
    return response;
}

async function registerNewUser(value: any) {
    return await postData("/user", value);
}

async function saveFullData(value: any, username?: string, password?: string) {
    Object.keys(value).forEach((key) => {
        if (!key || !value[key].note || 'undefined' === value[key].note) {
            return;
        }
        value[key].linkedinUser = key;
        saveData("", value[key], username, password);
    });
}

async function saveData(key: string, value: any, username?: string, password?: string) {
    return await postData("/note", value, username, password);
}

async function getFullData(username?: string, password?: string) {
    return await getRequest("/note", username, password);
}

const useAuth = () => {
    const [settings, setSettings] = useState({} as Settings);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState(false);

    useEffect(() => {
        // Mock chrome.storage.sync.get for Next.js environment
        const storedSettings = localStorage.getItem("InNotes_Background");
        if (storedSettings) {
            setSettings(JSON.parse(storedSettings) || {});
        }
    }, []);

    useEffect(() => {
        if (settings.username && settings.password) {
            setUsername(settings.username);
            setPassword(settings.password);
            // Mock chrome.storage.sync.set for Next.js environment
            localStorage.setItem("InNotes_Background", JSON.stringify(settings));
        }
    }, [settings]);

    const saveSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prevSettings => ({...prevSettings, ...newSettings}));
    }, []);


    const logout = useCallback(() => {
        setUsername("");
        setPassword("");
        // Mock chrome.storage.sync.set for Next.js environment
        localStorage.setItem("InNotes_Background", JSON.stringify({}));
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
            await getFullData(username, newPassword);
            saveSettings({validLogin: true});
            return true;
        } catch (error: any) {
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

const useData = (validLogin: boolean, username?: string, password?: string) => {
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        if (validLogin) {
            getFullData(username, password).then(setNotes);
        } else {
            setNotes([]);
        }
    }, [validLogin, username, password]);

    return notes;
};

const useSearch = (searchTerm: string, settings: Settings) => {
    const [searchResults, setSearchResults] = useState([] as any[]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const debouncedSearch = useCallback(
        debounce(async (term) => {
            if (!term) {
                setSearchResults([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const results = await getRequest(`/search?searchTerm=${term}`, settings.username, settings.password);
                const parsed: any[] = (results as any[]).map(r => ({...r, data: JSON.parse(r.data)}));
                setSearchResults(parsed);
            } catch (err: any) {
                setError(err.message || "Search failed");
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        }, 300), // 300ms debounce delay
        [settings]
    );

    useEffect(() => {
        debouncedSearch(searchTerm);

        // Cleanup function to cancel the debounced function on unmount or when dependencies change
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchTerm, settings, debouncedSearch]);

    return { searchResults, loading, error };
};

const getSnippet = (text: string, searchTerm:string, index: number) => {
    const snippetLength = 50; // Number of characters to show before and after the search term
    const startIndex = Math.max(0, index - snippetLength);
    const endIndex = Math.min(text.length, index + searchTerm.length + snippetLength);
    return `...${text.substring(startIndex, endIndex)}...`;
};

const PopupComponent = () => {
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
    const notes = useData(settings.validLogin || false, username, password);
    const [register, setRegister] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { searchResults, loading: searchLoading, error: searchError } = useSearch(searchTerm, settings);

    const doDownload = useCallback(() => {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(notes)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "InNotes_Data.json";
        link.click();
    }, [notes]);

    const doUpload = useCallback((e:any) => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            try {
                const values = JSON.parse(event.target?.result as string || "{}");
                Object.keys(values).forEach((key) => {
                    if (values[key].note.indexOf(" ") > 0) {
                        values[key].note = encodeURIComponent(values[key].note);
                    }
                });
                saveFullData(values, username, password);
            } catch (error) {
                console.error("Error parsing or saving uploaded data", error);
                window.alert("Error uploading data. Please ensure the file is a valid InNotes JSON.");
            }
        };
        fileReader.readAsText(e.target.files[0], "UTF-8");
    }, [username, password]);

    const handleRegister = useCallback(() => {
        registerNewUser({username, password})
            .then(response => {
                if (response.ok) {
                    saveSettings({});
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

    const handlePasswordKeyDown = (e: any) => {
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
    };

    const buttonStyle = {
        margin: '5px'
    };

    const collapseHeaderStyle = {
        fontWeight: 'bold',
        fontSize: '16px',
        padding: '10px',
        borderBottom: '1px solid #f0f0f0',
    };

    const generateSnippet = (item: Note) => {
        let text = '';
        let searchTermIndex = -1;

        if (item.data && item.data.length > 0) {
            for (let i = 0; i < item.data.length; i++) {
                text = decodeURIComponent(item.data[i].text);
                searchTermIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase());
                if (searchTermIndex > -1) {
                    break;
                }
            }
            if (searchTermIndex === -1) {
                text = decodeURIComponent(item.note);
                searchTermIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase());
            }
        } else {
            text = decodeURIComponent(item.note);
            searchTermIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase());
        }

        return getSnippet(text, searchTerm, searchTermIndex);
    }


    return (
        <div className="popup-container" style={{ minWidth: '500px', padding: '16px' }}>
            <img src="/icons/InNotes.png" className="dark:invert" alt="logo" style={{margin: "auto", display: "block", width: "150px"}}/>
            <div className={"title-container"}  style={{textAlign: 'center'}}>Easy Note-Taking for LinkedIn</div>
            {!settings?.validLogin &&
              <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                    <h2 style={{ fontSize: '1.2em', marginBottom: '10px' }}>Login Data</h2>
                    <div>
                        {loginError && (
                            <div style={{color: 'red', marginBottom: '10px', textAlign: 'center'}}>
                                Invalid credentials. Please try again.
                            </div>
                        )}
                        <center>
                            <input id="username" style={inputStyle} placeholder="Username" onChange={(e) => setUsername(e.target.value)} value={username}/><br/>
                            <input type="password" id="password" style={inputStyle} placeholder="Password" onChange={(e) => setPassword(e.target.value)} onKeyDown={handlePasswordKeyDown} value={password}/><br/>
                            <button style={buttonStyle} onClick={submitCredentials}>Login</button><br/>
                            <a href="#" onClick={() => setRegister(true)}>Register</a>
                        </center>
                    </div>
                </div>
            }

            {settings?.validLogin && (
                <>
                    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                        <h2 style={{ fontSize: '1.2em', marginBottom: '10px' }}>Search Notes</h2>
                        <input
                            placeholder="Search your notes"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {searchLoading && <p>Searching...</p>}
                    {searchError && <p style={{ color: 'red' }}>Error: {searchError}</p>}
                    {searchResults && searchResults.length > 0 && (
                        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                            <h2 style={{ fontSize: '1.2em', marginBottom: '10px' }}>Search Results</h2>
                            <ul>
                                {searchResults.map((item: Note, index: number) => (
                                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <a href={`https://www.linkedin.com/in/${item?.linkedinUser}`} target="_blank" rel="noopener noreferrer">
                                            {item?.linkedinUser}
                                        </a>
                                        <div style={{ fontSize: '0.8em', color: '#666', flexShrink: 1, textAlign: 'right', minWidth: '50%' }}>
                                            {generateSnippet(item)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}


                    <details style={{ marginBottom: '16px', border: '1px solid #ccc', padding: '10px' }}>
                        <summary style={collapseHeaderStyle}>Import/Export Data</summary>
                        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                            <h3 style={{ fontSize: '1.1em', marginBottom: '10px' }}>Download Data</h3>
                            <div>You currently have data for {notes ? Object.keys(notes).length : "0"} users</div>
                            <button onClick={doDownload}>Download to JSON</button>
                        </div>
                        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                            <h3 style={{ fontSize: '1.1em', marginBottom: '10px' }}>Upload Data</h3>
                            <input type="file" id="file_upload" onChange={doUpload}/>
                        </div>
                    </details>
                    <button onClick={logout} style={{ marginTop: '10px', display: 'block', margin: '0 auto', marginBottom: '16px' }}>Logout</button>
                </>
            )}

            {register && (
                <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                    <h2 style={{ fontSize: '1.2em', marginBottom: '10px' }}>Register</h2>
                    <center>
                        <input id="username" style={inputStyle} placeholder="Username" onChange={(e) => setUsername(e.target.value)} value={username}/><br/>
                        <input type="password" id="password" style={inputStyle} placeholder="Password" onChange={(e) => setPassword(e.target.value)} onKeyDown={handlePasswordKeyDown} value={password}/><br/>
                        <button style={buttonStyle} onClick={handleRegister}>Register</button><br/>
                        <a href="#" onClick={() => setRegister(false)}>Login</a>
                    </center>
                </div>
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

export default PopupComponent;
