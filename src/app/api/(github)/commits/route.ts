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
          per_page: 10, // Limit to 10 most recent commits per repo
        })
        return Promise.all(commits.map(async commit => {
          const { data: commitData } = await octokit.repos.getCommit({
            owner: organizationName,
            repo: repo.name,
            ref: commit.sha,
          })
          return {
            ...commit,
            repository: repo.name,
            linesAdded: commitData.stats?.additions || 0,
            linesRemoved: commitData.stats?.deletions || 0,
            linesChanged: commitData.stats?.total || 0,
          }
        }))
      }),
    )

    // Flatten the array of arrays and sort by date
    const flattenedCommits = allCommits.flat().sort((a, b) => 
      (new Date(b.commit.author?.date ?? 0).getTime() - new Date(a.commit.author?.date ?? 0).getTime())
    )

    // Return only the 50 most recent commits
    return NextResponse.json(flattenedCommits.slice(0, 50))
  } catch (error) {
    console.error("Error fetching commits:", error)
    return NextResponse.json(
      { error: "Failed to fetch commits" },
      { status: 500 },
    )
  }
}