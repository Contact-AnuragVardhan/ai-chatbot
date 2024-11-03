// app/auth/auth.ts
import { compare } from "bcrypt-ts";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { getUser } from "@/db/queries";

import { authConfig } from "./auth.config";

export default NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;
        const { email, password } = credentials;

        const users = await getUser(email);
        if (users.length === 0) return null;

        const passwordsMatch = await compare(password, users[0].password!);
        if (passwordsMatch) return users[0] as any;

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        //session.user.id = token.id as string;
      }
      return session;
    },
  },
});
