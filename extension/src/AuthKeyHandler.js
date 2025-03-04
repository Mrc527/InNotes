import React, {useEffect, useState} from "react";
import {BASE_URL} from "./constants";
import {useAuth} from "./Auth";

const AuthKeyHandler = () => {
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const {setUsername, setPassword, saveSettings} = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('authKey');

    if (authCode) {
      const exchangeAuthCode = async () => {
        try {
          const response = await fetch(BASE_URL + '/auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              code: authCode,
              redirect_uri: `${BASE_URL}/oauth_callback`
            })
          });

          if (response.ok) {
            const data = await response.json();
            setPassword(data.authData.password);
            setUsername(data.authData.username);
            saveSettings({
              username: data.authData.username,
              password: data.authData.password,
              validLogin: true
            });
            setSuccess(true);
          } else {
            console.error("Failed to exchange code for token:", response);
            setErrorMessage("LinkedIn login failed.");
          }
        } catch (error) {
          console.error("Error calling backend API:", error);
          setErrorMessage("LinkedIn login failed: Error calling backend.");
        }
      };

      exchangeAuthCode();
    }
  }, [setUsername, setPassword, saveSettings]);

  return (
    <div>
      <img style={{margin: "auto", display: "block", width: "150px"}}
           src="icons/InNotes.png"
           alt="logo"/>
      <div className={"title-container"}>Easy Note-Taking for LinkedIn</div>
      {success ? (
        <div style={{textAlign: 'center', marginTop: '16px', color: 'green'}}>
          Success!
        </div>
      ) : errorMessage ? (
        <div style={{textAlign: 'center', marginTop: '16px', color: 'red'}}>
          {errorMessage}
        </div>
      ) : "Logging in..."}
      <div className={"footer-container"}>
        Made with <span>❤</span>️ by <a target="_blank" rel="noopener noreferrer" href="http://marco.visin.ch">Marco
        Visin -
        www.visin.ch</a><br/>
        <span>Version 1.1.8</span>
      </div>
    </div>
  );
};

export default AuthKeyHandler;
