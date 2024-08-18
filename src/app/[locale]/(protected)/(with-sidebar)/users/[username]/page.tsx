import { getTranslations } from "next-intl/server"
import { Title } from "@/components/title"
import { UserProfile } from "@/components/user-profile"
import { Content } from "@/components/with-sidebar/content"

export default async function UserProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const t = await getTranslations("Pages.UserProfile")
  return (
    <Content>
      <Title>{t("title", { username: params.username })}</Title>
      <UserProfile username={params.username} />
    </Content>
  )
}
