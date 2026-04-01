import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
        if (user.length === 0) return null;
        const isValid = await bcrypt.compare(credentials.password, user[0].password);
        if (!isValid) return null;
        return { id: user[0].id, email: user[0].email, name: user[0].name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id;
      const userData = await db.select().from(users).where(eq(users.id, token.id)).limit(1);
        if (userData.length) {
          session.user.name = userData[0].name;
          session.user.email = userData[0].email;
          session.user.avatarUrl = userData[0].avatarUrl;
        }
      return session;
    },
  },
  pages: { signIn: "/login", signUp: "/register" },
  secret: process.env.NEXTAUTH_SECRET,
};