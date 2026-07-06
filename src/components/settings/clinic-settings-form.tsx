"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ClinicSettingsInput {
  name: string;
  brandColor: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export function ClinicSettingsForm({ initial }: { initial: ClinicSettingsInput }) {
  const router = useRouter();
  const [values, setValues] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);

  function set<K extends keyof ClinicSettingsInput>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (!res.ok) return void toast.error("Could not save settings");
    toast.success("Clinic settings saved");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic</CardTitle>
        <CardDescription>
          Branding used across the app and on every generated PDF.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5">Clinic name</Label>
          <Input value={values.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5">Brand color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={values.brandColor}
              onChange={(e) => set("brandColor", e.target.value)}
              className="size-9 cursor-pointer rounded-md border"
              aria-label="Brand color"
            />
            <Input
              value={values.brandColor}
              onChange={(e) => set("brandColor", e.target.value)}
              className="w-28 font-mono"
            />
          </div>
        </div>
        <div>
          <Label className="mb-1.5">Phone</Label>
          <Input value={values.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5">Email</Label>
          <Input value={values.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5">Website</Label>
          <Input value={values.website} onChange={(e) => set("website", e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5">Address</Label>
          <Input value={values.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
