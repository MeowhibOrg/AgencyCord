import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Github from "next-auth/providers/github"
import { db } from "@/lib/db"
import { env } from "@/../.env.mjs"

// Add this type declaration
declare module "next-auth" {
  interface User {
    organization?: string | null
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret: env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
    error: "/error",
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Github({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.organization) {
        token.organization = user.organization
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.organization = token.organization as string | null
      }
      return session
    },
  },
})

export async function getSessionOrThrow(message?: string) {
  const session = await auth()

  if (!session) {
    throw new Error(message || "Unauthorized")
  }

  return session
}

export async function getIsAdmin(message?: string) {
  const session = await auth()

  if (!session) {
    throw new Error(message || "Unauthorized")
  }

  return session.user.role === "ADMIN"
}
