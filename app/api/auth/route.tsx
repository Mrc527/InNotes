import {NextRequest, NextResponse} from 'next/server';
import {authenticateUser, registerUser, userExists} from "@/utils/authUtils";

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
    console.log(tokenData);
    const {access_token} = tokenData;

    if (!access_token) {
      console.error('Missing access token in response:', tokenData);
      return NextResponse.json({error: 'Access token not found in response'}, {status: 500});
    }
    console.log("Got access token", access_token);
    const introspectionEndpoint = 'https://www.linkedin.com/oauth/v2/introspectToken';

    const introspectionResponse = await fetch(introspectionEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        token: access_token,
      }),
    });

    if (!introspectionResponse.ok) {
      const errorData = await introspectionResponse.json();
      console.error('LinkedIn token introspection error:', errorData);
      return NextResponse.json({
        error: 'Failed to introspect token',
        details: errorData,
      }, {status: 400});
    }

    const introspectionData = await introspectionResponse.json();
    console.log(introspectionData);
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
    const user = {
      name:profileData.name,
      email: profileData.email,
      picture: profileData.picture,
      id: profileData.sub,
    }
    if(! (await userExists(user.id))) {
      const result = await registerUser(user)
      console.log("Registration", result);
      return NextResponse.json({profile: profileData, authData: result}, {status: 200});
    }
    const authData = await authenticateUser(user)
    return NextResponse.json({profile: profileData, authData: authData}, {status: 200});

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
