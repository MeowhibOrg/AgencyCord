import { NextResponse } from "next/server"
import { getSessionOrThrow } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const userId = session.user.id
    const { organizationId } = await request.json()

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { organization: organizationId },
      include: {
        organization: true,
      },
    })

    return NextResponse.json({
      success: true,
      organization: updatedUser.organization,
    })
  } catch (error) {
    console.error("Error updating organization:", error)
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 },
    )
  }
}
