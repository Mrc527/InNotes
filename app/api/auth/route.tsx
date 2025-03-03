import {NextRequest, NextResponse} from 'next/server';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;

export async function POST(req: NextRequest) {
  try {
    const {code, redirect_uri} = await req.json()

    if (!code) {
      return NextResponse.json({error: 'Authorization code is required'}, {status: 400});
    }

    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
      console.error('Missing environment variables:', {
        LINKEDIN_CLIENT_ID,
        LINKEDIN_CLIENT_SECRET,
      });
      return NextResponse.json({error: 'Missing required environment variables'}, {status: 500});
    }

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('LinkedIn token exchange error:', errorData);
      return NextResponse.json({
        error: 'Failed to exchange authorization code for access token',
        details: errorData
      }, {status: 400});
    }

    const tokenData = await tokenResponse.json();
    const {access_token} = tokenData;

    if (!access_token) {
      console.error('Missing access token in response:', tokenData);
      return NextResponse.json({error: 'Access token not found in response'}, {status: 500});
    }
    console.log("Got access token", access_token);

    // Use the access token to fetch user profile information from LinkedIn
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      console.error('LinkedIn profile fetch error:', errorData);
      return NextResponse.json({error: 'Failed to fetch LinkedIn profile', details: errorData}, {status: 400});
    }

    const profileData = await profileResponse.json();

    console.log("Got profile data", profileData);

    return NextResponse.json({profile: profileData}, {status: 200});

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
