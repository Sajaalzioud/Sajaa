"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { patientSchema, type PatientInput } from "@/lib/validators/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5">{label}</Label>
      {children}
      {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
    </div>
  );
}

export function PatientForm({
  patientId,
  defaultValues,
}: {
  patientId?: string;
  defaultValues?: Partial<PatientInput>;
}) {
  const router = useRouter();
  const [diagnosisInput, setDiagnosisInput] = React.useState("");

  const form = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: "MALE",
      status: "ACTIVE",
      diagnoses: [],
      contacts: [
        { name: "", relationship: "Mother", phone: "", email: "", isPrimary: true, isEmergency: true },
      ],
      ...defaultValues,
    },
  });
  const { register, control, handleSubmit, formState, watch, setValue } = form;
  const contacts = useFieldArray({ control, name: "contacts" });
  const diagnoses = watch("diagnoses");

  function addDiagnosis() {
    const v = diagnosisInput.trim();
    if (v && !diagnoses.includes(v)) setValue("diagnoses", [...diagnoses, v]);
    setDiagnosisInput("");
  }

  async function onSubmit(values: PatientInput) {
    const res = await fetch(
      patientId ? `/api/patients/${patientId}` : "/api/patients",
      {
        method: patientId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      },
    );
    if (!res.ok) {
      toast.error("Could not save patient. Please check the form.");
      return;
    }
    const patient = await res.json();
    toast.success(patientId ? "Patient updated" : "Patient created");
    router.push(`/patients/${patient.id ?? patientId}`);
    router.refresh();
  }

  const err = formState.errors;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Demographics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="First name" error={err.firstName?.message}>
            <Input {...register("firstName")} placeholder="Omar" />
          </Field>
          <Field label="Last name" error={err.lastName?.message}>
            <Input {...register("lastName")} placeholder="Khalil" />
          </Field>
          <Field label="Date of birth" error={err.dob?.message}>
            <Input type="date" {...register("dob")} />
          </Field>
          <Field label="Gender">
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Nationality">
            <Input {...register("nationality")} placeholder="Jordanian" />
          </Field>
          <Field label="Status">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="WAITLIST">Waitlist</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="DISCHARGED">Discharged</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="School">
            <Input {...register("school")} />
          </Field>
          <Field label="Grade">
            <Input {...register("grade")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clinical</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Diagnoses" className="sm:col-span-2">
            <div className="flex gap-2">
              <Input
                value={diagnosisInput}
                onChange={(e) => setDiagnosisInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDiagnosis();
                  }
                }}
                placeholder="Add a diagnosis and press Enter"
              />
              <Button type="button" variant="secondary" onClick={addDiagnosis}>
                <PlusIcon /> Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {diagnoses.map((d) => (
                <Badge key={d} variant="secondary" className="gap-1 pr-1">
                  {d}
                  <button
                    type="button"
                    aria-label={`Remove ${d}`}
                    className="hover:text-destructive rounded-full p-0.5"
                    onClick={() =>
                      setValue("diagnoses", diagnoses.filter((x) => x !== d))
                    }
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </Field>
          <Field label="Referral source">
            <Input {...register("referralSource")} />
          </Field>
          <Field label="Physician">
            <Input {...register("physician")} />
          </Field>
          <Field label="Insurance provider">
            <Input {...register("insuranceProvider")} />
          </Field>
          <Field label="Insurance number">
            <Input {...register("insuranceNumber")} />
          </Field>
          <Field label="Allergies">
            <Textarea rows={2} {...register("allergies")} />
          </Field>
          <Field label="Current medications">
            <Textarea rows={2} {...register("medications")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>
            Background information used in evaluations and reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Medical history">
            <Textarea rows={3} {...register("medicalHistory")} />
          </Field>
          <Field label="Developmental history">
            <Textarea rows={3} {...register("developmentalHistory")} />
          </Field>
          <Field label="Birth history">
            <Textarea rows={3} {...register("birthHistory")} />
          </Field>
          <Field label="Family history">
            <Textarea rows={3} {...register("familyHistory")} />
          </Field>
          <Field label="Previous therapies" className="sm:col-span-2">
            <Textarea rows={2} {...register("previousTherapies")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
          <CardDescription>
            Parents, guardians and emergency contacts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {contacts.fields.map((field, i) => (
            <div key={field.id} className="rounded-lg border p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field
                  label="Name"
                  error={err.contacts?.[i]?.name?.message}
                >
                  <Input {...register(`contacts.${i}.name`)} />
                </Field>
                <Field label="Relationship">
                  <Input {...register(`contacts.${i}.relationship`)} />
                </Field>
                <Field label="Phone">
                  <Input {...register(`contacts.${i}.phone`)} />
                </Field>
                <Field label="Email" error={err.contacts?.[i]?.email?.message}>
                  <Input {...register(`contacts.${i}.email`)} />
                </Field>
              </div>
              <div className="mt-3 flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Controller
                    control={control}
                    name={`contacts.${i}.isPrimary`}
                    render={({ field: f }) => (
                      <Switch checked={f.value} onCheckedChange={f.onChange} />
                    )}
                  />
                  Primary contact
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Controller
                    control={control}
                    name={`contacts.${i}.isEmergency`}
                    render={({ field: f }) => (
                      <Switch checked={f.value} onCheckedChange={f.onChange} />
                    )}
                  />
                  Emergency contact
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive ml-auto"
                  onClick={() => contacts.remove(i)}
                >
                  <Trash2Icon /> Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              contacts.append({
                name: "",
                relationship: "",
                phone: "",
                email: "",
                isPrimary: false,
                isEmergency: false,
              })
            }
          >
            <PlusIcon /> Add contact
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting
            ? "Saving…"
            : patientId
              ? "Save changes"
              : "Create patient"}
        </Button>
      </div>
    </form>
  );
}
