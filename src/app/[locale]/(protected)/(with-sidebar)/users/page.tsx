import { Title } from "@/components/title"
import { UserList } from "@/components/user-list"
import { Content } from "@/components/with-sidebar/content"

export default function UsersPage() {
  return (
    <Content>
      <Title>Users</Title>
      <UserList />
    </Content>
  )
}
