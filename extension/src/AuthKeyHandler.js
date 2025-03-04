import React, {useEffect, useState} from "react";
import {BASE_URL} from "./constants";
import {useAuth} from "./Auth";
import "./AuthKeyHandler.css"; // Import CSS for styling

const AuthKeyHandler = () => {
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
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
        } finally {
          setLoading(false); // Set loading to false after API call
        }
      };

      exchangeAuthCode();
    } else {
      setLoading(false); // Set loading to false if no authCode
    }
  }, [setUsername, setPassword, saveSettings]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        window.close();
      }, 5000);

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [success]);

  return (
    <div className="auth-key-handler-container">
      <img className="logo"
           src="icons/InNotes.png"
           alt="logo"/>
      <div className="title-container">Easy Note-Taking for LinkedIn</div>
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <div className="loading-text">Logging in...</div>
        </div>
      ) : success ? (
        <>
          <div className="success-message">
            Success!
          </div>
          You can now safely close this page.
        </>
      ) : errorMessage ? (
        <div className="error-message">
          {errorMessage}
        </div>
      ) : (
        <div></div>
      )}
      <div className="footer-container">
        Made with <span>❤</span>️ by <a target="_blank" rel="noopener noreferrer" href="http://marco.visin.ch">Marco
        Visin -
        marco.visin.ch</a><br/>
        <span>Version 1.1.8</span>
      </div>
    </div>
  );
};

export default AuthKeyHandler;
