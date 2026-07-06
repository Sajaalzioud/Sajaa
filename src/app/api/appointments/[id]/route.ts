import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

const patchSchema = z.object({
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  start: z.string().optional(),
  durationMinutes: z.coerce.number().int().min(15).max(240).optional(),
  room: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const existing = await db.appointment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { start, durationMinutes, ...data } = parsed.data;
  const newStart = start ? new Date(start) : existing.start;
  const duration =
    durationMinutes ??
    (existing.end.getTime() - existing.start.getTime()) / 60_000;

  const appointment = await db.appointment.update({
    where: { id },
    data: {
      ...data,
      start: newStart,
      end: new Date(newStart.getTime() + duration * 60_000),
    },
  });
  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Appointment",
    entityId: id,
  });
  return NextResponse.json(appointment);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  await db.appointment.delete({ where: { id } });
  await audit({
    userId: user.id,
    action: "DELETE",
    entityType: "Appointment",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
