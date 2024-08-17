import { Building } from "lucide-react"
import { auth } from "@/lib/auth"
import { Placeholder } from "@/components/placeholder"
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
      <div className="flex flex-col gap-4 md:flex-row">
        <Placeholder />
        <Placeholder />
        <Placeholder />
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        <Placeholder />
        <Placeholder />
      </div>
    </Content>
  )
}
