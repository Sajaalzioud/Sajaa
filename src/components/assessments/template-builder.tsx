"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon } from "lucide-react";
import type {
  AssessmentItem,
  AssessmentSection,
  ItemType,
  ScoringConfig,
  TemplateSchema,
} from "@/lib/assessment/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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

const OPTION_PRESETS: Record<string, { value: number; label: string }[]> = {
  "Frequency (0–4)": [
    { value: 0, label: "Never" },
    { value: 1, label: "Rarely" },
    { value: 2, label: "Sometimes" },
    { value: 3, label: "Often" },
    { value: 4, label: "Always" },
  ],
  "Independence (0–4)": [
    { value: 0, label: "Unable" },
    { value: 1, label: "Maximal assistance" },
    { value: 2, label: "Moderate assistance" },
    { value: 3, label: "Minimal assistance" },
    { value: 4, label: "Independent" },
  ],
  "Quality (0–3)": [
    { value: 0, label: "Not observed" },
    { value: 1, label: "Emerging" },
    { value: 2, label: "Inconsistent" },
    { value: 3, label: "Consistent" },
  ],
};

let uid = 0;
const nextId = (prefix: string) => `${prefix}_${Date.now()}_${uid++}`;

interface BuilderProps {
  templateId?: string;
  initial?: {
    name: string;
    abbreviation: string;
    category: string;
    description: string;
    isStandardized: boolean;
    schema: TemplateSchema;
    scoring: ScoringConfig;
  };
}

export function TemplateBuilder({ templateId, initial }: BuilderProps) {
  const router = useRouter();
  const [name, setName] = React.useState(initial?.name ?? "");
  const [abbreviation, setAbbreviation] = React.useState(initial?.abbreviation ?? "");
  const [category, setCategory] = React.useState(initial?.category ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [isStandardized, setIsStandardized] = React.useState(initial?.isStandardized ?? false);
  const [sections, setSections] = React.useState<AssessmentSection[]>(
    initial?.schema.sections ?? [
      { id: nextId("section"), title: "Section 1", items: [] },
    ],
  );
  const [scoring, setScoring] = React.useState<ScoringConfig>(
    initial?.scoring ?? { method: "sum", bandsOn: "percent", bands: [] },
  );
  const [saving, setSaving] = React.useState(false);

  function updateSection(i: number, patch: Partial<AssessmentSection>) {
    setSections((s) => s.map((sec, j) => (j === i ? { ...sec, ...patch } : sec)));
  }
  function updateItem(si: number, ii: number, patch: Partial<AssessmentItem>) {
    setSections((s) =>
      s.map((sec, j) =>
        j === si
          ? {
              ...sec,
              items: sec.items.map((it, k) => (k === ii ? { ...it, ...patch } : it)),
            }
          : sec,
      ),
    );
  }

  async function save() {
    if (!name.trim() || !category.trim()) {
      return void toast.error("Name and category are required");
    }
    setSaving(true);
    const res = await fetch(
      templateId ? `/api/templates/${templateId}` : "/api/templates",
      {
        method: templateId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          abbreviation,
          category,
          description,
          isStandardized,
          schema: { sections },
          scoring,
        }),
      },
    );
    setSaving(false);
    if (!res.ok) return void toast.error("Could not save template");
    toast.success(
      templateId
        ? "Template saved (new version created if already in use)"
        : "Template created",
    );
    router.push("/assessments");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Template details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Visual Perception Screening" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">Abbreviation</Label>
              <Input value={abbreviation} onChange={(e) => setAbbreviation(e.target.value)} placeholder="VPS" />
            </div>
            <div>
              <Label className="mb-1.5">Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Visual Perception" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5">Description</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={isStandardized} onCheckedChange={setIsStandardized} />
            Standardized assessment
          </label>
        </CardContent>
      </Card>

      {sections.map((section, si) => (
        <Card key={section.id}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Input
                className="max-w-sm font-medium"
                value={section.title}
                onChange={(e) => updateSection(si, { title: e.target.value })}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive ml-auto"
                onClick={() => setSections((s) => s.filter((_, j) => j !== si))}
              >
                <Trash2Icon />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {section.items.map((item, ii) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-56 flex-1">
                    <Label className="mb-1.5">Item</Label>
                    <Input
                      value={item.label}
                      onChange={(e) => updateItem(si, ii, { label: e.target.value })}
                      placeholder="What is being observed / asked…"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5">Type</Label>
                    <Select
                      value={item.type}
                      onValueChange={(v) => {
                        const type = v as ItemType;
                        updateItem(si, ii, {
                          type,
                          options:
                            type === "scale"
                              ? (item.options ?? OPTION_PRESETS["Frequency (0–4)"])
                              : type === "choice"
                                ? (item.options ?? [])
                                : undefined,
                          maxScore:
                            type === "number" ? (item.maxScore ?? 10) : type === "boolean" ? 1 : undefined,
                        });
                      }}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scale">Rating scale</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Yes / No</SelectItem>
                        <SelectItem value="choice">Choice</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {item.type === "scale" && (
                    <div>
                      <Label className="mb-1.5">Scale preset</Label>
                      <Select
                        value=""
                        onValueChange={(preset) =>
                          updateItem(si, ii, { options: OPTION_PRESETS[preset] })
                        }
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue placeholder="Apply preset…" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(OPTION_PRESETS).map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {item.type === "number" && (
                    <div>
                      <Label className="mb-1.5">Max score</Label>
                      <Input
                        type="number"
                        className="w-24"
                        value={item.maxScore ?? 10}
                        onChange={(e) => updateItem(si, ii, { maxScore: Number(e.target.value) })}
                      />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    onClick={() =>
                      updateSection(si, { items: section.items.filter((_, k) => k !== ii) })
                    }
                  >
                    <Trash2Icon />
                  </Button>
                </div>
                {item.type === "scale" && item.options && (
                  <p className="text-muted-foreground mt-2 text-xs">
                    {item.options.map((o) => `${o.value}=${o.label}`).join(" · ")}
                  </p>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSection(si, {
                  items: [
                    ...section.items,
                    {
                      id: nextId("item"),
                      label: "",
                      type: "scale",
                      options: OPTION_PRESETS["Frequency (0–4)"],
                    },
                  ],
                })
              }
            >
              <PlusIcon /> Add item
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        onClick={() =>
          setSections((s) => [
            ...s,
            { id: nextId("section"), title: `Section ${s.length + 1}`, items: [] },
          ])
        }
      >
        <PlusIcon /> Add section
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Scoring & interpretation</CardTitle>
          <CardDescription>
            Bands map the result to an automatic interpretation in the report.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <Label className="mb-1.5">Method</Label>
              <Select
                value={scoring.method}
                onValueChange={(v) =>
                  setScoring((s) => ({ ...s, method: v as ScoringConfig["method"] }))
                }
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Sum of items</SelectItem>
                  <SelectItem value="average">Average per section</SelectItem>
                  <SelectItem value="none">No scoring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {scoring.method !== "none" && (
              <div>
                <Label className="mb-1.5">Bands compare against</Label>
                <Select
                  value={scoring.bandsOn ?? "percent"}
                  onValueChange={(v) =>
                    setScoring((s) => ({ ...s, bandsOn: v as "raw" | "percent" }))
                  }
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent of max</SelectItem>
                    <SelectItem value="raw">Raw total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {scoring.method !== "none" && (
            <>
              {scoring.bands.map((band, bi) => (
                <div key={bi} className="flex flex-wrap items-end gap-3 rounded-lg border p-3">
                  <div>
                    <Label className="mb-1.5">Min</Label>
                    <Input
                      type="number"
                      className="w-20"
                      value={band.min}
                      onChange={(e) =>
                        setScoring((s) => ({
                          ...s,
                          bands: s.bands.map((b, j) =>
                            j === bi ? { ...b, min: Number(e.target.value) } : b,
                          ),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5">Max</Label>
                    <Input
                      type="number"
                      className="w-20"
                      value={band.max}
                      onChange={(e) =>
                        setScoring((s) => ({
                          ...s,
                          bands: s.bands.map((b, j) =>
                            j === bi ? { ...b, max: Number(e.target.value) } : b,
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="min-w-40">
                    <Label className="mb-1.5">Label</Label>
                    <Input
                      value={band.label}
                      onChange={(e) =>
                        setScoring((s) => ({
                          ...s,
                          bands: s.bands.map((b, j) =>
                            j === bi ? { ...b, label: e.target.value } : b,
                          ),
                        }))
                      }
                      placeholder="Typical Performance"
                    />
                  </div>
                  <div className="min-w-64 flex-1">
                    <Label className="mb-1.5">Interpretation sentence</Label>
                    <Input
                      value={band.interpretation}
                      onChange={(e) =>
                        setScoring((s) => ({
                          ...s,
                          bands: s.bands.map((b, j) =>
                            j === bi ? { ...b, interpretation: e.target.value } : b,
                          ),
                        }))
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    onClick={() =>
                      setScoring((s) => ({
                        ...s,
                        bands: s.bands.filter((_, j) => j !== bi),
                      }))
                    }
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setScoring((s) => ({
                    ...s,
                    bands: [
                      ...s.bands,
                      { min: 0, max: 100, label: "", interpretation: "" },
                    ],
                  }))
                }
              >
                <PlusIcon /> Add band
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : templateId ? "Save template" : "Create template"}
        </Button>
      </div>
    </div>
  );
}
