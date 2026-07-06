"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NewAppointmentDialog({
  patients,
}: {
  patients: { id: string; firstName: string; lastName: string; mrn: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [patientId, setPatientId] = React.useState("");
  const [start, setStart] = React.useState("");
  const [duration, setDuration] = React.useState(45);
  const [room, setRoom] = React.useState("");
  const [repeatWeeks, setRepeatWeeks] = React.useState(1);
  const [saving, setSaving] = React.useState(false);

  async function save() {
    if (!patientId || !start) {
      return void toast.error("Patient and start time are required");
    }
    setSaving(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        start,
        durationMinutes: duration,
        room,
        repeatWeeks,
      }),
    });
    setSaving(false);
    if (!res.ok) return void toast.error("Could not create appointment");
    toast.success(
      repeatWeeks > 1
        ? `Created ${repeatWeeks} weekly appointments`
        : "Appointment created",
    );
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarPlusIcon /> New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New appointment</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a patient…" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} · {p.mrn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">Start</Label>
              <Input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5">Duration (min)</Label>
              <Input
                type="number"
                min={15}
                step={15}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="mb-1.5">Room</Label>
              <Input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Sensory Gym"
              />
            </div>
            <div>
              <Label className="mb-1.5">Repeat weekly ×</Label>
              <Input
                type="number"
                min={1}
                max={52}
                value={repeatWeeks}
                onChange={(e) => setRepeatWeeks(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
