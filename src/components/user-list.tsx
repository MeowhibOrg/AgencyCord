"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

interface User {
  id: string
  name: string
  email: string
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslations("Users")

  useEffect(() => {
    async function fetchUsers() {
      try {
        // Replace this with your actual API endpoint
        const response = await fetch("/api/user/users")
        const data = await response.json()
        setUsers(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching users:", error)
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return <div>{t("loading")}</div>
  }

  return (
    <div>
      <ul>
        {users.map(user => (
          <li key={user.id} className="mb-2">
            <span className="font-semibold">{user.name}</span> - {user.email}
          </li>
        ))}
      </ul>
    </div>
  )
}
