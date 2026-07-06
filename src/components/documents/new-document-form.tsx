"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DOC_DEFINITIONS, DOC_TYPES } from "@/lib/documents/definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NewDocumentForm({
  patients,
  initialPatientId,
  initialType,
}: {
  patients: { id: string; firstName: string; lastName: string; mrn: string }[];
  initialPatientId?: string;
  initialType?: string;
}) {
  const router = useRouter();
  const [patientId, setPatientId] = React.useState(initialPatientId ?? "");
  const [type, setType] = React.useState(
    initialType && DOC_TYPES.includes(initialType as (typeof DOC_TYPES)[number])
      ? initialType
      : "SOAP_NOTE",
  );
  const [title, setTitle] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function create() {
    if (!patientId) return void toast.error("Choose a patient");
    setSaving(true);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, type, title }),
    });
    setSaving(false);
    if (!res.ok) return void toast.error("Could not create document");
    const doc = await res.json();
    router.push(`/documents/${doc.id}`);
  }

  const def = DOC_DEFINITIONS[type as keyof typeof DOC_DEFINITIONS];

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
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
        <div>
          <Label className="mb-1.5">Document type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {DOC_DEFINITIONS[t].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground mt-1.5 text-xs">{def.description}</p>
        </div>
        <div>
          <Label className="mb-1.5">Title (optional)</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={def.label}
          />
        </div>
        <Button onClick={create} disabled={saving} className="self-end">
          {saving ? "Creating…" : "Create & open editor"}
        </Button>
      </CardContent>
    </Card>
  );
}
