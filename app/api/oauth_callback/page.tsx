/* global window */
"use client";
import { useEffect, useState } from 'react';

const LinkedInAuthPage = () => {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const redirect = `${state}popup.html?authKey=${code}`;
      setRedirectUrl(redirect);

      setTimeout(() => {
        window.location.href = redirect;
      }, 5000);
    }
  }, []);


  return (
    <div>
      <h1>Processing LinkedIn Authentication</h1>
      <div>{redirectUrl}</div>
      <p>You can close this window.</p>
    </div>
  );
};

export default LinkedInAuthPage;
