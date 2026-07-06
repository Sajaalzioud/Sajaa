import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

const settingsSchema = z.object({
  name: z.string().min(1).optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  const parsed = settingsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const settings = await db.clinicSettings.upsert({
    where: { id: "clinic" },
    update: parsed.data,
    create: { id: "clinic", ...parsed.data },
  });
  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "ClinicSettings",
    entityId: "clinic",
  });
  return NextResponse.json(settings);
}
