import { NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"
import { getSessionOrThrow } from "@/lib/auth"

export async function GET(request: Request) {
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

    // Get the date from the query parameter
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    console.log("Date equals:", date)

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 },
      )
    }

    // Get all repositories for the organization
    const { data: repos } = await octokit.repos.listForOrg({
      org: organizationName,
      type: "all",
      per_page: 100,
    })

    // Fetch commits for each repository
    const allCommits = await Promise.all(
      repos.map(async repo => {
        const { data: commits } = await octokit.repos.listCommits({
          owner: organizationName,
          repo: repo.name,
          since: `${date}T00:00:00Z`,
          until: `${date}T23:59:59Z`,
        })
        return commits.map(commit => ({
          ...commit,
          repository: repo.name,
        }))
      }),
    )

    // Flatten the array of arrays
    const flattenedCommits = allCommits.flat()

    return NextResponse.json(flattenedCommits)
  } catch (error) {
    console.error("Error fetching commits:", error)
    return NextResponse.json(
      { error: "Failed to fetch commits" },
      { status: 500 },
    )
  }
}
