import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fullName } from "@/lib/utils";

/** Global instant search across patients, documents, assessments and goals. */
export async function GET(req: Request) {
  await getCurrentUser();
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({
      patients: [],
      documents: [],
      assessments: [],
      goals: [],
    });
  }

  const contains = { contains: q, mode: "insensitive" as const };

  const [patients, documents, assessments, goals] = await Promise.all([
    db.patient.findMany({
      where: {
        OR: [
          { firstName: contains },
          { lastName: contains },
          { mrn: contains },
        ],
      },
      take: 5,
      select: { id: true, firstName: true, lastName: true, mrn: true },
    }),
    db.document.findMany({
      where: { title: contains },
      take: 5,
      include: { patient: { select: { firstName: true, lastName: true } } },
    }),
    db.assessment.findMany({
      where: {
        OR: [
          { template: { name: contains } },
          { interpretation: contains },
        ],
      },
      take: 5,
      include: {
        template: { select: { name: true } },
        patient: { select: { firstName: true, lastName: true } },
      },
    }),
    db.goal.findMany({
      where: { description: contains },
      take: 5,
      include: { patient: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  return NextResponse.json({
    patients: patients.map((p) => ({ id: p.id, name: fullName(p), mrn: p.mrn })),
    documents: documents.map((d) => ({
      id: d.id,
      title: d.title,
      patient: fullName(d.patient),
    })),
    assessments: assessments.map((a) => ({
      id: a.id,
      template: a.template.name,
      patient: fullName(a.patient),
    })),
    goals: goals.map((g) => ({
      id: g.id,
      description:
        g.description.length > 80 ? g.description.slice(0, 80) + "…" : g.description,
      patient: fullName(g.patient),
      planId: g.treatmentPlanId,
      patientId: g.patientId,
    })),
  });
}
