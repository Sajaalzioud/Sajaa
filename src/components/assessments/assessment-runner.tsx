"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2Icon, RotateCcwIcon } from "lucide-react";
import type {
  AssessmentItem,
  ComputedScores,
  Responses,
  TemplateSchema,
} from "@/lib/assessment/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AutosaveIndicator, useAutosave } from "@/components/autosave";

function ItemInput({
  item,
  value,
  onChange,
}: {
  item: AssessmentItem;
  value: string | number | boolean | null | undefined;
  onChange: (v: string | number | boolean | null) => void;
}) {
  if (item.type === "scale" || item.type === "choice") {
    return (
      <div className="flex flex-wrap gap-1.5">
        {(item.options ?? []).map((opt) => {
          const selected = String(value) === String(opt.value);
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(selected ? null : opt.value)}
              className={
                "rounded-md border px-3 py-1.5 text-sm transition-colors cursor-pointer " +
                (selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-accent")
              }
            >
              {opt.label}
              {item.type === "scale" && (
                <span className="ml-1 opacity-60">({opt.value})</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
  if (item.type === "number") {
    return (
      <Input
        type="number"
        className="w-32"
        min={0}
        max={item.maxScore}
        value={value === null || value === undefined ? "" : String(value)}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        placeholder={item.maxScore ? `0–${item.maxScore}` : "0"}
      />
    );
  }
  if (item.type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={value === true || value === "true"}
          onCheckedChange={(v) => onChange(v)}
        />
        {value === true || value === "true" ? "Yes" : "No"}
      </label>
    );
  }
  return (
    <Textarea
      rows={2}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Observations…"
    />
  );
}

export function AssessmentRunner({
  assessmentId,
  templateName,
  patientName,
  schema,
  status,
  initialResponses,
  initialNotes,
  scores,
  interpretation,
}: {
  assessmentId: string;
  templateName: string;
  patientName: string;
  schema: TemplateSchema;
  status: "IN_PROGRESS" | "COMPLETED";
  initialResponses: Responses;
  initialNotes: string;
  scores: ComputedScores | null;
  interpretation: string | null;
}) {
  const router = useRouter();
  const [responses, setResponses] = React.useState<Responses>(initialResponses);
  const [notes, setNotes] = React.useState(initialNotes);
  const [interp, setInterp] = React.useState(interpretation ?? "");
  const [completing, setCompleting] = React.useState(false);
  const completed = status === "COMPLETED";

  const saveState = useAutosave(
    { responses, notes, interpretation: interp },
    async (data) => {
      await fetch(`/api/assessments/${assessmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          completed ? { interpretation: data.interpretation, notes: data.notes } : data,
        ),
      });
    },
  );

  const allItems = schema.sections.flatMap((s) => s.items);
  const answered = allItems.filter(
    (i) => responses[i.id] !== undefined && responses[i.id] !== null && responses[i.id] !== "",
  ).length;

  async function complete() {
    setCompleting(true);
    const res = await fetch(`/api/assessments/${assessmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses, notes, action: "complete" }),
    });
    setCompleting(false);
    if (!res.ok) return void toast.error("Could not complete assessment");
    toast.success("Assessment scored");
    router.refresh();
  }

  async function reopen() {
    await fetch(`/api/assessments/${assessmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reopen" }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card sticky top-14 z-20 -mx-4 flex items-center gap-3 border-b px-4 py-2 md:mx-0 md:rounded-lg md:border">
        <Progress value={(answered / Math.max(allItems.length, 1)) * 100} className="max-w-48" />
        <span className="text-muted-foreground text-xs">
          {answered}/{allItems.length} items
        </span>
        <div className="ml-auto flex items-center gap-3">
          <AutosaveIndicator state={saveState} />
          {completed ? (
            <Button variant="outline" size="sm" onClick={reopen}>
              <RotateCcwIcon /> Reopen
            </Button>
          ) : (
            <Button size="sm" onClick={complete} disabled={completing}>
              <CheckCircle2Icon />
              {completing ? "Scoring…" : "Complete & Score"}
            </Button>
          )}
        </div>
      </div>

      {completed && scores && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {patientName} · {templateName}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-3xl font-semibold tabular-nums">
                {scores.total}
                <span className="text-muted-foreground text-lg">
                  /{scores.totalMax}
                </span>
              </div>
              <Badge variant="secondary" className="text-sm">
                {scores.percent}%
              </Badge>
              {scores.band && (
                <Badge className="text-sm">{scores.band.label}</Badge>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {scores.sections
                .filter((s) => s.max > 0)
                .map((s) => (
                  <div key={s.id} className="rounded-lg border px-3 py-2">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{s.title}</span>
                      <span className="font-medium tabular-nums">
                        {s.score}/{s.max}
                      </span>
                    </div>
                    <Progress value={(s.score / Math.max(s.max, 1)) * 100} />
                  </div>
                ))}
            </div>
            <div>
              <Label className="mb-1.5">
                Interpretation (auto-generated — edit as needed)
              </Label>
              <Textarea
                rows={4}
                value={interp}
                onChange={(e) => setInterp(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {schema.sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
            {section.description && (
              <CardDescription>{section.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {section.items.map((item) => (
              <div key={item.id}>
                <div className="mb-2 text-sm font-medium">{item.label}</div>
                {item.help && (
                  <p className="text-muted-foreground mb-2 text-xs">{item.help}</p>
                )}
                <ItemInput
                  item={item}
                  value={responses[item.id]}
                  onChange={(v) =>
                    setResponses((r) => ({ ...r, [item.id]: v }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Therapist Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Testing conditions, informant, behavioral observations…"
          />
        </CardContent>
      </Card>
    </div>
  );
}
