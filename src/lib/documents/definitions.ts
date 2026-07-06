import type { DocumentType } from "@/generated/prisma/enums";

/**
 * Section layout for every clinical document type. The editor renders one
 * autosaving rich-text area per section; `Document.content` stores a JSON map
 * of section id -> text. `aiHint` steers the AI assistant for that section.
 */

export interface DocSection {
  id: string;
  title: string;
  placeholder: string;
  aiHint?: string;
}

export interface DocDefinition {
  label: string;
  shortLabel?: string;
  description: string;
  sections: DocSection[];
}

const soapSections: DocSection[] = [
  {
    id: "subjective",
    title: "Subjective",
    placeholder:
      "Parent/caregiver report, child's affect on arrival, relevant events since last session…",
  },
  {
    id: "objective",
    title: "Objective",
    placeholder:
      "Measurable observations: activities performed, assistance levels, repetitions, sensory responses…",
  },
  {
    id: "assessment",
    title: "Assessment",
    placeholder:
      "Clinical interpretation: progress toward goals, response to intervention, barriers…",
    aiHint: "clinical reasoning connecting observations to goal progress",
  },
  {
    id: "plan",
    title: "Plan",
    placeholder:
      "Plan for next session, frequency, home program updates, referrals…",
  },
];

const evaluationSections: DocSection[] = [
  {
    id: "background",
    title: "Background & Referral",
    placeholder:
      "Reason for referral, diagnosis, relevant medical/developmental history…",
  },
  {
    id: "observations",
    title: "Clinical Observations",
    placeholder:
      "Behavior, attention, sensory responses, posture, motor skills observed during evaluation…",
  },
  {
    id: "results",
    title: "Assessment Results",
    placeholder:
      "Standardized and non-standardized assessment findings and scores…",
  },
  {
    id: "strengths",
    title: "Strengths",
    placeholder: "Child and family strengths supporting therapy outcomes…",
  },
  {
    id: "concerns",
    title: "Areas of Concern",
    placeholder: "Primary deficits impacting occupational performance…",
  },
  {
    id: "recommendations",
    title: "Recommendations",
    placeholder:
      "Recommended frequency, duration, service model and additional referrals…",
    aiHint: "evidence-based recommendations for pediatric OT services",
  },
];

export const DOC_DEFINITIONS: Record<DocumentType, DocDefinition> = {
  INITIAL_EVALUATION: {
    label: "Initial Evaluation",
    description: "Comprehensive first evaluation establishing baseline.",
    sections: evaluationSections,
  },
  RE_EVALUATION: {
    label: "Re-evaluation",
    description: "Periodic re-assessment comparing against baseline.",
    sections: [
      ...evaluationSections.slice(0, 3),
      {
        id: "comparison",
        title: "Comparison to Previous Results",
        placeholder: "Change since initial evaluation / last re-evaluation…",
      },
      ...evaluationSections.slice(3),
    ],
  },
  SOAP_NOTE: {
    label: "SOAP Note",
    shortLabel: "SOAP",
    description: "Structured session note (Subjective/Objective/Assessment/Plan).",
    sections: soapSections,
  },
  DAILY_NOTE: {
    label: "Daily Note",
    description: "Brief daily treatment record.",
    sections: [
      {
        id: "activities",
        title: "Activities & Interventions",
        placeholder: "Activities completed and interventions used…",
      },
      {
        id: "response",
        title: "Child's Response",
        placeholder: "Engagement, assistance level, notable responses…",
      },
      {
        id: "plan",
        title: "Plan",
        placeholder: "Focus for next visit…",
      },
    ],
  },
  SESSION_NOTE: {
    label: "Session Note",
    description: "Quick structured session workflow note.",
    sections: [
      {
        id: "attendance",
        title: "Attendance",
        placeholder: "Attended / late / accompanied by…",
      },
      {
        id: "activities",
        title: "Activities",
        placeholder: "Therapeutic activities performed…",
      },
      {
        id: "sensory",
        title: "Sensory Strategies",
        placeholder: "Sensory diet items, regulation strategies used…",
      },
      {
        id: "response",
        title: "Child's Response & Progress",
        placeholder: "Response to intervention, progress toward goals…",
      },
      {
        id: "parentFeedback",
        title: "Parent Feedback",
        placeholder: "Caregiver report and questions…",
      },
      {
        id: "homeActivities",
        title: "Home Activities",
        placeholder: "Home program items issued or reviewed…",
        aiHint: "age-appropriate home activity suggestions",
      },
      {
        id: "nextSession",
        title: "Next Session Plan",
        placeholder: "Planned focus for next session…",
      },
    ],
  },
  PROGRESS_REPORT: {
    label: "Progress Report",
    description: "Periodic summary of goal progress.",
    sections: [
      {
        id: "summary",
        title: "Summary of Services",
        placeholder: "Period covered, sessions attended, service model…",
      },
      {
        id: "progress",
        title: "Progress Toward Goals",
        placeholder: "Status of each goal with objective measures…",
        aiHint: "goal-by-goal progress narrative with objective measures",
      },
      {
        id: "barriers",
        title: "Barriers & Modifications",
        placeholder: "Factors affecting progress, plan modifications…",
      },
      {
        id: "recommendations",
        title: "Recommendations",
        placeholder: "Continue / modify / discharge recommendation…",
      },
    ],
  },
  DISCHARGE_REPORT: {
    label: "Discharge Report",
    description: "End-of-care summary and follow-up guidance.",
    sections: [
      {
        id: "summary",
        title: "Course of Treatment",
        placeholder: "Duration, frequency and focus of services provided…",
      },
      {
        id: "outcomes",
        title: "Outcomes",
        placeholder: "Final status of goals, comparison to baseline…",
      },
      {
        id: "reason",
        title: "Reason for Discharge",
        placeholder: "Goals met / plateau / family decision / transition…",
      },
      {
        id: "followUp",
        title: "Follow-up Recommendations",
        placeholder: "Home program, monitoring, re-referral criteria…",
      },
    ],
  },
  SCHOOL_REPORT: {
    label: "School Report",
    description: "Report for teachers and school-based teams.",
    sections: [
      {
        id: "summary",
        title: "Therapy Summary",
        placeholder: "Areas addressed in OT relevant to school participation…",
      },
      {
        id: "classroom",
        title: "Classroom Impact",
        placeholder: "How identified needs present in the classroom…",
      },
      {
        id: "strategies",
        title: "Recommended Strategies",
        placeholder: "Seating, handwriting supports, sensory breaks…",
        aiHint: "classroom accommodations and strategies for teachers",
      },
    ],
  },
  INSURANCE_REPORT: {
    label: "Insurance Report",
    description: "Documentation supporting insurance claims.",
    sections: [
      {
        id: "diagnosis",
        title: "Diagnosis & Medical Necessity",
        placeholder: "Diagnoses, functional deficits, necessity of skilled OT…",
        aiHint: "medical-necessity language for payers",
      },
      {
        id: "services",
        title: "Services Provided",
        placeholder: "CPT-level description of services and dates…",
      },
      {
        id: "progress",
        title: "Progress & Prognosis",
        placeholder: "Objective progress and expected outcomes…",
      },
    ],
  },
  HOME_PROGRAM: {
    label: "Home Program",
    description: "Family-facing activity program.",
    sections: [
      {
        id: "goals",
        title: "Program Goals",
        placeholder: "What this program targets, in parent-friendly language…",
      },
      {
        id: "activities",
        title: "Activities",
        placeholder:
          "Step-by-step activities with frequency and setup instructions…",
        aiHint: "playful, parent-friendly home activities",
      },
      {
        id: "tips",
        title: "Tips for Success",
        placeholder: "Grading up/down, signs to stop, safety notes…",
      },
    ],
  },
  PARENT_EDUCATION: {
    label: "Parent Education",
    description: "Educational handout for caregivers.",
    sections: [
      {
        id: "topic",
        title: "Topic Overview",
        placeholder: "Plain-language explanation of the topic…",
        aiHint: "parent-friendly explanation avoiding jargon",
      },
      {
        id: "strategies",
        title: "Strategies at Home",
        placeholder: "Concrete strategies caregivers can apply…",
      },
    ],
  },
  CONSULTATION_NOTE: {
    label: "Consultation Note",
    description: "Record of consultation with other professionals.",
    sections: [
      {
        id: "participants",
        title: "Participants & Purpose",
        placeholder: "Who was consulted and why…",
      },
      {
        id: "discussion",
        title: "Discussion",
        placeholder: "Key points discussed…",
      },
      {
        id: "actions",
        title: "Agreed Actions",
        placeholder: "Follow-up actions and owners…",
      },
    ],
  },
  REFERRAL_LETTER: {
    label: "Referral Letter",
    description: "Letter referring the child to another provider.",
    sections: [
      {
        id: "reason",
        title: "Reason for Referral",
        placeholder: "Concern prompting referral and findings to date…",
      },
      {
        id: "history",
        title: "Relevant History",
        placeholder: "Summary of relevant medical and therapy history…",
      },
      {
        id: "request",
        title: "Request",
        placeholder: "Specific evaluation or service requested…",
      },
    ],
  },
  MEDICAL_NECESSITY_LETTER: {
    label: "Letter of Medical Necessity",
    description: "Formal justification for services or equipment.",
    sections: [
      {
        id: "background",
        title: "Patient Background",
        placeholder: "Diagnosis, functional status, current services…",
      },
      {
        id: "necessity",
        title: "Statement of Necessity",
        placeholder:
          "Why the requested service/equipment is medically necessary…",
        aiHint: "persuasive medical-necessity justification",
      },
      {
        id: "consequences",
        title: "Consequences Without",
        placeholder: "Expected decline or risk if not approved…",
      },
    ],
  },
};

export const DOC_TYPES = Object.keys(DOC_DEFINITIONS) as DocumentType[];
