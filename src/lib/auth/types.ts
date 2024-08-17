import { UserRole } from "@prisma/client"
import { DefaultSession } from "next-auth"

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole
  createdAt: Date
  organization: string | null
}

export enum SocialProvider {
  Github = "github",
}