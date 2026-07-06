"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClipboardPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

export function NewAssessmentDialog({
  patientId,
  templates,
}: {
  patientId: string;
  templates: { id: string; name: string; category: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [templateId, setTemplateId] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function start() {
    if (!templateId) return void toast.error("Choose an assessment");
    setSaving(true);
    const res = await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, templateId }),
    });
    setSaving(false);
    if (!res.ok) return void toast.error("Could not start assessment");
    const assessment = await res.json();
    router.push(`/assessments/${assessment.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ClipboardPlusIcon /> New Assessment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start an assessment</DialogTitle>
          <DialogDescription>
            Choose a template from the assessment library.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label className="mb-1.5">Assessment template</Label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} · {t.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={start} disabled={saving}>
            {saving ? "Starting…" : "Start assessment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
