import { NextResponse } from "next/server";
import { addWeeks } from "date-fns";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

const createSchema = z.object({
  patientId: z.string().min(1),
  start: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(15).max(240),
  room: z.string().optional(),
  notes: z.string().optional(),
  /** Number of weekly repeats (1 = single appointment). */
  repeatWeeks: z.coerce.number().int().min(1).max(52),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const { patientId, start, durationMinutes, room, notes, repeatWeeks } = parsed.data;
  const startDate = new Date(start);
  const recurrenceId = repeatWeeks > 1 ? crypto.randomUUID() : null;

  const appointments = await db.$transaction(
    Array.from({ length: repeatWeeks }, (_, i) => {
      const s = addWeeks(startDate, i);
      return db.appointment.create({
        data: {
          patientId,
          therapistId: user.id,
          start: s,
          end: new Date(s.getTime() + durationMinutes * 60_000),
          room,
          notes,
          recurrenceId,
          recurrenceRule: recurrenceId
            ? `FREQ=WEEKLY;COUNT=${repeatWeeks}`
            : null,
        },
      });
    }),
  );

  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "Appointment",
    entityId: appointments[0].id,
    meta: { count: appointments.length },
  });
  return NextResponse.json(appointments[0], { status: 201 });
}
