import {AuthOptions, Session} from "next-auth";
import Linkedin, {LinkedInProfile} from "next-auth/providers/linkedin";
import {JWT} from "next-auth/jwt";
interface NotesSession extends Session{
  id:string;
  name:string;
  email:string;
  image:string;
}
export const authOptions: AuthOptions = {
  providers: [
    Linkedin({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      profile: (profile: LinkedInProfile) => ({
        id: profile.sub,
        linkedinId: profile.sub, // Use profile.sub here
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
    async jwt({ token, account, profile, user, trigger, isNewUser, session }): Promise<JWT> {
      if (profile) {
        token.sub = profile.sub;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        (session.user as NotesSession).id = token.sub as string;
      }
      return session;
    },
  },
};
