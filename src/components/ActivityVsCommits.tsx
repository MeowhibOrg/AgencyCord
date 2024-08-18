"use client"

import React, { useEffect, useState } from "react"
import { GitCommit } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Activity = {
  start: Date
  end: Date
}

type Commit = {
  sha: string
  commit: {
    message: string
    author: {
      date: string
    }
  }
  html_url: string
  author: {
    avatar_url: string
    login: string
  }
}

type DayData = {
  day: string
  activities: Activity[]
  commits: Commit[]
}

const fetchData = async ({
  username,
}: {
  username: string
}): Promise<DayData[]> => {
  const activityResponse = await fetch("/api/activity")
  const commitsResponse = await fetch(`/api/users/${username}/commits`)

  if (!activityResponse.ok || !commitsResponse.ok) {
    throw new Error("Failed to fetch activity or commit data")
  }

  const activityData = await activityResponse.json()
  const commitsData = await commitsResponse.json()

  if (!Array.isArray(activityData) || activityData.length === 0) {
    console.error("Activity data is empty or not an array")
  }
  if (!Array.isArray(commitsData) || commitsData.length === 0) {
    console.error("Commits data is empty or not an array")
  }

  return activityData.map((day: DayData) => {
    const dayDate = new Date(day.day)
    const dayCommits = commitsData.filter((commit: Commit) => {
      const commitDate = new Date(commit.commit?.author?.date || 0)
      console.log("Commit date:", commitDate)
      console.log("Day date:", dayDate)
      return commitDate.toDateString() === dayDate.toDateString()
    })

    return {
      ...day,
      activities: day.activities.map(activity => ({
        start: new Date(activity.start),
        end: new Date(activity.end),
      })),
      commits: [
        ...day.commits,
        ...dayCommits.map((commit: Commit) => ({
          ...commit,
          time: new Date(commit.commit.author.date),
        })),
      ],
    }
  })
}

export default function ActivityVsCommits({ username }: { username: string }) {
  const [data, setData] = useState<DayData[]>([])
  const [hoveredTime, setHoveredTime] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<{ start: number; end: number }>({
    start: 8,
    end: 20,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    fetchData({ username })
      .then(fetchedData => {
        setData(fetchedData)
      })
      .catch(err => {
        console.error("Error fetching data:", err)
        setError("Failed to fetch data. Please try again.")
      })
      .finally(() => setIsLoading(false))
  }, [username])

  useEffect(() => {
    if (data.length > 0) {
      console.log("Data with commits:", data)
    }
  }, [data])

  useEffect(() => {
    if (data.length > 0) {
      const allTimes = data.flatMap(day =>
        day.activities.flatMap(act => [
          act.start.getHours(),
          act.end.getHours(),
        ]),
      )
      const minTime = Math.max(0, Math.min(...allTimes) - 1)
      const maxTime = Math.min(24, Math.max(...allTimes) + 1)
      setTimeRange({ start: minTime, end: maxTime })
    }
  }, [data])

  const hoursInDay = timeRange.end - timeRange.start
  const hourWidth = 100 / hoursInDay

  const formatTime = (hour: number) => {
    return `${hour % 12 || 12}${hour < 12 ? "AM" : "PM"}`
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (data.length === 0) {
    return <div>No data available</div>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Engineer Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Timeline */}
          <div className="flex items-center border-b pb-2">
            <div className="w-20"></div>
            {[...Array(hoursInDay)].map((_, i) => (
              <div key={i} className="grow text-center text-xs">
                {formatTime(i + timeRange.start)}
              </div>
            ))}
          </div>

          {/* Combined Activity and Commits */}
          {data.map((day, index) => (
            <div key={index} className="flex items-center">
              <div className="w-20 font-medium">{day.day}</div>
              <div className="relative h-10 grow bg-gray-100">
                {day.activities.map((activity, actIndex) => (
                  <TooltipProvider key={actIndex}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute h-full bg-blue-200 transition-colors hover:bg-blue-300"
                          style={{
                            left: `${(activity.start.getHours() - timeRange.start) * hourWidth}%`,
                            width: `${(activity.end.getHours() - activity.start.getHours()) * hourWidth}%`,
                          }}
                          onMouseEnter={() =>
                            setHoveredTime(
                              `${formatTime(activity.start.getHours())} - ${formatTime(activity.end.getHours())}`,
                            )
                          }
                          onMouseLeave={() => setHoveredTime(null)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Active: {formatTime(activity.start.getHours())} -{" "}
                          {formatTime(activity.end.getHours())}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {day.commits.map((commit, commitIndex) => (
                  <TooltipProvider key={commitIndex}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={commit.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-green-500 transition-colors hover:bg-green-600"
                          style={{
                            left: `${
                              (new Date(commit.commit.author.date).getHours() -
                                timeRange.start +
                                new Date(
                                  commit.commit.author.date,
                                ).getMinutes() /
                                  60) *
                              hourWidth
                            }%`,
                          }}
                        >
                          <GitCommit size={12} color="white" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{commit.commit.message}</p>
                        <p className="text-xs text-gray-500">
                          {formatTime(
                            new Date(
                              commit.commit?.author?.date || 0,
                            ).getHours(),
                          )}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Avatar className="size-4">
                            <AvatarImage
                              src={commit.author?.avatar_url}
                              alt={commit.author?.login}
                            />
                            <AvatarFallback>
                              {commit.author?.login
                                ?.slice(0, 2)
                                .toUpperCase() || "NA"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">
                            {commit.author?.login || "Unknown"}
                          </span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 h-6 text-sm text-gray-600" aria-hidden="true">
          <span className="invisible">
            {hoveredTime || "Hovered Time Range: "}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
