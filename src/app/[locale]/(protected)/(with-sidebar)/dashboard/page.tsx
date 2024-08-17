import { Building } from "lucide-react"
import { auth } from "@/lib/auth"
import OrganizationRepositories from "@/components/organization-repositories"
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
    </Content>
  )
}
