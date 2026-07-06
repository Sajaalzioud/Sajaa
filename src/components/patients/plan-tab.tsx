"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { PlusIcon, TrendingUpIcon } from "lucide-react";
import { enumLabel, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
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
import { ProgressLineChart } from "@/components/dashboard/charts";

export interface PlanGoal {
  id: string;
  level: "LONG_TERM" | "SHORT_TERM" | "OBJECTIVE";
  status: string;
  description: string;
  baseline: string | null;
  targetCriteria: string | null;
  targetDate: string | null;
  progress: number;
  parentGoalId: string | null;
  progressUpdates: { date: string; value: number; note: string | null }[];
}

export interface PlanData {
  id: string;
  title: string;
  status: string;
  startDate: string;
  frequencyPerWeek: number;
  sessionMinutes: number;
  focusAreas: string[];
  notes: string | null;
  goals: PlanGoal[];
}

const GOAL_BADGE: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  ACHIEVED: "success",
  IN_PROGRESS: "secondary",
  NOT_STARTED: "warning",
  MODIFIED: "secondary",
  DISCONTINUED: "destructive",
};

function LogProgressDialog({ goal }: { goal: PlanGoal }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(goal.progress);
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/goals/${goal.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, note }),
    });
    setSaving(false);
    if (!res.ok) return void toast.error("Could not log progress");
    toast.success("Progress logged");
    setOpen(false);
    setNote("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TrendingUpIcon /> Log progress
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log goal progress</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5">Progress: {value}%</Label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="accent-primary w-full"
            />
          </div>
          <div>
            <Label className="mb-1.5">Note (optional)</Label>
            <Textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What changed this session…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddGoalDialog({
  planId,
  patientId,
  parentGoals,
}: {
  planId: string;
  patientId: string;
  parentGoals: PlanGoal[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [level, setLevel] = React.useState<PlanGoal["level"]>("SHORT_TERM");
  const [parentGoalId, setParentGoalId] = React.useState<string>("none");
  const [description, setDescription] = React.useState("");
  const [baseline, setBaseline] = React.useState("");
  const [targetCriteria, setTargetCriteria] = React.useState("");
  const [targetDate, setTargetDate] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function save() {
    if (!description.trim()) return void toast.error("Description is required");
    setSaving(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        treatmentPlanId: planId,
        patientId,
        level,
        parentGoalId: parentGoalId === "none" ? null : parentGoalId,
        description,
        baseline,
        targetCriteria,
        targetDate: targetDate || null,
      }),
    });
    setSaving(false);
    if (!res.ok) return void toast.error("Could not create goal");
    toast.success("Goal added");
    setOpen(false);
    setDescription("");
    setBaseline("");
    setTargetCriteria("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon /> Add goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New goal</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">Level</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as PlanGoal["level"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LONG_TERM">Long-term goal</SelectItem>
                  <SelectItem value="SHORT_TERM">Short-term goal</SelectItem>
                  <SelectItem value="OBJECTIVE">Objective</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">Parent goal</Label>
              <Select value={parentGoalId} onValueChange={setParentGoalId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {parentGoals.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.description.slice(0, 60)}…
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-1.5">SMART goal description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Within X weeks, [child] will [skill] with [criteria] in [condition]…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">Baseline</Label>
              <Input value={baseline} onChange={(e) => setBaseline(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5">Target criteria</Label>
              <Input value={targetCriteria} onChange={(e) => setTargetCriteria(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5">Target date</Label>
            <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Add goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreatePlanCard({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [frequency, setFrequency] = React.useState(2);
  const [minutes, setMinutes] = React.useState(45);
  const [saving, setSaving] = React.useState(false);

  async function create() {
    if (!title.trim()) return void toast.error("Plan title is required");
    setSaving(true);
    const res = await fetch("/api/treatment-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        title,
        startDate: format(new Date(), "yyyy-MM-dd"),
        frequencyPerWeek: frequency,
        sessionMinutes: minutes,
      }),
    });
    setSaving(false);
    if (!res.ok) return void toast.error("Could not create plan");
    toast.success("Treatment plan created");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start a treatment plan</CardTitle>
        <CardDescription>
          No active treatment plan. Create one to begin setting goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <Label className="mb-1.5">Plan title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sensory Integration & Fine Motor Program"
          />
        </div>
        <div>
          <Label className="mb-1.5">Sessions / week</Label>
          <Input
            type="number"
            min={1}
            max={14}
            className="w-28"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
          />
        </div>
        <div>
          <Label className="mb-1.5">Minutes</Label>
          <Input
            type="number"
            min={15}
            step={15}
            className="w-24"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
        </div>
        <Button onClick={create} disabled={saving}>
          {saving ? "Creating…" : "Create plan"}
        </Button>
      </CardContent>
    </Card>
  );
}

function GoalCard({ goal, indent }: { goal: PlanGoal; indent: boolean }) {
  const chart = goal.progressUpdates.map((u) => ({
    date: format(new Date(u.date), "MMM d"),
    value: u.value,
  }));
  return (
    <div className={indent ? "ml-6" : ""}>
      <Card className="gap-3">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{enumLabel(goal.level)}</Badge>
            <Badge variant={GOAL_BADGE[goal.status] ?? "secondary"}>
              {enumLabel(goal.status)}
            </Badge>
            {goal.targetDate && (
              <span className="text-muted-foreground text-xs">
                Target: {formatDate(goal.targetDate)}
              </span>
            )}
          </div>
          <CardTitle className="text-sm leading-snug font-medium">
            {goal.description}
          </CardTitle>
          <CardAction>
            <LogProgressDialog goal={goal} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Progress value={goal.progress} className="flex-1" />
            <span className="text-sm font-semibold tabular-nums">
              {goal.progress}%
            </span>
          </div>
          {(goal.baseline || goal.targetCriteria) && (
            <div className="text-muted-foreground mt-2 grid gap-1 text-xs sm:grid-cols-2">
              {goal.baseline && (
                <div>
                  <span className="font-medium">Baseline:</span> {goal.baseline}
                </div>
              )}
              {goal.targetCriteria && (
                <div>
                  <span className="font-medium">Criteria:</span> {goal.targetCriteria}
                </div>
              )}
            </div>
          )}
          {chart.length >= 2 && (
            <div className="mt-3">
              <ProgressLineChart data={chart} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function PlanTab({
  patientId,
  plan,
}: {
  patientId: string;
  plan: PlanData | null;
}) {
  if (!plan) return <CreatePlanCard patientId={patientId} />;

  const ltgs = plan.goals.filter((g) => g.level === "LONG_TERM");
  const orphans = plan.goals.filter(
    (g) => g.level !== "LONG_TERM" && !g.parentGoalId,
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{plan.title}</CardTitle>
          <CardDescription>
            {plan.frequencyPerWeek}x/week · {plan.sessionMinutes} min · started{" "}
            {formatDate(plan.startDate)}
            {plan.focusAreas.length > 0 && ` · ${plan.focusAreas.join(", ")}`}
          </CardDescription>
          <CardAction>
            <AddGoalDialog
              planId={plan.id}
              patientId={patientId}
              parentGoals={ltgs}
            />
          </CardAction>
        </CardHeader>
        {plan.notes && (
          <CardContent className="text-muted-foreground text-sm">
            {plan.notes}
          </CardContent>
        )}
      </Card>

      {plan.goals.length === 0 && (
        <p className="text-muted-foreground py-6 text-center text-sm">
          No goals yet. Add a long-term goal to get started.
        </p>
      )}

      {ltgs.map((ltg) => (
        <div key={ltg.id} className="flex flex-col gap-3">
          <GoalCard goal={ltg} indent={false} />
          {plan.goals
            .filter((g) => g.parentGoalId === ltg.id)
            .map((stg) => (
              <GoalCard key={stg.id} goal={stg} indent />
            ))}
        </div>
      ))}
      {orphans.map((g) => (
        <GoalCard key={g.id} goal={g} indent={false} />
      ))}
    </div>
  );
}
