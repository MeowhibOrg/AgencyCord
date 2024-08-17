"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

interface Member {
  id: string
  name: string
  avatar_url: string
  html_url: string
}

export function OrganizationMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations("Components.OrganizationMembers")

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          setMembers(data)
        } else {
          const errorData = await response.json()
          setError(errorData.error || t("fetch_error"))
        }
      } catch (error) {
        console.error("Failed to fetch members:", error)
        setError(t("fetch_error"))
      } finally {
        setIsLoading(false)
      }
    }
    fetchMembers()
  }, [t])

  if (isLoading) {
    return <div className="text-center">{t("loading")}</div>
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle size={48} className="mb-4 text-gray-400" />
        <h2 className="mb-2 text-xl font-semibold">{t("no_members")}</h2>
        <p className="text-gray-600">{t("no_members_description")}</p>
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {members.map(member => (
        <div key={member.id} className="rounded-lg border p-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <Image
              src={member.avatar_url}
              alt={member.name}
              width={48}
              height={48}
              className="size-12 rounded-full"
            />
            <div>
              <a
                href={member.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline"
              >
                {member.name}
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
