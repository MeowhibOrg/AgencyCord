import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Github from "next-auth/providers/github"
import { db } from "@/lib/db"
import { env } from "@/../.env.mjs"

// Add this type declaration
declare module "next-auth" {
  interface User {
    organization?: string
  }
  interface Session {
    user: User & {
      organization?: string
    }
    accessToken?: string
  }
  interface JWT {
    organization?: string
    accessToken?: string
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
      authorization: {
        params: {
          scope: "read:user user:email read:org repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token

        try {
          const orgsResponse = await fetch("https://api.github.com/user/orgs", {
            headers: {
              Authorization: `token ${account.access_token}`,
            },
          })
          
          if (!orgsResponse.ok) {
            console.error(`Failed to fetch organizations: ${orgsResponse.statusText}`)
            return token
          }

          const orgs = await orgsResponse.json()
          console.log('Fetched organizations:', orgs)

          if (orgs.length > 0) {
            token.organization = orgs[0].login
          } else {
            console.log('User has no organizations')
          }
        } catch (error) {
          console.error('Error fetching organizations:', error)
        }
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined
      session.user.organization = token.organization as string | undefined
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