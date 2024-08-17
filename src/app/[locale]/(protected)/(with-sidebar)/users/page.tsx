import { OrganizationMembers } from "@/components/organization-members"
import { Title } from "@/components/title"
import { Content } from "@/components/with-sidebar/content"

export default function UsersPage() {
  return (
    <Content>
      <Title>Users</Title>
      <OrganizationMembers />
    </Content>
  )
}
