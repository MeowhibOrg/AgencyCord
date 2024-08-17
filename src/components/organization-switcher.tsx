"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Organization } from "@/lib/auth/types"

export default function OrganizationSwitcher() {
  const { data: session, update } = useSession()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const t = useTranslations("Components.OrganizationSwitcher")

  useEffect(() => {
    // Fetch user's organizations
    async function fetchOrganizations() {
      const response = await fetch("/api/user/organizations")
      const data = await response.json()
      setOrganizations(data)
    }
    fetchOrganizations()
  }, [])

  async function switchOrganization(orgId: string) {
    const response = await fetch("/api/user/organization", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: orgId }),
    })
    const data = await response.json()
    if (data.success) {
      await update({
        ...session,
        user: {
          ...session?.user,
          organization: orgId,
        },
      })
    }
  }

  if (organizations.length === 0) {
    return <span>{t("no_organizations")}</span>
  }

  return (
    <select
      onChange={e => switchOrganization(e.target.value)}
      value={session?.user?.organization || ""}
      className="rounded border px-2 py-1"
    >
      <option value="">{t("select_organization")}</option>
      {organizations.map(org => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  )
}
