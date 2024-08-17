import { NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"
import { getSessionOrThrow } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSessionOrThrow()
    const accessToken = session.accessToken
    const organizationName = session.user.organization

    if (!accessToken || !organizationName) {
      return NextResponse.json(
        { error: "Unauthorized or no organization set" },
        { status: 401 },
      )
    }

    const octokit = new Octokit({ auth: accessToken })

    const { data: members } = await octokit.orgs.listMembers({
      org: organizationName,
      per_page: 100,
    })

    const formattedMembers = members.map(member => ({
      id: member.id.toString(),
      name: member.login,
      avatar_url: member.avatar_url,
      html_url: member.html_url,
    }))

    return NextResponse.json(formattedMembers)
  } catch (error) {
    console.error("Error fetching organization members:", error)
    return NextResponse.json(
      { error: "Failed to fetch organization members" },
      { status: 500 },
    )
  }
}
