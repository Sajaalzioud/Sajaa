import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangleIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  FilePlus2Icon,
  FileTextIcon,
  PencilIcon,
  PhoneIcon,
} from "lucide-react";
import { db } from "@/lib/db";
import {
  enumLabel,
  formatAge,
  formatDate,
  formatDateTime,
  fullName,
  initials,
} from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanTab, type PlanData } from "@/components/patients/plan-tab";
import { NewAssessmentDialog } from "@/components/patients/new-assessment-dialog";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, "success" | "warning" | "secondary"> = {
  ACTIVE: "success",
  WAITLIST: "warning",
  INACTIVE: "secondary",
  DISCHARGED: "secondary",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="whitespace-pre-wrap">{value || "—"}</span>
    </div>
  );
}

export default async function PatientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;

  const [patient, templates] = await Promise.all([
    db.patient.findUnique({
      where: { id },
      include: {
        contacts: true,
        primaryTherapist: true,
        assessments: {
          include: { template: true, therapist: true },
          orderBy: { createdAt: "desc" },
        },
        documents: { orderBy: { sessionDate: "desc" }, include: { therapist: true } },
        appointments: { orderBy: { start: "desc" }, include: { therapist: true } },
        treatmentPlans: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            goals: {
              orderBy: { createdAt: "asc" },
              include: { progressUpdates: { orderBy: { date: "asc" } } },
            },
          },
        },
      },
    }),
    db.assessmentTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, category: true },
    }),
  ]);
  if (!patient) notFound();

  const rawPlan = patient.treatmentPlans[0] ?? null;
  const plan: PlanData | null = rawPlan
    ? {
        id: rawPlan.id,
        title: rawPlan.title,
        status: rawPlan.status,
        startDate: rawPlan.startDate.toISOString(),
        frequencyPerWeek: rawPlan.frequencyPerWeek,
        sessionMinutes: rawPlan.sessionMinutes,
        focusAreas: rawPlan.focusAreas,
        notes: rawPlan.notes,
        goals: rawPlan.goals.map((g) => ({
          id: g.id,
          level: g.level,
          status: g.status,
          description: g.description,
          baseline: g.baseline,
          targetCriteria: g.targetCriteria,
          targetDate: g.targetDate?.toISOString() ?? null,
          progress: g.progress,
          parentGoalId: g.parentGoalId,
          progressUpdates: g.progressUpdates.map((u) => ({
            date: u.date.toISOString(),
            value: u.value,
            note: u.note,
          })),
        })),
      }
    : null;

  // Unified visit/document timeline
  const timeline = [
    ...patient.appointments.map((a) => ({
      date: a.start,
      kind: "appointment" as const,
      title: `${enumLabel(a.status)} session with ${a.therapist.name}`,
      detail: a.room ?? undefined,
      href: "/schedule",
    })),
    ...patient.documents.map((d) => ({
      date: d.sessionDate,
      kind: "document" as const,
      title: d.title,
      detail: enumLabel(d.type),
      href: `/documents/${d.id}`,
    })),
    ...patient.assessments.map((a) => ({
      date: a.createdAt,
      kind: "assessment" as const,
      title: a.template.name,
      detail: enumLabel(a.status),
      href: `/assessments/${a.id}`,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const primaryContact =
    patient.contacts.find((c) => c.isPrimary) ?? patient.contacts[0];

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <Avatar className="size-16">
          {patient.photoUrl && <AvatarImage src={patient.photoUrl} />}
          <AvatarFallback className="text-lg">
            {initials(fullName(patient))}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold md:text-2xl">
              {fullName(patient)}
            </h1>
            <Badge variant={STATUS_BADGE[patient.status]}>
              {enumLabel(patient.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {patient.mrn} · {formatAge(patient.dob)} ·{" "}
            {enumLabel(patient.gender)} · DOB {formatDate(patient.dob)}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {patient.diagnoses.map((d) => (
              <Badge key={d} variant="secondary">
                {d}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <NewAssessmentDialog patientId={patient.id} templates={templates} />
          <Button variant="outline" asChild>
            <Link href={`/documents/new?patientId=${patient.id}`}>
              <FilePlus2Icon /> New Document
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/patients/${patient.id}/edit`}>
              <PencilIcon /> Edit
            </Link>
          </Button>
        </div>
      </div>

      {patient.allergies && patient.allergies.toLowerCase() !== "none known" && (
        <div className="border-destructive/30 bg-destructive/5 text-destructive mb-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm">
          <AlertTriangleIcon className="size-4 shrink-0" />
          <span>
            <span className="font-semibold">Allergies:</span> {patient.allergies}
          </span>
        </div>
      )}

      <Tabs defaultValue={tab ?? "overview"}>
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="plan">Treatment Plan</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <InfoRow label="School" value={patient.school} />
                <InfoRow label="Grade" value={patient.grade} />
                <InfoRow label="Nationality" value={patient.nationality} />
                <InfoRow label="Physician" value={patient.physician} />
                <InfoRow label="Referral source" value={patient.referralSource} />
                <InfoRow
                  label="Insurance"
                  value={
                    patient.insuranceProvider
                      ? `${patient.insuranceProvider}${patient.insuranceNumber ? ` · ${patient.insuranceNumber}` : ""}`
                      : null
                  }
                />
                <InfoRow
                  label="Therapist"
                  value={patient.primaryTherapist?.name}
                />
                <InfoRow label="Medications" value={patient.medications} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {patient.contacts.length === 0 && (
                  <p className="text-muted-foreground text-sm">No contacts.</p>
                )}
                {patient.contacts.map((c) => (
                  <div key={c.id} className="rounded-lg border px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{c.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {c.relationship}
                      </span>
                      {c.isPrimary && <Badge variant="secondary">Primary</Badge>}
                      {c.isEmergency && (
                        <Badge variant="destructive">Emergency</Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground mt-1 flex flex-wrap gap-3 text-xs">
                      {c.phone && (
                        <span className="flex items-center gap-1">
                          <PhoneIcon className="size-3" /> {c.phone}
                        </span>
                      )}
                      {c.email && <span>{c.email}</span>}
                    </div>
                  </div>
                ))}
                {primaryContact && <Separator />}
                <div className="text-muted-foreground text-xs">
                  Patient since {formatDate(patient.createdAt)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-4 lg:grid-cols-2">
            {(
              [
                ["Medical History", patient.medicalHistory],
                ["Developmental History", patient.developmentalHistory],
                ["Birth History", patient.birthHistory],
                ["Family History", patient.familyHistory],
                ["Previous Therapies", patient.previousTherapies],
                ["Allergies", patient.allergies],
              ] as const
            ).map(([title, value]) => (
              <Card key={title}>
                <CardHeader>
                  <CardTitle className="text-sm">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm whitespace-pre-wrap">
                  {value || <span className="text-muted-foreground">Not recorded.</span>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plan">
          <PlanTab patientId={patient.id} plan={plan} />
        </TabsContent>

        <TabsContent value="assessments">
          <div className="flex flex-col gap-2">
            {patient.assessments.length === 0 && (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No assessments yet.
              </p>
            )}
            {patient.assessments.map((a) => (
              <Link
                key={a.id}
                href={`/assessments/${a.id}`}
                className="hover:bg-accent flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ClipboardListIcon className="text-primary size-4" />
                  <div>
                    <div className="text-sm font-medium">{a.template.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {a.therapist.name} · {formatDate(a.createdAt)}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={a.status === "COMPLETED" ? "success" : "warning"}
                >
                  {enumLabel(a.status)}
                </Badge>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="flex flex-col gap-2">
            {patient.documents.length === 0 && (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No documents yet.
              </p>
            )}
            {patient.documents.map((d) => (
              <Link
                key={d.id}
                href={`/documents/${d.id}`}
                className="hover:bg-accent flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileTextIcon className="text-primary size-4" />
                  <div>
                    <div className="text-sm font-medium">{d.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {enumLabel(d.type)} · {d.therapist.name} ·{" "}
                      {formatDate(d.sessionDate)}
                    </div>
                  </div>
                </div>
                <Badge variant={d.status === "DRAFT" ? "warning" : "success"}>
                  {enumLabel(d.status)}
                </Badge>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="relative ml-2 flex flex-col gap-0 border-l pl-6">
            {timeline.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="group relative pb-6 last:pb-0"
              >
                <span
                  className={
                    "border-background absolute top-1 -left-[1.85rem] size-3.5 rounded-full border-2 " +
                    (item.kind === "appointment"
                      ? "bg-chart-2"
                      : item.kind === "document"
                        ? "bg-chart-1"
                        : "bg-chart-3")
                  }
                />
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  {item.kind === "appointment" ? (
                    <CalendarDaysIcon className="size-3" />
                  ) : item.kind === "document" ? (
                    <FileTextIcon className="size-3" />
                  ) : (
                    <ClipboardListIcon className="size-3" />
                  )}
                  {formatDateTime(item.date)}
                </div>
                <div className="text-sm font-medium group-hover:underline">
                  {item.title}
                </div>
                {item.detail && (
                  <div className="text-muted-foreground text-xs">{item.detail}</div>
                )}
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
