import NextAuth from "next-auth";
import Linkedin, { LinkedInProfile } from "next-auth/providers/linkedin";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

export const authOptions = {
  providers: [
    Linkedin({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      profile: (profile: LinkedInProfile) => ({
        id: profile.sub,
        linkedinId: profile.sub, // Use profile.sub here
        asd: "ciao",
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }),
      wellKnown: "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      authorization: {
        params: {
          scope: "openid profile email", // Specify the scopes you need
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }): Promise<JWT> {
      // Persist the profile.sub to the token right after signin
      if (profile) {
        token.sub = profile.sub;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      // Send properties to the client, like an access_token from a provider.
      session.user.id = token.sub;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
