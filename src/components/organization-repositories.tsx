"use client"

import { useEffect, useState } from "react"
import { AlertCircle, GitBranch } from "lucide-react"

interface Repository {
  id: number
  name: string
  html_url: string
  description: string
}

export function OrganizationRepositories() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRepositories() {
      try {
        const response = await fetch("/api/user/repositories")
        if (response.ok) {
          const data = await response.json()
          setRepositories(data)
        }
      } catch (error) {
        console.error("Failed to fetch repositories:", error)
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {repositories.map(repo => (
        <div key={repo.id} className="rounded-lg border p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <GitBranch size={16} />
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              {repo.name}
            </a>
          </div>
          {repo.description && (
            <p className="mt-2 text-sm text-gray-600">{repo.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}
