import { z } from "zod";

export const contactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  phone: z.string().optional().or(z.literal("")),
  altPhone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  isPrimary: z.boolean(),
  isEmergency: z.boolean(),
});

export const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE"]),
  nationality: z.string().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "WAITLIST", "INACTIVE", "DISCHARGED"]),
  school: z.string().optional().or(z.literal("")),
  grade: z.string().optional().or(z.literal("")),
  diagnoses: z.array(z.string()),
  referralSource: z.string().optional().or(z.literal("")),
  physician: z.string().optional().or(z.literal("")),
  insuranceProvider: z.string().optional().or(z.literal("")),
  insuranceNumber: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  medications: z.string().optional().or(z.literal("")),
  medicalHistory: z.string().optional().or(z.literal("")),
  developmentalHistory: z.string().optional().or(z.literal("")),
  birthHistory: z.string().optional().or(z.literal("")),
  familyHistory: z.string().optional().or(z.literal("")),
  previousTherapies: z.string().optional().or(z.literal("")),
  contacts: z.array(contactSchema),
});

export type PatientInput = z.infer<typeof patientSchema>;
