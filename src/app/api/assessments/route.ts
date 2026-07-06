import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

const createSchema = z.object({
  patientId: z.string().min(1),
  templateId: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const assessment = await db.assessment.create({
    data: { ...parsed.data, therapistId: user.id },
  });
  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "Assessment",
    entityId: assessment.id,
  });
  return NextResponse.json(assessment, { status: 201 });
}
