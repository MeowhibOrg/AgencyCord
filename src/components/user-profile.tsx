"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { formatRelativeTime } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  author: {
    avatar_url: string
    login: string
  }
  html_url: string
  repository: string
  linesAdded: number
  linesRemoved: number
  linesChanged: number
}

interface UserData {
  avatar_url: string
  name: string
  login: string
}

export function UserProfile({ username }: { username: string }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [commits, setCommits] = useState<UserCommit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations("Components.UserProfile")

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userResponse = await fetch(`/api/users/${username}`)
        const commitsResponse = await fetch(`/api/users/${username}/commits`)

        if (userResponse.ok && commitsResponse.ok) {
          const userData = await userResponse.json()
          const commitsData = await commitsResponse.json()
          setUser(userData)
          setCommits(commitsData)
        } else {
          setError(t("fetch_error"))
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        setError(t("fetch_error"))
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [username, t])

  if (isLoading) {
    return <div className="text-center">{t("loading")}</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle size={48} className="mb-4 text-red-400" />
        <h2 className="mb-2 text-xl font-semibold">{t("error")}</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Image
          src={user?.avatar_url ?? ""}
          alt={user?.name ?? ""}
          width={96}
          height={96}
          className="rounded-full"
        />
        <div>
          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-gray-600">{user?.login}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold">{t("latest_commits")}</h3>
        {commits.length === 0 ? (
          <p>{t("no_commits")}</p>
        ) : (
          <div className="space-y-4">
            {commits.map(commit => (
              <div key={commit.sha} className="rounded-lg border p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="size-6">
                      <AvatarImage
                        src={commit.author.avatar_url}
                        alt={commit.author.login}
                      />
                      <AvatarFallback>
                        {commit.author.login.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">
                      {commit.commit.author.name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(new Date(commit.commit.author.date))}
                    </span>
                    <span className="text-sm text-green-500">
                      +{commit.linesAdded}
                    </span>
                    <span className="text-sm text-red-500">
                      -{commit.linesRemoved}
                    </span>
                    <span className="text-sm text-blue-500">
                      ~{commit.linesChanged}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {commit.commit.message}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Repository: {commit.repository}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
