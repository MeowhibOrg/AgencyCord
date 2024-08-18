import { NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"
import { getSessionOrThrow } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSessionOrThrow()
    const accessToken = session.accessToken
    const organizationName = session.user.organization

    if (!accessToken || !organizationName) {
      console.error('Missing accessToken or organizationName', { accessToken: !!accessToken, organizationName })
      return NextResponse.json({ error: "Unauthorized or no organization set" }, { status: 401 })
    }

    const octokit = new Octokit({ auth: accessToken })

    const { data } = await octokit.repos.listForOrg({
      org: organizationName,
      type: 'all',
      sort: 'updated',
      per_page: 100,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching repositories:", error)
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 },
    )
  }
}