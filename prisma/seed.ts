import { PrismaClient } from "@prisma/client"
import { addDays, setHours, setMinutes } from "date-fns"

const db = new PrismaClient()

async function main() {
  // Create a user
  // const user = await db.user.create({
  //   data: {
  //     name: "John Doe",
  //     email: "john@example.com",
  //     role: "USER",
  //   },
  // })

  const user = {
    id: "clzzlmbuf0000dzsugloud46v",
    name: "John Doe",
    email: "john@example.com",
    role: "USER",
  }

  // Create an organization
  // const organization = await db.organization.create({
  //   data: {
  //     name: "Acme Inc.",
  //   },
  // })

  // Update user with organization
  // await db.user.update({
  //   where: { id: user.id },
  //   data: { organizationId: organization.id },
  // })

  // Generate activities for the past 5 days
  const today = new Date()
  for (let i = 4; i >= 0; i--) {
    const currentDate = addDays(today, -i)

    // Morning session
    await createTimeEntry(user.id, currentDate, 9, 12)

    // Lunch break (1 hour)
    // await createTimeEntry(user.id, currentDate, 12, 13)

    // Afternoon session
    await createTimeEntry(user.id, currentDate, 13, 17)

    // Generate some commits for each time entry
    // await generateCommits(user.id, currentDate)
  }

  console.log("Seed data created successfully")
}

async function createTimeEntry(
  userId: string,
  date: Date,
  startHour: number,
  endHour: number,
) {
  const timeIn = setHours(setMinutes(date, 0), startHour)
  const timeOut = setHours(setMinutes(date, 0), endHour)

  await db.timeEntry.create({
    data: {
      userId,
      timeIn,
      timeOut,
    },
  })
}

// async function generateCommits(userId: string, date: Date) {
//   const timeEntry = await db.timeEntry.findFirst({
//     where: {
//       userId,
//       timeIn: {
//         gte: setHours(date, 0),
//         lt: addDays(setHours(date, 0), 1),
//       },
//     },
//     orderBy: {
//       timeIn: "desc",
//     },
//   })

//   if (timeEntry) {
//     const commitCount = Math.floor(Math.random() * 5) + 1 // 1 to 5 commits per time entry

//     for (let i = 0; i < commitCount; i++) {
//       const commitTime = new Date(
//         timeEntry.timeIn.getTime() +
//           Math.random() *
//             (timeEntry.timeOut.getTime() - timeEntry.timeIn.getTime()),
//       )

//       await db.commit.create({
//         data: {
//           userId,
//           timeEntryId: timeEntry.id,
//           commitHash: `hash_${Math.random().toString(36).substring(7)}`,
//           message: `Commit message ${i + 1}`,
//           branch: "main",
//           repo: "example-repo",
//           linesAdded: Math.floor(Math.random() * 100),
//           linesRemoved: Math.floor(Math.random() * 50),
//           createdAt: commitTime,
//         },
//       })
//     }
//   }
// }

main()
  .then(async () => {
    console.log("Seed data created successfully")
    await db.$disconnect()
    process.exit(0)
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
    process.exit(0)
  })
