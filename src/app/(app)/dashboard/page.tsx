import Link from "next/link";
import {
  endOfWeek,
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Target,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { enumLabel, formatAge, formatCurrency, formatTime, fullName } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GoalStatusChart,
  RevenueChart,
  SessionsChart,
} from "@/components/dashboard/charts";

export const dynamic = "force-dynamic";

async function getStats() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

  const [
    activePatients,
    weekSessions,
    draftNotes,
    goals,
    todaysAppointments,
    recentDocuments,
    invoices,
  ] = await Promise.all([
    db.patient.count({ where: { status: "ACTIVE" } }),
    db.appointment.count({
      where: { start: { gte: weekStart, lte: weekEnd } },
    }),
    db.document.count({ where: { status: "DRAFT" } }),
    db.goal.groupBy({ by: ["status"], _count: true }),
    db.appointment.findMany({
      where: { start: { gte: startOfDay(now), lte: endOfDay(now) } },
      include: { patient: true, therapist: true },
      orderBy: { start: "asc" },
    }),
    db.document.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { patient: true },
    }),
    db.invoice.findMany({
      where: { issueDate: { gte: subMonths(startOfMonth(now), 5) } },
      include: { payments: true },
    }),
  ]);

  // sessions by week (last 8 weeks)
  const weeks = await Promise.all(
    Array.from({ length: 8 }, (_, i) => 7 - i).map(async (offset) => {
      const ws = startOfWeek(subWeeks(now, offset), { weekStartsOn: 0 });
      const we = endOfWeek(subWeeks(now, offset), { weekStartsOn: 0 });
      const [completed, scheduled] = await Promise.all([
        db.appointment.count({
          where: { start: { gte: ws, lte: we }, status: "COMPLETED" },
        }),
        db.appointment.count({
          where: { start: { gte: ws, lte: we }, status: "SCHEDULED" },
        }),
      ]);
      return { week: format(ws, "MMM d"), completed, scheduled };
    }),
  );

  const revenueByMonth = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    revenueByMonth.set(format(subMonths(now, i), "MMM"), 0);
  }
  for (const inv of invoices) {
    for (const p of inv.payments) {
      const key = format(p.paidAt, "MMM");
      if (revenueByMonth.has(key)) {
        revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + Number(p.amount));
      }
    }
  }

  const outstanding = invoices
    .filter((i) => ["SENT", "OVERDUE", "PARTIALLY_PAID"].includes(i.status))
    .reduce(
      (s, i) =>
        s + Number(i.total) - i.payments.reduce((x, p) => x + Number(p.amount), 0),
      0,
    );

  return {
    activePatients,
    weekSessions,
    draftNotes,
    goalsAchieved: goals.find((g) => g.status === "ACHIEVED")?._count ?? 0,
    goalData: goals.map((g) => ({ name: enumLabel(g.status), value: g._count })),
    todaysAppointments,
    recentDocuments,
    sessionsData: weeks,
    revenueData: Array.from(revenueByMonth, ([month, revenue]) => ({ month, revenue })),
    outstanding,
  };
}

const APPT_BADGE: Record<string, "secondary" | "success" | "destructive" | "warning"> = {
  SCHEDULED: "secondary",
  COMPLETED: "success",
  CANCELLED: "warning",
  NO_SHOW: "destructive",
};

export default async function DashboardPage() {
  const stats = await getStats();
  const statCards = [
    { label: "Active Patients", value: stats.activePatients, icon: Users, href: "/patients" },
    { label: "Sessions This Week", value: stats.weekSessions, icon: CalendarDays, href: "/schedule" },
    { label: "Draft Notes", value: stats.draftNotes, icon: FileText, href: "/documents?status=DRAFT" },
    { label: "Goals Achieved", value: stats.goalsAchieved, icon: Target, href: "/patients" },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Dashboard"
        description={format(new Date(), "EEEE, MMMM d, yyyy")}
      >
        <Button asChild>
          <Link href="/documents/new">
            New Note <ArrowRight className="size-4" />
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4">
                <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <s.icon className="size-5" />
                </span>
                <div>
                  <div className="text-2xl font-semibold tabular-nums">{s.value}</div>
                  <div className="text-muted-foreground text-xs">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>Completed vs scheduled, last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <SessionsChart data={stats.sessionsData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Goal Status</CardTitle>
            <CardDescription>All active treatment plans</CardDescription>
          </CardHeader>
          <CardContent>
            <GoalStatusChart data={stats.goalData} />
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {stats.goalData.map((g) => (
                <span key={g.name} className="text-muted-foreground text-xs">
                  {g.name}: <span className="text-foreground font-medium">{g.value}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Appointments</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/schedule">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {stats.todaysAppointments.length === 0 && (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No appointments today.
              </p>
            )}
            {stats.todaysAppointments.map((a) => (
              <Link
                key={a.id}
                href={`/patients/${a.patientId}`}
                className="hover:bg-accent flex items-center justify-between rounded-md border px-3 py-2 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium">{fullName(a.patient)}</div>
                  <div className="text-muted-foreground text-xs">
                    {formatTime(a.start)} · {a.room ?? "—"} · {formatAge(a.patient.dob)}
                  </div>
                </div>
                <Badge variant={APPT_BADGE[a.status]}>{enumLabel(a.status)}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/documents">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {stats.recentDocuments.map((d) => (
              <Link
                key={d.id}
                href={`/documents/${d.id}`}
                className="hover:bg-accent flex items-center justify-between gap-2 rounded-md border px-3 py-2 transition-colors"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{d.title}</div>
                  <div className="text-muted-foreground text-xs">
                    {fullName(d.patient)} · {enumLabel(d.type)}
                  </div>
                </div>
                <Badge variant={d.status === "DRAFT" ? "warning" : "success"}>
                  {enumLabel(d.status)}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>
              Collected per month · Outstanding: {formatCurrency(stats.outstanding)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={stats.revenueData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
