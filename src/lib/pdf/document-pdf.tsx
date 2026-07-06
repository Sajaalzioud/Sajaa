import {
  Document as PdfDocument,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import type { DocDefinition } from "@/lib/documents/definitions";

/**
 * Professional clinical PDF layout: clinic-branded header, patient
 * information grid, one block per document section, therapist signature
 * block and numbered footer on every page.
 */

export interface PdfInput {
  clinic: {
    name: string;
    brandColor: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  definition: DocDefinition;
  title: string;
  sessionDate: Date;
  content: Record<string, string>;
  patient: {
    name: string;
    mrn: string;
    dob: Date;
    age: string;
    diagnoses: string[];
    physician?: string | null;
  };
  therapist: { name: string; title?: string | null; licenseNumber?: string | null };
  signedAt?: Date | null;
  signedBy?: string | null;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
    lineHeight: 1.5,
  },
  headerBar: { height: 6, position: "absolute", top: 0, left: 0, right: 0 },
  clinicName: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  clinicMeta: { fontSize: 8, color: "#6b7280", marginTop: 2 },
  docTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 18 },
  docMeta: { fontSize: 9, color: "#6b7280", marginTop: 2, marginBottom: 12 },
  infoBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  infoItem: { width: "33%", marginBottom: 4 },
  infoLabel: { fontSize: 7, color: "#6b7280", textTransform: "uppercase" },
  infoValue: { fontSize: 9.5 },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionBody: { marginBottom: 12 },
  empty: { color: "#9ca3af", fontStyle: "italic" },
  signature: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9ca3af",
  },
});

export function DocumentPdf({ input }: { input: PdfInput }) {
  const { clinic, definition, patient, therapist } = input;
  return (
    <PdfDocument
      title={input.title}
      author={therapist.name}
      creator={clinic.name}
    >
      <Page size="A4" style={styles.page}>
        <View style={[styles.headerBar, { backgroundColor: clinic.brandColor }]} fixed />

        <View>
          <Text style={[styles.clinicName, { color: clinic.brandColor }]}>
            {clinic.name}
          </Text>
          <Text style={styles.clinicMeta}>
            {[clinic.address, clinic.phone, clinic.email]
              .filter(Boolean)
              .join("  ·  ")}
          </Text>
        </View>

        <Text style={styles.docTitle}>{input.title}</Text>
        <Text style={styles.docMeta}>
          {definition.label} · Session date:{" "}
          {format(input.sessionDate, "MMMM d, yyyy")} · Generated:{" "}
          {format(new Date(), "MMMM d, yyyy")}
        </Text>

        <View style={styles.infoBox}>
          {(
            [
              ["Patient", patient.name],
              ["MRN", patient.mrn],
              ["Date of birth", format(patient.dob, "MMM d, yyyy")],
              ["Age", patient.age],
              ["Diagnoses", patient.diagnoses.join(", ") || "—"],
              ["Physician", patient.physician ?? "—"],
            ] as const
          ).map(([label, value]) => (
            <View key={label} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        {definition.sections.map((section) => (
          <View key={section.id} style={styles.sectionBody} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {input.content[section.id]?.trim() ? (
              <Text>{input.content[section.id]}</Text>
            ) : (
              <Text style={styles.empty}>Not documented.</Text>
            )}
          </View>
        ))}

        <View style={styles.signature} wrap={false}>
          <View>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>{therapist.name}</Text>
            <Text style={{ color: "#6b7280", fontSize: 8.5 }}>
              {[therapist.title, therapist.licenseNumber && `License ${therapist.licenseNumber}`]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
          <View>
            {input.signedAt ? (
              <>
                <Text style={{ fontFamily: "Helvetica-Bold", color: "#15803d" }}>
                  Electronically signed
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 8.5 }}>
                  {input.signedBy} · {format(input.signedAt, "MMM d, yyyy h:mm a")}
                </Text>
              </>
            ) : (
              <Text style={{ color: "#b45309" }}>DRAFT — not signed</Text>
            )}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>
            {clinic.name} · Confidential health information
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </PdfDocument>
  );
}
