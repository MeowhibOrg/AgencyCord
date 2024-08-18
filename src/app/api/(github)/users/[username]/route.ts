import { NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"
import { getSessionOrThrow } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: { username: string } },
) {
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

    const { data: user } = await octokit.users.getByUsername({
      username: params.username,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 },
    )
  }
}
