"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDays, addWeeks, format, isSameDay, isToday, subWeeks } from "date-fns";
import { toast } from "sonner";
import { ChevronLeftIcon, ChevronRightIcon, RepeatIcon } from "lucide-react";
import { cn, enumLabel, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface CalendarAppointment {
  id: string;
  start: string;
  end: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  room: string | null;
  patientId: string;
  patientName: string;
  therapistName: string;
  recurring: boolean;
}

const STATUS_STYLES: Record<CalendarAppointment["status"], string> = {
  SCHEDULED: "border-l-chart-2 bg-chart-2/10 hover:bg-chart-2/20",
  COMPLETED: "border-l-chart-4 bg-chart-4/10 hover:bg-chart-4/20",
  CANCELLED: "border-l-muted-foreground bg-muted opacity-60",
  NO_SHOW: "border-l-destructive bg-destructive/10",
};

export function WeekCalendar({
  weekStartIso,
  appointments,
}: {
  weekStartIso: string;
  appointments: CalendarAppointment[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekStart = new Date(weekStartIso);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const [selected, setSelected] = React.useState<CalendarAppointment | null>(null);
  const [busy, setBusy] = React.useState(false);

  function goWeek(delta: number) {
    const next = delta > 0 ? addWeeks(weekStart, 1) : subWeeks(weekStart, 1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", format(next, "yyyy-MM-dd"));
    router.replace(`/schedule?${params.toString()}`);
  }

  async function setStatus(status: CalendarAppointment["status"]) {
    if (!selected) return;
    setBusy(true);
    const res = await fetch(`/api/appointments/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    if (!res.ok) return void toast.error("Could not update appointment");
    toast.success(`Marked ${enumLabel(status).toLowerCase()}`);
    setSelected(null);
    router.refresh();
  }

  async function writeNote() {
    if (!selected) return;
    router.push(`/documents/new?patientId=${selected.patientId}&type=SESSION_NOTE`);
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <Button variant="outline" size="icon-sm" onClick={() => goWeek(-1)}>
          <ChevronLeftIcon />
        </Button>
        <Button variant="outline" size="icon-sm" onClick={() => goWeek(1)}>
          <ChevronRightIcon />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("week");
            router.replace(`/schedule?${params.toString()}`);
          }}
        >
          Today
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-7 md:gap-2">
        {days.map((day) => {
          const dayAppts = appointments.filter((a) =>
            isSameDay(new Date(a.start), day),
          );
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "rounded-lg border p-2",
                isToday(day) && "border-primary/50 bg-primary/5",
              )}
            >
              <div className="mb-2 text-center">
                <div className="text-muted-foreground text-[10px] uppercase">
                  {format(day, "EEE")}
                </div>
                <div
                  className={cn(
                    "text-sm font-semibold",
                    isToday(day) && "text-primary",
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {dayAppts.length === 0 && (
                  <div className="text-muted-foreground/50 py-3 text-center text-[10px]">
                    —
                  </div>
                )}
                {dayAppts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className={cn(
                      "cursor-pointer rounded-md border-l-3 px-2 py-1.5 text-left text-[11px] leading-tight transition-colors",
                      STATUS_STYLES[a.status],
                    )}
                  >
                    <div className="flex items-center gap-1 font-medium">
                      {a.patientName}
                      {a.recurring && <RepeatIcon className="size-2.5 opacity-60" />}
                    </div>
                    <div className="text-muted-foreground">
                      {formatTime(a.start)}
                      {a.room ? ` · ${a.room}` : ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.patientName}</DialogTitle>
                <DialogDescription>
                  {format(new Date(selected.start), "EEEE, MMM d")} ·{" "}
                  {formatTime(selected.start)}–{formatTime(selected.end)}
                  {selected.room && ` · ${selected.room}`} · {selected.therapistName}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{enumLabel(selected.status)}</Badge>
                {selected.recurring && (
                  <Badge variant="outline">
                    <RepeatIcon /> Recurring
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={busy} onClick={() => setStatus("COMPLETED")}>
                  Mark completed
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={writeNote}>
                  Write session note
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => setStatus("NO_SHOW")}>
                  No-show
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  disabled={busy}
                  onClick={() => setStatus("CANCELLED")}
                >
                  Cancel appointment
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
