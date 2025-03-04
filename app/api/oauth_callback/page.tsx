/* global window */
"use client";
import { useEffect } from 'react';

const LinkedInAuthPage = () => {

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const redirect = `${state}popup.html?authKey=${code}`;
      window.location.href = redirect;
    }
  }, []);


  return (
    <div>
      <h1>Processing LinkedIn Authentication...</h1>
      <p>You should be redirected soon.</p>
    </div>
  );
};

export default LinkedInAuthPage;
