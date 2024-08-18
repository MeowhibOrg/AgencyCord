import { NextResponse } from "next/server"
import { getSessionOrThrow } from "@/lib/auth"
import { db } from "@/lib/db"

interface TimeEntry {
  timeIn: Date
  timeOut: Date
  commits: {
    createdAt: Date
    message: string
    repo: string
    commitHash: string
    linesAdded: number
    linesRemoved: number
  }[]
}

interface DayData {
  day: string
  activities: { start: string; end: string }[]
  commits: {
    time: string
    message: string
    url: string
    linesAdded: number
    linesRemoved: number
  }[]
}

export async function GET() {
  try {
    const session = await getSessionOrThrow()
    const userId = session.user.id

    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

    const timeEntries: TimeEntry[] = await db.timeEntry.findMany({
      where: {
        user: { id: userId },
        timeIn: { gte: fiveDaysAgo },
      },
      include: {
        commits: true,
      },
      orderBy: { timeIn: "asc" },
    })

    const dayData = timeEntries.reduce<DayData[]>((acc, entry) => {
      const day = entry.timeIn.toISOString().split("T")[0] // Use ISO format date string
      const existingDay = acc.find(d => d.day === day)

      const activity = {
        start: entry.timeIn.toISOString(), // Convert to ISO string
        end: entry.timeOut.toISOString(), // Convert to ISO string
      }

      const commits = entry.commits.map(commit => ({
        time: commit.createdAt.toISOString(), // Convert to ISO string
        message: commit.message,
        url: `https://github.com/${commit.repo}/commit/${commit.commitHash}`,
        linesAdded: commit.linesAdded,
        linesRemoved: commit.linesRemoved,
      }))

      if (existingDay) {
        existingDay.activities.push(activity)
        existingDay.commits.push(...commits)
      } else {
        acc.push({ day, activities: [activity], commits })
      }

      return acc
    }, [])

    return NextResponse.json(dayData)
  } catch (error) {
    console.error("Error fetching activity data:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity data" },
      { status: 500 },
    )
  }
}
