import React, { useState } from "react"
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
}

type DayData = {
  day: string
  activities: Activity[]
  commits: Commit[]
}

const data: DayData[] = [
  {
    day: "Mon",
    activities: [
      { start: new Date(2023, 0, 1, 10, 0), end: new Date(2023, 0, 1, 12, 0) },
      { start: new Date(2023, 0, 1, 14, 0), end: new Date(2023, 0, 1, 17, 0) },
    ],
    commits: [
      {
        time: new Date(2023, 0, 1, 11, 0),
        message: "Fix bug in login component",
        url: "https://github.com/org/repo/commit/abc123",
      },
      {
        time: new Date(2023, 0, 1, 15, 0),
        message: "Add new feature",
        url: "https://github.com/org/repo/commit/def456",
      },
    ],
  },
  {
    day: "Tue",
    activities: [
      { start: new Date(2023, 0, 2, 9, 0), end: new Date(2023, 0, 2, 13, 0) },
    ],
    commits: [
      {
        time: new Date(2023, 0, 2, 10, 0),
        message: "Update dependencies",
        url: "https://github.com/org/repo/commit/ghi789",
      },
    ],
  },
  {
    day: "Wed",
    activities: [
      { start: new Date(2023, 0, 3, 11, 0), end: new Date(2023, 0, 3, 13, 0) },
      { start: new Date(2023, 0, 3, 15, 0), end: new Date(2023, 0, 3, 17, 0) },
    ],
    commits: [
      {
        time: new Date(2023, 0, 3, 16, 0),
        message: "Refactor user service",
        url: "https://github.com/org/repo/commit/jkl012",
      },
    ],
  },
]

export default function ActivityVsCommits() {
  const [hoveredTime, setHoveredTime] = useState<string | null>(null)
  const hoursInDay = 12 // Assuming 8am to 8pm workday
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
                {formatTime(i + 8)}
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
                            left: `${(activity.start.getHours() - 8) * hourWidth}%`,
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
                            left: `${(commit.time.getHours() - 8) * hourWidth}%`,
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
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          ))}
        </div>

        {hoveredTime && (
          <div className="mt-4 text-sm text-gray-600">
            Hovered Time Range: {hoveredTime}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
