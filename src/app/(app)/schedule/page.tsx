import { addDays, endOfWeek, format, startOfWeek } from "date-fns";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { WeekCalendar } from "@/components/schedule/week-calendar";
import { NewAppointmentDialog } from "@/components/schedule/new-appointment-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const anchor = week ? new Date(week) : new Date();
  const weekStart = startOfWeek(anchor, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 0 });

  const [appointments, patients, waitlist] = await Promise.all([
    db.appointment.findMany({
      where: { start: { gte: weekStart, lte: weekEnd } },
      include: { patient: true, therapist: true },
      orderBy: { start: "asc" },
    }),
    db.patient.findMany({
      where: { status: { in: ["ACTIVE", "WAITLIST"] } },
      orderBy: [{ lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true, mrn: true },
    }),
    db.waitlistEntry.findMany({ orderBy: [{ priority: "desc" }, { createdAt: "asc" }] }),
  ]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Schedule"
        description={`Week of ${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`}
      >
        <NewAppointmentDialog patients={patients} />
      </PageHeader>

      <WeekCalendar
        weekStartIso={weekStart.toISOString()}
        appointments={appointments.map((a) => ({
          id: a.id,
          start: a.start.toISOString(),
          end: a.end.toISOString(),
          status: a.status,
          room: a.room,
          patientId: a.patientId,
          patientName: `${a.patient.firstName} ${a.patient.lastName}`,
          therapistName: a.therapist.name,
          recurring: !!a.recurrenceId,
        }))}
      />

      {waitlist.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Waiting List</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {waitlist.map((w) => (
              <div
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <span className="font-medium">{w.name}</span>
                <span className="text-muted-foreground text-xs">
                  {w.reason} · {w.phone} · added {format(w.createdAt, "MMM d")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-muted-foreground mt-4 text-xs">
        SMS / WhatsApp / email appointment reminders dispatch from this schedule
        once a messaging provider is configured (see docs/ARCHITECTURE.md §
        Notifications). Next week:{" "}
        <a
          className="text-primary hover:underline"
          href={`/schedule?week=${format(addDays(weekEnd, 1), "yyyy-MM-dd")}`}
        >
          browse →
        </a>
      </p>
    </div>
  );
}
