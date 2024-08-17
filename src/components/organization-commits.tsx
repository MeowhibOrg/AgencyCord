"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

interface Commit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  repository: string
}

export function OrganizationCommits() {
  const [commits, setCommits] = useState<Commit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations("Components.OrganizationCommits")

  useEffect(() => {
    async function fetchCommits() {
      try {
        const today = new Date().toISOString().split("T")[0]
        const response = await fetch(`/api/commits?date=${today}`)
        if (response.ok) {
          const data = await response.json()
          setCommits(data)
        } else {
          const errorData = await response.json()
          setError(errorData.error || t("fetch_error"))
        }
      } catch (error) {
        console.error("Failed to fetch commits:", error)
        setError(t("fetch_error"))
      } finally {
        setIsLoading(false)
      }
    }
    fetchCommits()
  }, [t])

  if (isLoading) {
    return <div className="text-center">{t("loading")}</div>
  }

  if (commits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle size={48} className="mb-4 text-gray-400" />
        <h2 className="mb-2 text-xl font-semibold">{t("no_commits")}</h2>
        <p className="text-gray-600">{t("no_commits_description")}</p>
      </div>
    )
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
    <div className="space-y-4">
      {commits.map(commit => (
        <div key={commit.sha} className="rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{commit.commit.author.name}</h3>
            <span className="text-sm text-gray-500">
              {new Date(commit.commit.author.date).toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">{commit.commit.message}</p>
          <p className="mt-1 text-xs text-gray-400">
            Repository: {commit.repository}
          </p>
        </div>
      ))}
    </div>
  )
}
