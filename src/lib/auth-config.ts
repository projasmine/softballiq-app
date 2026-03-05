import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        mode: { label: "Mode", type: "text" },
        guestId: { label: "Guest ID", type: "text" },
      },
      async authorize(credentials) {
        const mode = credentials?.mode as string | undefined;

        // Guest sign-in: look up by profile ID, no password
        if (mode === "guest") {
          const guestId = credentials?.guestId as string | undefined;
          if (!guestId) return null;

          const [user] = await db
            .select()
            .from(profiles)
            .where(eq(profiles.id, guestId))
            .limit(1);

          if (!user || user.passwordHash) return null;

          // Only allow if profile was created within the last 60 seconds
          const age = Date.now() - new Date(user.createdAt).getTime();
          if (age > 60_000) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.displayName,
            role: user.role,
          };
        }

        // Standard email/password sign-in
        const rawEmail = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!rawEmail || !password) return null;
        const email = rawEmail.trim().toLowerCase();

        const [user] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.email, email))
          .limit(1);

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role ?? "player";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
