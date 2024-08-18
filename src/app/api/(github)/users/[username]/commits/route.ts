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

    const { data: repos } = await octokit.repos.listForOrg({
      org: organizationName,
      type: "all",
      per_page: 100,
    })

    const allCommits = await Promise.all(
      repos.map(async repo => {
        const { data: commits } = await octokit.repos.listCommits({
          owner: organizationName,
          repo: repo.name,
          author: params.username,
          per_page: 10,
        })
        return Promise.all(
          commits.map(async commit => {
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
          }),
        )
      }),
    )

    const flattenedCommits = allCommits
      .flat()
      .sort(
        (a, b) =>
          new Date(b.commit.author?.date ?? 0).getTime() -
          new Date(a.commit.author?.date ?? 0).getTime(),
      )

    return NextResponse.json(flattenedCommits.slice(0, 50))
  } catch (error) {
    console.error("Error fetching user commits:", error)
    return NextResponse.json(
      { error: "Failed to fetch user commits" },
      { status: 500 },
    )
  }
}
