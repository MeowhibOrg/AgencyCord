import { NextResponse } from "next/server"
import { getSessionOrThrow } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSessionOrThrow()
    const accessToken = session.accessToken

    if (!accessToken) {
      return NextResponse.json({ error: "No access token" }, { status: 401 })
    }

    const organizationName = session.user.organization

    if (!organizationName) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 400 },
      )
    }

    const response = await fetch(
      `https://api.github.com/orgs/${organizationName}/repos`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`)
    }

    const repositories = await response.json()

    return NextResponse.json(repositories)
  } catch (error) {
    console.error("Error fetching repositories:", error)
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 },
    )
  }
}
