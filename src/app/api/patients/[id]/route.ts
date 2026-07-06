import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { patientSchema } from "@/lib/validators/patient";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser();
  const body = await req.json();
  const parsed = patientSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { contacts, dob, ...data } = parsed.data;
  const patient = await db.patient.update({
    where: { id },
    data: {
      ...data,
      ...(dob ? { dob: new Date(dob) } : {}),
      ...(contacts
        ? {
            contacts: {
              deleteMany: {},
              create: contacts.map(({ id: _id, ...c }) => c),
            },
          }
        : {}),
    },
  });
  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Patient",
    entityId: id,
  });
  return NextResponse.json(patient);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser();
  await db.patient.delete({ where: { id } });
  await audit({
    userId: user.id,
    action: "DELETE",
    entityType: "Patient",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
