/**
 * Development seed: a small pediatric OT clinic with realistic data so every
 * feature is exercisable immediately. Idempotent — wipes and re-creates.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { addDays, addWeeks, setHours, setMinutes, subDays, subMonths, subWeeks } from "date-fns";
import type { TemplateSchema, ScoringConfig } from "../src/lib/assessment/types";
import { computeScores, buildInterpretation } from "../src/lib/assessment/scoring";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const likert5 = [
  { value: 0, label: "Never" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Always" },
];

const independence = [
  { value: 0, label: "Unable" },
  { value: 1, label: "Maximal assistance" },
  { value: 2, label: "Moderate assistance" },
  { value: 3, label: "Minimal assistance" },
  { value: 4, label: "Independent" },
];

function scaleItems(section: string, labels: string[], options = likert5) {
  return labels.map((label, i) => ({
    id: `${section}_${i + 1}`,
    label,
    type: "scale" as const,
    options,
  }));
}

const sensoryScreeningSchema: TemplateSchema = {
  sections: [
    {
      id: "tactile",
      title: "Tactile Processing",
      items: scaleItems("tactile", [
        "Tolerates messy play (paint, sand, glue) without distress",
        "Tolerates grooming activities (hair brushing, nail trimming)",
        "Accepts a variety of food textures",
        "Tolerates unexpected light touch from peers",
        "Wears a variety of clothing textures without complaint",
      ]),
    },
    {
      id: "vestibular",
      title: "Vestibular Processing",
      items: scaleItems("vestibular", [
        "Enjoys age-appropriate movement (swings, slides) without fear",
        "Maintains balance during dynamic play",
        "Tolerates head position changes (e.g., hair washing)",
        "Moves through space without excessive crashing/seeking",
        "Sits upright at a table without slumping or propping",
      ]),
    },
    {
      id: "auditory",
      title: "Auditory Processing",
      items: scaleItems("auditory", [
        "Tolerates everyday household sounds without distress",
        "Follows verbal directions in noisy environments",
        "Responds when name is called on first attempt",
        "Participates in group settings without covering ears",
      ]),
    },
    {
      id: "regulation",
      title: "Self-Regulation",
      items: scaleItems("regulation", [
        "Transitions between activities without significant distress",
        "Calms within a reasonable time after becoming upset",
        "Maintains an appropriate arousal level during tabletop tasks",
        "Waits for a turn during structured play",
      ]),
    },
  ],
};

const sensoryScoring: ScoringConfig = {
  method: "sum",
  bandsOn: "percent",
  bands: [
    { min: 0, max: 40, label: "Definite Difference", interpretation: "Sensory processing differences are significantly impacting daily participation; skilled OT intervention with a sensory integration frame of reference is indicated." },
    { min: 41, max: 65, label: "Probable Difference", interpretation: "Emerging sensory processing differences are affecting participation in some contexts; targeted intervention and environmental adaptation are recommended." },
    { min: 66, max: 100, label: "Typical Performance", interpretation: "Sensory processing skills are supporting participation in daily occupations at an age-appropriate level." },
  ],
};

const fineMotorSchema: TemplateSchema = {
  sections: [
    {
      id: "grasp",
      title: "Grasp & Manipulation",
      items: [
        ...scaleItems("grasp", [
          "Uses a mature tripod grasp on writing tools",
          "Demonstrates in-hand manipulation (translation, rotation)",
          "Isolates fingers for pointing and counting",
        ]),
        { id: "grasp_blocks", label: "Blocks stacked (max 10)", type: "number" as const, maxScore: 10 },
      ],
    },
    {
      id: "bilateral",
      title: "Bilateral Coordination",
      items: scaleItems("bilateral", [
        "Stabilizes paper with helper hand while writing/drawing",
        "Cuts along a straight line with scissors",
        "Strings beads or completes lacing activities",
        "Performs buttoning with two hands cooperatively",
      ]),
    },
    {
      id: "visualmotor",
      title: "Visual-Motor Integration",
      items: scaleItems("visualmotor", [
        "Copies basic shapes (circle, cross, square) accurately",
        "Completes age-appropriate puzzles",
        "Colors within boundaries",
        "Imitates simple block designs",
      ]),
    },
  ],
};

const fineMotorScoring: ScoringConfig = {
  method: "sum",
  bandsOn: "percent",
  bands: [
    { min: 0, max: 45, label: "Well Below Age Expectations", interpretation: "Fine motor delays are significantly limiting participation in self-care and pre-academic tasks; skilled OT intervention is strongly indicated." },
    { min: 46, max: 70, label: "Below Age Expectations", interpretation: "Fine motor skills are emerging but below age expectations, impacting classroom and self-care participation." },
    { min: 71, max: 100, label: "Age Appropriate", interpretation: "Fine motor development is progressing within age expectations." },
  ],
};

const adlSchema: TemplateSchema = {
  sections: [
    {
      id: "feeding",
      title: "Feeding",
      items: scaleItems("feeding", ["Uses utensils appropriately for age", "Drinks from an open cup without spillage", "Manages food containers and packaging"], independence),
    },
    {
      id: "dressing",
      title: "Dressing",
      items: scaleItems("dressing", ["Puts on/removes pull-over garments", "Manages fasteners (buttons, zippers)", "Puts on shoes (correct feet)", "Manages socks independently"], independence),
    },
    {
      id: "hygiene",
      title: "Grooming & Hygiene",
      items: scaleItems("hygiene", ["Washes and dries hands", "Brushes teeth with supervision appropriate to age", "Manages toileting clothing"], independence),
    },
  ],
};

const adlScoring: ScoringConfig = {
  method: "sum",
  bandsOn: "percent",
  bands: [
    { min: 0, max: 45, label: "High Support Needs", interpretation: "The child requires substantial caregiver assistance across activities of daily living; ADL retraining and caregiver coaching are priority intervention areas." },
    { min: 46, max: 75, label: "Moderate Support Needs", interpretation: "The child participates in daily living skills with assistance; graded independence training is recommended." },
    { min: 76, max: 100, label: "Independent / Emerging Independence", interpretation: "Daily living skills are age-appropriate or emerging with minimal support." },
  ],
};

const clinicalObsSchema: TemplateSchema = {
  sections: [
    {
      id: "posture",
      title: "Posture & Tone",
      items: [
        { id: "posture_tone", label: "Muscle tone impression", type: "choice" as const, options: [ { value: "low", label: "Low" }, { value: "typical", label: "Typical" }, { value: "high", label: "High" }, { value: "fluctuating", label: "Fluctuating" } ] },
        { id: "posture_prone", label: "Prone extension held 20–30s", type: "boolean" as const, maxScore: 1 },
        { id: "posture_supine", label: "Supine flexion held 20–30s", type: "boolean" as const, maxScore: 1 },
        { id: "posture_notes", label: "Postural observations", type: "text" as const },
      ],
    },
    {
      id: "reflexes",
      title: "Primitive Reflex Screening",
      items: [
        { id: "reflex_atnr", label: "ATNR integrated", type: "boolean" as const, maxScore: 1 },
        { id: "reflex_stnr", label: "STNR integrated", type: "boolean" as const, maxScore: 1 },
        { id: "reflex_moro", label: "Moro integrated", type: "boolean" as const, maxScore: 1 },
        { id: "reflex_notes", label: "Reflex observations", type: "text" as const },
      ],
    },
    {
      id: "praxis",
      title: "Praxis & Motor Planning",
      items: [
        ...scaleItems("praxis", ["Imitates body positions", "Sequences 3-step motor actions", "Generates ideas in novel play (ideation)"]),
        { id: "praxis_notes", label: "Praxis observations", type: "text" as const },
      ],
    },
  ],
};

const clinicalObsScoring: ScoringConfig = {
  method: "none",
  bands: [],
};

async function main() {
  console.log("Seeding…");

  // wipe in dependency order
  await db.$transaction([
    db.auditLog.deleteMany(),
    db.payment.deleteMany(),
    db.invoice.deleteMany(),
    db.appointment.deleteMany(),
    db.goalProgress.deleteMany(),
    db.goal.deleteMany(),
    db.treatmentPlan.deleteMany(),
    db.document.deleteMany(),
    db.assessment.deleteMany(),
    db.assessmentTemplate.deleteMany(),
    db.attachment.deleteMany(),
    db.contact.deleteMany(),
    db.waitlistEntry.deleteMany(),
    db.patient.deleteMany(),
    db.clinicSettings.deleteMany(),
    db.user.deleteMany(),
  ]);

  await db.clinicSettings.create({
    data: {
      id: "clinic",
      name: "Sajaa Pediatric Therapy Center",
      brandColor: "#0d9488",
      address: "12 Wellness Street, Amman, Jordan",
      phone: "+962 6 555 0100",
      email: "hello@sajaa.clinic",
      website: "https://sajaa.clinic",
    },
  });

  const sajaa = await db.user.create({
    data: {
      email: "sajaalzioud@gmail.com",
      name: "Sajaa Alzioud",
      role: "THERAPIST",
      title: "Pediatric Occupational Therapist, OTR/L",
      licenseNumber: "OT-2211-JO",
      phone: "+962 79 000 0000",
    },
  });
  const lina = await db.user.create({
    data: {
      email: "lina@sajaa.clinic",
      name: "Lina Haddad",
      role: "THERAPIST",
      title: "Occupational Therapist, MSc SI",
      licenseNumber: "OT-1984-JO",
    },
  });
  await db.user.create({
    data: { email: "admin@sajaa.clinic", name: "Clinic Admin", role: "ADMIN" },
  });

  const templates = await Promise.all([
    db.assessmentTemplate.create({
      data: {
        name: "Sensory Processing Screening",
        abbreviation: "SPS",
        category: "Sensory Integration",
        description: "Caregiver-informed screening of sensory processing across tactile, vestibular, auditory and self-regulation domains.",
        ageMinMonths: 24, ageMaxMonths: 144,
        isStandardized: true,
        schema: sensoryScreeningSchema as object,
        scoring: sensoryScoring as object,
        createdById: sajaa.id,
      },
    }),
    db.assessmentTemplate.create({
      data: {
        name: "Fine Motor Skills Assessment",
        abbreviation: "FMA",
        category: "Fine Motor",
        description: "Structured observation of grasp, bilateral coordination and visual-motor integration.",
        ageMinMonths: 36, ageMaxMonths: 108,
        isStandardized: false,
        schema: fineMotorSchema as object,
        scoring: fineMotorScoring as object,
        createdById: sajaa.id,
      },
    }),
    db.assessmentTemplate.create({
      data: {
        name: "ADL Independence Scale",
        abbreviation: "ADL-IS",
        category: "ADLs",
        description: "Assistance-level rating of feeding, dressing and hygiene performance.",
        ageMinMonths: 30, ageMaxMonths: 144,
        isStandardized: false,
        schema: adlSchema as object,
        scoring: adlScoring as object,
        createdById: lina.id,
      },
    }),
    db.assessmentTemplate.create({
      data: {
        name: "Clinical Observations of Neuromotor Function",
        abbreviation: "CONF",
        category: "Clinical Observations",
        description: "Non-standardized neuromotor observations: tone, primitive reflex integration and praxis.",
        isStandardized: false,
        schema: clinicalObsSchema as object,
        scoring: clinicalObsScoring as object,
        createdById: sajaa.id,
      },
    }),
  ]);
  const [sps, fma, adlis] = templates;

  const patientsData = [
    {
      mrn: "SJ-0001", firstName: "Omar", lastName: "Khalil", dob: new Date("2019-03-14"), gender: "MALE" as const,
      nationality: "Jordanian", school: "Al Manar Kindergarten", grade: "KG2",
      diagnoses: ["Sensory Processing Disorder", "Developmental Coordination Disorder"],
      referralSource: "Dr. Rana Odeh — Developmental Pediatrician", physician: "Dr. Rana Odeh",
      insuranceProvider: "MedGulf", insuranceNumber: "MG-556677",
      allergies: "None known", medications: "None",
      medicalHistory: "Full-term birth. Recurrent otitis media age 1–2, PE tubes placed at 26 months.",
      developmentalHistory: "Sat 8m, walked 16m, first words 20m. Ongoing difficulty with dressing and utensil use.",
      birthHistory: "NSVD at 39 weeks, no complications.",
      familyHistory: "Older brother with ADHD.",
      previousTherapies: "Speech therapy 6 months (discharged).",
      primaryTherapistId: sajaa.id,
      contacts: [
        { name: "Maha Khalil", relationship: "Mother", phone: "+962 79 111 2233", email: "maha.k@example.com", isPrimary: true, isEmergency: true },
        { name: "Yousef Khalil", relationship: "Father", phone: "+962 79 111 2234" },
      ],
    },
    {
      mrn: "SJ-0002", firstName: "Layla", lastName: "Nasser", dob: new Date("2020-11-02"), gender: "FEMALE" as const,
      nationality: "Jordanian", school: "Little Steps Nursery", grade: "KG1",
      diagnoses: ["Autism Spectrum Disorder"],
      referralSource: "Child Development Center", physician: "Dr. Samir Haddad",
      insuranceProvider: "GIG", insuranceNumber: "GIG-889900",
      allergies: "Peanuts (anaphylaxis — EpiPen in bag)", medications: "None",
      medicalHistory: "Diagnosed ASD at 2y10m via ADOS-2.",
      developmentalHistory: "Motor milestones on time; language and social reciprocity delayed.",
      birthHistory: "C-section at 38 weeks.",
      familyHistory: "Non-contributory.",
      previousTherapies: "ABA 12 months, ongoing speech therapy.",
      primaryTherapistId: sajaa.id,
      contacts: [
        { name: "Dana Nasser", relationship: "Mother", phone: "+962 78 222 3344", email: "dana.n@example.com", isPrimary: true, isEmergency: true },
      ],
    },
    {
      mrn: "SJ-0003", firstName: "Karim", lastName: "Abu-Zaid", dob: new Date("2017-06-25"), gender: "MALE" as const,
      nationality: "Palestinian", school: "Amman National School", grade: "Grade 3",
      diagnoses: ["ADHD — combined presentation", "Dysgraphia"],
      referralSource: "School counselor", physician: "Dr. Rana Odeh",
      insuranceProvider: "Self-pay",
      allergies: "None known", medications: "Methylphenidate 10mg AM",
      medicalHistory: "Unremarkable.",
      developmentalHistory: "Milestones on time. Handwriting concerns since Grade 1.",
      birthHistory: "NSVD, 40 weeks.",
      familyHistory: "Father with ADHD.",
      previousTherapies: "None.",
      primaryTherapistId: lina.id,
      contacts: [
        { name: "Rania Abu-Zaid", relationship: "Mother", phone: "+962 77 333 4455", isPrimary: true, isEmergency: true },
      ],
    },
    {
      mrn: "SJ-0004", firstName: "Sara", lastName: "Mansour", dob: new Date("2021-08-19"), gender: "FEMALE" as const,
      nationality: "Jordanian",
      diagnoses: ["Down Syndrome"],
      referralSource: "Dr. Samir Haddad — Pediatric Cardiologist", physician: "Dr. Samir Haddad",
      insuranceProvider: "MedGulf", insuranceNumber: "MG-778899",
      allergies: "None known", medications: "None",
      medicalHistory: "AVSD repaired at 5 months; cardiology follow-up annually. Hypotonia.",
      developmentalHistory: "Sat 11m, walked 26m. Feeding difficulties with textured foods.",
      birthHistory: "38 weeks, NICU 10 days.",
      familyHistory: "Non-contributory.",
      previousTherapies: "Physiotherapy since infancy (ongoing).",
      primaryTherapistId: sajaa.id,
      contacts: [
        { name: "Hala Mansour", relationship: "Mother", phone: "+962 79 444 5566", email: "hala.m@example.com", isPrimary: true, isEmergency: true },
        { name: "Fadi Mansour", relationship: "Father", phone: "+962 79 444 5567", isEmergency: true },
      ],
    },
    {
      mrn: "SJ-0005", firstName: "Adam", lastName: "Qassem", dob: new Date("2018-12-09"), gender: "MALE" as const,
      nationality: "Syrian", school: "Hope International School", grade: "Grade 1",
      diagnoses: ["Cerebral Palsy — spastic hemiplegia (right)"],
      referralSource: "Rehabilitation hospital discharge", physician: "Dr. Nour Barakat",
      insuranceProvider: "UNHCR program",
      allergies: "None known", medications: "Baclofen",
      medicalHistory: "Preterm 31 weeks, PVL on imaging. Botox injections right UE 6 months ago.",
      developmentalHistory: "Right-hand neglect; emerging assist use in bimanual tasks.",
      birthHistory: "Preterm, NICU 6 weeks.",
      familyHistory: "Non-contributory.",
      previousTherapies: "PT and OT at rehabilitation hospital.",
      primaryTherapistId: lina.id,
      contacts: [
        { name: "Amal Qassem", relationship: "Mother", phone: "+962 78 555 6677", isPrimary: true, isEmergency: true },
      ],
    },
    {
      mrn: "SJ-0006", firstName: "Noor", lastName: "Tahboub", dob: new Date("2019-09-30"), gender: "FEMALE" as const,
      nationality: "Jordanian", school: "Green Hills Academy", grade: "KG2",
      diagnoses: ["Developmental Delay — under investigation"],
      referralSource: "Pediatrician well-visit screening", physician: "Dr. Rana Odeh",
      insuranceProvider: "GIG", insuranceNumber: "GIG-112233",
      allergies: "Penicillin (rash)", medications: "None",
      medicalHistory: "Genetics workup pending.",
      developmentalHistory: "Global mild delays; strengths in social engagement.",
      birthHistory: "NSVD 40 weeks.",
      familyHistory: "Maternal cousin with learning disability.",
      previousTherapies: "None.",
      status: "WAITLIST" as const,
      primaryTherapistId: sajaa.id,
      contacts: [
        { name: "Reem Tahboub", relationship: "Mother", phone: "+962 79 666 7788", isPrimary: true, isEmergency: true },
      ],
    },
  ];

  const patients = [];
  for (const p of patientsData) {
    const { contacts, ...data } = p;
    patients.push(
      await db.patient.create({
        data: { ...data, contacts: { create: contacts } },
      }),
    );
  }
  const [omar, layla, karim, sara, adam] = patients;

  // ── Assessments ──────────────────────────────────────────────────────────
  const omarResponses: Record<string, number> = {};
  for (const s of sensoryScreeningSchema.sections)
    for (const [i, item] of s.items.entries())
      omarResponses[item.id] = s.id === "tactile" ? (i % 2) : 2 + (i % 2);
  const omarScores = computeScores(sensoryScreeningSchema, sensoryScoring, omarResponses);
  await db.assessment.create({
    data: {
      patientId: omar.id, templateId: sps.id, therapistId: sajaa.id,
      status: "COMPLETED",
      responses: omarResponses, scores: omarScores as unknown as object,
      interpretation: buildInterpretation(sps.name, "Omar Khalil", omarScores),
      notes: "Completed with mother as informant. Omar present and observed during free play.",
      completedAt: subWeeks(new Date(), 10),
      createdAt: subWeeks(new Date(), 10),
    },
  });

  const karimResponses: Record<string, number> = {};
  for (const s of fineMotorSchema.sections)
    for (const [i, item] of s.items.entries())
      karimResponses[item.id] = item.type === "number" ? 8 : 1 + (i % 2);
  const karimScores = computeScores(fineMotorSchema, fineMotorScoring, karimResponses);
  await db.assessment.create({
    data: {
      patientId: karim.id, templateId: fma.id, therapistId: lina.id,
      status: "COMPLETED",
      responses: karimResponses, scores: karimScores as unknown as object,
      interpretation: buildInterpretation(fma.name, "Karim Abu-Zaid", karimScores),
      completedAt: subWeeks(new Date(), 6),
      createdAt: subWeeks(new Date(), 6),
    },
  });

  await db.assessment.create({
    data: {
      patientId: sara.id, templateId: adlis.id, therapistId: sajaa.id,
      status: "IN_PROGRESS",
      responses: { feeding_1: 2, feeding_2: 1, feeding_3: 1, dressing_1: 2 },
    },
  });

  // ── Treatment plans & goals ──────────────────────────────────────────────
  const omarPlan = await db.treatmentPlan.create({
    data: {
      patientId: omar.id, therapistId: sajaa.id,
      title: "Sensory Integration & Motor Planning Program",
      startDate: subWeeks(new Date(), 9),
      frequencyPerWeek: 2, sessionMinutes: 45,
      focusAreas: ["Sensory modulation", "Fine motor", "ADLs"],
      notes: "SI frame of reference with fine-motor and ADL carryover; monthly parent coaching.",
    },
  });

  const omarLtg = await db.goal.create({
    data: {
      treatmentPlanId: omarPlan.id, patientId: omar.id, level: "LONG_TERM", status: "IN_PROGRESS",
      description: "Within 6 months, Omar will independently complete his morning dressing routine (shirt, trousers, socks, shoes) within 15 minutes on 4/5 consecutive days per parent report.",
      baseline: "Requires moderate assistance for all fasteners; refuses several clothing textures.",
      targetCriteria: "4/5 days independent, ≤15 minutes",
      targetDate: addWeeks(new Date(), 15), progress: 45,
    },
  });
  const omarStg1 = await db.goal.create({
    data: {
      treatmentPlanId: omarPlan.id, patientId: omar.id, parentGoalId: omarLtg.id,
      level: "SHORT_TERM", status: "IN_PROGRESS",
      description: "Within 8 weeks, Omar will fasten 4 medium (2cm) buttons on a garment placed on his lap with no more than 2 verbal cues in 3/4 sessions.",
      baseline: "Fastens 1 large button with hand-over-hand assistance.",
      targetCriteria: "4 buttons, ≤2 verbal cues, 3/4 sessions",
      targetDate: addWeeks(new Date(), 3), progress: 60,
    },
  });
  await db.goal.create({
    data: {
      treatmentPlanId: omarPlan.id, patientId: omar.id, parentGoalId: omarLtg.id,
      level: "SHORT_TERM", status: "IN_PROGRESS",
      description: "Within 8 weeks, Omar will tolerate 3 novel clothing textures during dressing play without avoidance behaviors in 3/4 sessions.",
      baseline: "Tolerates cotton only; removes tags, refuses denim and wool.",
      targetCriteria: "3 textures, 3/4 sessions", targetDate: addWeeks(new Date(), 3), progress: 40,
    },
  });
  const progressPoints = [15, 25, 30, 45, 55, 60];
  for (const [i, v] of progressPoints.entries()) {
    await db.goalProgress.create({
      data: {
        goalId: omarStg1.id, value: v,
        date: subWeeks(new Date(), progressPoints.length - i),
        note: i === 3 ? "Introduced button board with 2cm buttons — good motivation." : undefined,
      },
    });
  }

  const adamPlan = await db.treatmentPlan.create({
    data: {
      patientId: adam.id, therapistId: lina.id,
      title: "Bimanual Intensive Program (Right UE)",
      startDate: subWeeks(new Date(), 5),
      frequencyPerWeek: 3, sessionMinutes: 60,
      focusAreas: ["Bimanual coordination", "Strengthening", "School participation"],
    },
  });
  const adamLtg = await db.goal.create({
    data: {
      treatmentPlanId: adamPlan.id, patientId: adam.id, level: "LONG_TERM", status: "IN_PROGRESS",
      description: "Within 4 months, Adam will spontaneously use his right hand as an active assist in 80% of observed bimanual classroom tasks.",
      baseline: "Right UE used as assist in ~20% of bimanual tasks (AHA-informed observation).",
      targetCriteria: "80% of observed tasks", targetDate: addWeeks(new Date(), 11), progress: 35,
    },
  });
  await db.goal.create({
    data: {
      treatmentPlanId: adamPlan.id, patientId: adam.id, parentGoalId: adamLtg.id,
      level: "SHORT_TERM", status: "IN_PROGRESS",
      description: "Within 6 weeks, Adam will stabilize paper with his right hand for the duration of a 5-minute writing task in 4/5 opportunities.",
      baseline: "Stabilizes momentarily with verbal cues only.",
      targetCriteria: "5 minutes, 4/5 opportunities", targetDate: addWeeks(new Date(), 2), progress: 55,
    },
  });

  // ── Documents ────────────────────────────────────────────────────────────
  await db.document.create({
    data: {
      patientId: omar.id, therapistId: sajaa.id, type: "INITIAL_EVALUATION",
      status: "SIGNED", title: "Initial Occupational Therapy Evaluation",
      signedAt: subWeeks(new Date(), 9), signedById: sajaa.id,
      sessionDate: subWeeks(new Date(), 10), createdAt: subWeeks(new Date(), 10),
      content: {
        background: "Omar is a 7-year-old boy referred by Dr. Rana Odeh for occupational therapy evaluation due to concerns with sensory processing, motor coordination and independence in daily activities. Medical history is notable for recurrent otitis media with PE tubes at 26 months.",
        observations: "Omar presented as a friendly, verbal child who engaged readily in gross motor play. Decreased postural endurance was noted in prone extension (held 8 seconds). Tactile defensiveness observed during messy play with shaving foam. A static tripod grasp was used on writing tools with heavy pressure.",
        results: "On the Sensory Processing Screening, Omar's overall score fell within the Probable Difference range, with tactile processing emerging as the area of greatest need. Fine motor observation showed difficulty with fasteners and in-hand manipulation below age expectations.",
        strengths: "Strong verbal skills, motivated by construction play, supportive and engaged family.",
        concerns: "Tactile defensiveness limiting dressing and mealtime variety; delayed fine motor skills impacting self-care independence and pre-writing.",
        recommendations: "Occupational therapy 2x/week for 45-minute sessions using a sensory integration frame of reference, with a home sensory diet and monthly parent coaching. Re-evaluation in 6 months.",
      },
    },
  });

  const soapDates = [3, 2, 1];
  for (const w of soapDates) {
    await db.document.create({
      data: {
        patientId: omar.id, therapistId: sajaa.id, type: "SOAP_NOTE",
        status: w === 1 ? "DRAFT" : "COMPLETED",
        title: `SOAP Note — Session ${16 - w * 2}`,
        sessionDate: subWeeks(new Date(), w), createdAt: subWeeks(new Date(), w),
        content: {
          subjective: "Mother reports Omar attempted buttons on pajamas twice this week with less frustration. Slept well; no illness.",
          objective: `Omar participated in a 45-minute session. Proprioceptive warm-up (animal walks x5 min, therapy ball activities). Button board: completed ${5 - w}/4 medium buttons with ${w} verbal cues. Tolerated shaving foam play ${w === 1 ? 4 : 2} minutes with wrist-level contact.`,
          assessment: "Omar demonstrates steady gains in fastener management, benefiting from proprioceptive preparation prior to fine motor demands. Tactile tolerance is improving with graded exposure; he continues to require cuing for thumb opposition during button pushing.",
          plan: "Continue 2x/week. Next session: introduce 1.5cm buttons and denim texture in dressing play. Home program updated — bear walks before dressing routine.",
        },
      },
    });
  }

  await db.document.create({
    data: {
      patientId: karim.id, therapistId: lina.id, type: "SCHOOL_REPORT",
      status: "COMPLETED", title: "School Report — Handwriting Support",
      sessionDate: subWeeks(new Date(), 2), createdAt: subWeeks(new Date(), 2),
      content: {
        summary: "Karim receives weekly occupational therapy targeting handwriting legibility, writing endurance and organization of written work, secondary to dysgraphia and ADHD.",
        classroom: "Karim's reduced pencil control and fatigue present as incomplete written work, letter reversals under time pressure, and avoidance of extended writing tasks.",
        strategies: "Recommend a sloped writing surface, pencil grip trialed in OT, movement break before writing blocks, reduced copying demands (provide printed notes), and extra time for written assessments.",
      },
    },
  });

  await db.document.create({
    data: {
      patientId: layla.id, therapistId: sajaa.id, type: "HOME_PROGRAM",
      status: "COMPLETED", title: "Home Program — Sensory Regulation",
      sessionDate: subWeeks(new Date(), 1), createdAt: subWeeks(new Date(), 1),
      content: {
        goals: "Support Layla's regulation before mealtimes and transitions, and expand her tolerance for a wider variety of food textures.",
        activities: "1) Deep-pressure 'sandwich squishes' with sofa cushions, 5 squeezes before meals. 2) Chair push-ups x10 before sitting at the table. 3) Food play tray twice weekly: touching, smelling and stacking preferred + one new food — no pressure to eat. 4) Visual first-then board for transitions.",
        tips: "Keep sessions playful and stop before frustration. If Layla gags or panics, return to the last comfortable step. Celebrate interaction with new foods, not eating.",
      },
    },
  });

  // ── Appointments ─────────────────────────────────────────────────────────
  const mkAppt = (patientId: string, therapistId: string, day: Date, hour: number, minutes: number, status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" = "SCHEDULED", room = "Sensory Gym") => ({
    patientId, therapistId,
    start: setMinutes(setHours(day, hour), minutes),
    end: setMinutes(setHours(day, hour), minutes + 45),
    status, room,
  });

  const today = new Date();
  const appts = [
    // past two weeks (completed)
    mkAppt(omar.id, sajaa.id, subDays(today, 7), 9, 0, "COMPLETED"),
    mkAppt(omar.id, sajaa.id, subDays(today, 4), 9, 0, "COMPLETED"),
    mkAppt(layla.id, sajaa.id, subDays(today, 6), 11, 0, "COMPLETED"),
    mkAppt(sara.id, sajaa.id, subDays(today, 5), 13, 0, "COMPLETED", "Treatment Room 1"),
    mkAppt(karim.id, lina.id, subDays(today, 6), 15, 0, "COMPLETED", "Treatment Room 2"),
    mkAppt(adam.id, lina.id, subDays(today, 5), 10, 0, "COMPLETED"),
    mkAppt(adam.id, lina.id, subDays(today, 3), 10, 0, "NO_SHOW"),
    // this + next week
    mkAppt(omar.id, sajaa.id, today, 9, 0),
    mkAppt(layla.id, sajaa.id, today, 11, 0),
    mkAppt(sara.id, sajaa.id, addDays(today, 1), 13, 0, "SCHEDULED", "Treatment Room 1"),
    mkAppt(adam.id, lina.id, addDays(today, 1), 10, 0),
    mkAppt(karim.id, lina.id, addDays(today, 2), 15, 0, "SCHEDULED", "Treatment Room 2"),
    mkAppt(omar.id, sajaa.id, addDays(today, 3), 9, 0),
    mkAppt(layla.id, sajaa.id, addDays(today, 4), 11, 0),
    mkAppt(sara.id, sajaa.id, addDays(today, 7), 13, 0, "SCHEDULED", "Treatment Room 1"),
  ];
  for (const a of appts) await db.appointment.create({ data: a });

  await db.waitlistEntry.create({
    data: { name: "Noor Tahboub", phone: "+962 79 666 7788", reason: "Initial evaluation — developmental delay", priority: 1 },
  });

  // ── Billing ──────────────────────────────────────────────────────────────
  const inv1 = await db.invoice.create({
    data: {
      number: "INV-2026-014", patientId: omar.id, status: "PAID",
      issueDate: subMonths(today, 1), dueDate: subDays(today, 14),
      items: [{ description: "OT session (45 min) x8 — monthly package", quantity: 8, unitPrice: 35 }],
      subtotal: 280, tax: 0, total: 280,
    },
  });
  await db.payment.create({
    data: { invoiceId: inv1.id, amount: 280, method: "CARD", paidAt: subDays(today, 20) },
  });
  const inv2 = await db.invoice.create({
    data: {
      number: "INV-2026-015", patientId: layla.id, status: "SENT",
      issueDate: subDays(today, 10), dueDate: addDays(today, 4),
      items: [
        { description: "OT session (45 min) x4", quantity: 4, unitPrice: 35 },
        { description: "Home program development", quantity: 1, unitPrice: 25 },
      ],
      subtotal: 165, tax: 0, total: 165,
    },
  });
  await db.invoice.create({
    data: {
      number: "INV-2026-016", patientId: karim.id, status: "OVERDUE",
      issueDate: subMonths(today, 1), dueDate: subDays(today, 7),
      items: [{ description: "OT evaluation — handwriting", quantity: 1, unitPrice: 60 }],
      subtotal: 60, tax: 0, total: 60,
    },
  });
  void inv2;

  console.log("Seed complete.");
}

main()
  .then(async () => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
