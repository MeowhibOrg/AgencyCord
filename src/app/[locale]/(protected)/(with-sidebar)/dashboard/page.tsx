import { Building } from "lucide-react"
import { auth } from "@/lib/auth"
import OrganizationRepositories from "@/components/organization-repositories"
import { OrganizationCommits } from "@/components/organization-commits"
import { Title } from "@/components/title"
import { Content } from "@/components/with-sidebar/content"

export default async function Dashboard() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  return (
    <Content>
      <Title>Dashboard</Title>
      <div className="mb-4 flex items-center space-x-2">
        <Building size={20} />
        <span className="text-lg font-semibold">
          {session.user.organization || "No organization"}
        </span>
      </div>
      <OrganizationRepositories />
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Today's Commits</h2>
        <OrganizationCommits />
      </div>
    </Content>
  )
}