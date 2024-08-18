"use client"

import React, { useEffect, useState } from "react"
import { GitCommit } from "lucide-react"
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
  time: Date
  message: string
  url: string
  linesAdded: number
  linesRemoved: number
}

type DayData = {
  day: string
  activities: Activity[]
  commits: Commit[]
}

const fetchData = async (): Promise<DayData[]> => {
  const response = await fetch("/api/activity")
  if (!response.ok) {
    throw new Error("Failed to fetch activity data")
  }
  const data = await response.json()
  return data.map((day: DayData) => ({
    ...day,
    activities: day.activities.map(activity => ({
      start: new Date(activity.start),
      end: new Date(activity.end),
    })),
    commits: day.commits.map(commit => ({
      ...commit,
      time: new Date(commit.time),
    })),
  }))
}

export default function ActivityVsCommits() {
  const [data, setData] = useState<DayData[]>([])
  const [hoveredTime, setHoveredTime] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<{ start: number; end: number }>({
    start: 8,
    end: 20,
  })

  useEffect(() => {
    fetchData().then(setData).catch(console.error)
  }, [])

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
                          href={commit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-green-500 transition-colors hover:bg-green-600"
                          style={{
                            left: `${(commit.time.getHours() - timeRange.start) * hourWidth}%`,
                          }}
                        >
                          <GitCommit size={12} color="white" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{commit.message}</p>
                        <p className="text-xs text-gray-500">
                          {formatTime(commit.time.getHours())}
                        </p>
                        <p className="text-xs text-green-500">
                          +{commit.linesAdded}
                        </p>
                        <p className="text-xs text-red-500">
                          -{commit.linesRemoved}
                        </p>
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
