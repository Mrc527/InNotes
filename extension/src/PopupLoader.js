import React from 'react';
import AuthKeyHandler from './AuthKeyHandler';
import {PopupComponent} from './PopupComponent';

const PopupLoader = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const authKey = urlParams.get('authKey');

  return (
    <>
      {authKey ? (
        <AuthKeyHandler/>
      ) : (
        <PopupComponent/>
      )}
    </>
  );
};

export default PopupLoader;
