import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { DOC_DEFINITIONS, DOC_TYPES } from "@/lib/documents/definitions";

const createSchema = z.object({
  patientId: z.string().min(1),
  type: z.enum(DOC_TYPES as [string, ...string[]]),
  title: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const type = parsed.data.type as keyof typeof DOC_DEFINITIONS;
  const document = await db.document.create({
    data: {
      patientId: parsed.data.patientId,
      therapistId: user.id,
      type,
      title: parsed.data.title?.trim() || DOC_DEFINITIONS[type].label,
      content: {},
    },
  });
  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "Document",
    entityId: document.id,
  });
  return NextResponse.json(document, { status: 201 });
}
