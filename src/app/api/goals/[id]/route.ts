import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

const updateSchema = z.object({
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "ACHIEVED", "MODIFIED", "DISCONTINUED"])
    .optional(),
  description: z.string().min(1).optional(),
  baseline: z.string().optional(),
  targetCriteria: z.string().optional(),
  targetDate: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const { targetDate, ...data } = parsed.data;
  const goal = await db.goal.update({
    where: { id },
    data: {
      ...data,
      ...(targetDate !== undefined
        ? { targetDate: targetDate ? new Date(targetDate) : null }
        : {}),
      // achieving a goal snaps progress to 100
      ...(parsed.data.status === "ACHIEVED" ? { progress: 100 } : {}),
    },
  });
  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Goal",
    entityId: id,
  });
  return NextResponse.json(goal);
}
