import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { patientSchema } from "@/lib/validators/patient";

async function nextMrn(): Promise<string> {
  const last = await db.patient.findFirst({
    orderBy: { mrn: "desc" },
    select: { mrn: true },
  });
  const n = last ? parseInt(last.mrn.replace(/\D/g, ""), 10) + 1 : 1;
  return `SJ-${String(n).padStart(4, "0")}`;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const body = await req.json();
  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { contacts, dob, ...data } = parsed.data;
  const patient = await db.patient.create({
    data: {
      ...data,
      dob: new Date(dob),
      mrn: await nextMrn(),
      primaryTherapistId: user.id,
      contacts: {
        create: contacts.map(({ id: _id, ...c }) => c),
      },
    },
  });
  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "Patient",
    entityId: patient.id,
  });
  return NextResponse.json(patient, { status: 201 });
}
