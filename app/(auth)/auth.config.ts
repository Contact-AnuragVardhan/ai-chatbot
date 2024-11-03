// app/auth/auth.config.ts
import { NextAuthOptions } from "next-auth";

export const authConfig: NextAuthOptions = {
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  providers: [
    // Providers are defined in auth.ts
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        //session.user.id = token.id as string;
      }
      return session;
    },
  },
};
