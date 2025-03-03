/* global chrome */
import React, {useEffect, useState, useCallback} from "react";
import {isSafari} from 'react-device-detect';
import {debounce} from 'lodash';

import {getFullData, saveFullData, getRequest, registerNewUser, postData} from "./utils";
import {useAuth} from "./Auth";
import LoginRegisterForm from "./components/LoginRegisterForm";
import PremiumFeatures from "./components/PremiumFeatures";
import MD5 from "crypto-js/md5";
import {BASE_URL} from "./constants";

const useSearch = (searchTerm, settings) => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce(async (term) => {
            if (!term) {
                setSearchResults([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const results = await getRequest(`/search?searchTerm=${term}`, {}, {
                    username: settings.username,
                    password: settings.password
                });
                setSearchResults(results);
            } catch (err) {
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

const getSnippet = (text, searchTerm, index) => {
    const snippetLength = 50; // Number of characters to show before and after the search term
    const startIndex = Math.max(0, index - snippetLength);
    const endIndex = Math.min(text.length, index + (searchTerm?.length || 0) + snippetLength);
    return `...${text?.substring(startIndex, endIndex)}...`;
};

const generateSnippet = (item, searchTerm) => {
    let text = '';
    let searchTermIndex = -1;

    if (item.notes && item.notes.length > 0) {
        for (let i = 0; i < item.notes.length; i++) {
            text = decodeURIComponent(item.notes[i].text);
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
        setValidLogin
    } = useAuth();
    const [notes, setNotes] = useState([]);
    const [register, setRegister] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { searchResults, loading: searchLoading, error: searchError } = useSearch(searchTerm, settings);
    const [stripeLoading, setStripeLoading] = useState(false);
    const [isImportExportOpen, setIsImportExportOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [user, setUser] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

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
                window.alert("Error parsing or saving uploaded data", error);
            }
        };
        fileReader.readAsText(e.target.files[0], "UTF-8");
    }, []);

    const handlePasswordKeyDown = (e) => {
        if (e.key === 'Enter') {
            submitCredentials();
        }
    };

    const handleStripeCheckout = async () => {
        setStripeLoading(true);
        try {
            const response = await postData('/stripe', {priceId: "price_1QxxdeKkAMzrwMPSQ0A5lrKW"});
            const data = await response.json();

            if (data?.url) {
                console.log("Opening Stripe Checkout in a new tab:", data?.url);
                chrome.tabs.create({ url: data.url }); // Open in a new tab
            } else {
                console.error("No URL received from the server.");
                alert("Failed to initiate checkout. Please try again.");
            }

        } catch (error) {
            console.error("Error creating checkout session:", error);
            alert("Failed to initiate checkout. Please try again.");
        } finally {
            setStripeLoading(false);
        }
    };


    const handleRegister = useCallback(() => {
        registerNewUser({username, password: "-IN-" + MD5(password).toString(), email})
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
    }, [username, password, saveSettings, email]);

    useEffect(() => {
        if (settings?.validLogin) {
            (async () => {
                getRequest("/user")
                  .then(response => {
                      setUser(response);
                  })
                  .catch(error => {
                      console.error("Error fetching user data:", error);
                      setUser(null);
                  });
                setNotes((await getFullData()));
            })();
        } else {
            setUser(null);
        }
    }, [settings?.validLogin]);

    const handleLinkedInLogin = () => {
        const manifest = chrome.runtime.getManifest();
        if (!manifest.oauth2?.scopes) throw new Error('No OAuth2 scopes defined in the manifest file');

        const url = new URL('https://www.linkedin.com/uas/oauth2/authorization');

        url.searchParams.set('client_id', manifest.oauth2.client_id);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('redirect_uri', `https://${chrome.runtime.id}.chromiumapp.org`);
        url.searchParams.set('scope', manifest.oauth2.scopes.join(' '));
        url.searchParams.set('state', Math.random().toString(36).substring(2, 15)); // Add state parameter

        chrome.identity.launchWebAuthFlow(
            {
                url: url.href,
                interactive: true
            },
            async (redirectedTo) => {
                if (chrome.runtime.lastError) {
                    console.error("LinkedIn login failed:", chrome.runtime.lastError.message);
                    alert("LinkedIn login failed: " + chrome.runtime.lastError.message);
                    return;
                }

                if (redirectedTo) {
                    const url = new URL(redirectedTo);
                    const authCode = url.searchParams.get('code');

                    if (authCode) {
                        try {
                            const response = await fetch(BASE_URL+'/auth', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ code: authCode, redirect_uri: `https://${chrome.runtime.id}.chromiumapp.org`})
                            });
                            console.log("Got response",response);
                            if (response.ok) {
                                const data = await response.json();
                                console.log("LinkedIn profile data:", data);
                                // Handle successful login (e.g., store user info, update UI)
                                setValidLogin(true);
                                saveSettings();
                                alert("LinkedIn login successful!");
                            } else {
                                console.error("Failed to exchange code for token:", response);
                                alert("LinkedIn login failed.");
                            }
                        } catch (error) {
                            console.error("Error calling backend API:", error);
                            alert("LinkedIn login failed: Error calling backend.");
                        }


                    } else {
                        console.error("LinkedIn login failed: No authorization code received.");
                        alert("LinkedIn login failed: No authorization code received.");
                    }
                } else {
                    console.error("LinkedIn login failed: Redirect URL is null.");
                    alert("LinkedIn login failed: Redirect URL is null.");
                }
            }
        );
    };


    return (
        <div className="popup-container" style={{ minWidth: '500px', padding: '16px' }}>
            <img style={{margin: "auto", display: "block", width: "150px"}}
                   src="icons/InNotes.png"
                   alt="logo"/>
            <div className={"title-container"}>Easy Note-Taking for LinkedIn</div>
            {!settings?.validLogin && (
                <LoginRegisterForm
                    username={username}
                    password={password}
                    setUsername={setUsername}
                    setPassword={setPassword}
                    loginError={loginError}
                    submitCredentials={submitCredentials}
                    register={register}
                    setRegister={setRegister}
                    handleRegister={handleRegister}
                    handlePasswordKeyDown={handlePasswordKeyDown}
                    email={email}
                    setEmail={setEmail}
                    termsAccepted={termsAccepted}
                    setTermsAccepted={setTermsAccepted}
                    handleLinkedInLogin={handleLinkedInLogin} // Pass the handler
                />
            )}

            {settings?.validLogin && (
                <>
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Search Notes</div>
                        <input
                            placeholder="Search your notes"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ marginBottom: '10px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    {searchLoading && <p>Searching...</p>}
                    {searchError && <p style={{ color: 'red' }}>Error: {searchError}</p>}
                    {searchResults && searchResults.length > 0 && (
                        <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Search Results</div>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {searchResults.map(item => (
                                    <li key={item.linkedinUser} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                                        <a href={`https://www.linkedin.com/in/${item.linkedinUser}`} target="_blank" rel="noopener noreferrer">
                                            {item.linkedinUser}
                                        </a>
                                        <div style={{ fontSize: '0.8em', color: '#666', flexShrink: 1, textAlign: 'right', minWidth: '50%' }}>
                                            {generateSnippet(item, searchTerm)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {user?.status === "free" && (
                        <PremiumFeatures stripeLoading={stripeLoading} handleStripeCheckout={handleStripeCheckout} />
                    )}

                    <div style={{ marginBottom: '16px', border: '1px solid #ddd', borderRadius: '5px' }}>
                        <div
                            style={{ fontWeight: 'bold', fontSize: '16px', padding: '10px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                            onClick={() => setIsImportExportOpen(!isImportExportOpen)}
                        >
                            Import/Export Data
                        </div>
                        {isImportExportOpen && (
                            <div>
                                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Download Data</div>
                                    <div>You currently have data for {notes ? Object.keys(notes).length : "0"} users</div>
                                    {isSafari && (
                                        <div style={{ height: "100px", width: "400px", overflow: "overlay" }}>
                                            <pre className="card-text"><code id="card-text">{JSON.stringify(notes, undefined, 2)}</code></pre>
                                        </div>
                                    )}
                                    <button onClick={doDownload} disabled={isSafari} style={{ margin: '5px' }}>Download to JSON</button>
                                </div>
                                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Upload Data</div>
                                    <input type="file" id="file_upload" onChange={doUpload} />
                                </div>
                            </div>
                        )}
                    </div>
                    {user?.status === 'premium' && (
                      <div style={{
                          width: '100%',
                          marginBottom: '16px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          padding: '10px',
                          textAlign: 'center',
                          boxSizing: 'border-box',
                      }}>
                          We're so grateful for your support! Thank you for being a Pro member!🚀
                      </div>
                    )}


                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <button onClick={logout} style={{ marginTop: '10px', marginBottom: '16px' }}>Logout</button>
                    </div>
                </>
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
