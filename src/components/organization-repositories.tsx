"use client"

import { useEffect, useState } from "react"
import { AlertCircle, GitBranch, Lock } from "lucide-react"

interface Repository {
  id: number
  name: string
  html_url: string
  description: string
  private: boolean
}

export default function OrganizationRepositories() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRepositories() {
      try {
        const response = await fetch("/api/repositories")
        if (response.ok) {
          const data = await response.json()
          setRepositories(data)
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Failed to fetch repositories")
        }
      } catch (error) {
        console.error("Failed to fetch repositories:", error)
        setError("An error occurred while fetching repositories")
      } finally {
        setIsLoading(false)
      }
    }
    fetchRepositories()
  }, [])

  if (isLoading) {
    return <div className="text-center">Loading repositories...</div>
  }

  if (repositories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle size={48} className="mb-4 text-gray-400" />
        <h2 className="mb-2 text-xl font-semibold">No repositories found</h2>
        <p className="text-gray-600">
          There are no repositories available for this organization.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle size={48} className="mb-4 text-red-400" />
        <h2 className="mb-2 text-xl font-semibold">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {repositories.map(repo => (
        <div key={repo.id} className="rounded-lg border p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            {repo.private ? <Lock size={16} /> : <GitBranch size={16} />}
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              {repo.name}
            </a>
            {repo.private && (
              <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700">
                Private
              </span>
            )}
          </div>
          {repo.description && (
            <p className="mt-2 text-sm text-gray-600">{repo.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}
