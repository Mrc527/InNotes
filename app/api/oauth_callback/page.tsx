"use client";

import { useEffect } from 'react';

const LinkedInAuthPage = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const redirectUrl = `${state}popup.html?authKey=${code}`;

  useEffect(() => {
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 5000);
  }, [code, redirectUrl]);


  return (
    <div>
      <h1>Processing LinkedIn Authentication</h1>
      <div>{redirectUrl}</div>
      <p>You can close this window.</p>
    </div>
  );
};

export default LinkedInAuthPage;
