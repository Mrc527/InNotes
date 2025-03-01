/* global chrome */
import {useState, useCallback, useEffect} from "react";
import MD5 from "crypto-js/md5";
import {getRequest} from "./utils";

export const useAuth = () => {
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
        setSettings(prevSettings => ({...prevSettings, ...newSettings}));
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
            await getRequest("/user");
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
