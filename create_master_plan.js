const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, BorderStyle, WidthType, HeadingLevel, PageBreak, VerticalAlign, UnderlineType } = require('docx');
const fs = require('fs');

// Master Project Timeline Data
const projectTasks = [
  // Phase 1: Foundation & Legal (July - September 2026)
  {
    id: 'T1.1',
    name: 'Project Initiation & Planning',
    description: 'Establish project governance, define scope, assemble project team',
    startDate: '2026-07-30',
    endDate: '2026-08-15',
    duration: 16,
    dependencies: 'None',
    priority: 'CRITICAL',
    responsible: 'Project Director',
    deliverables: 'Project Charter, Team Structure, Communication Plan',
    status: 'In Progress'
  },
  {
    id: 'T1.2',
    name: 'Company Registration (Egyptian Authority)',
    description: 'Register clinic as legal entity with General Authority for Investment (GAFI)',
    startDate: '2026-08-01',
    endDate: '2026-08-30',
    duration: 30,
    dependencies: 'T1.1',
    priority: 'CRITICAL',
    responsible: 'Legal & Compliance Officer',
    deliverables: 'Commercial Registration, Tax ID, Ministry Registration',
    status: 'Not Started'
  },
  {
    id: 'T1.3',
    name: 'Healthcare Licensing Application - MOH',
    description: 'Submit application to Ministry of Health & Population for healthcare facility license',
    startDate: '2026-08-15',
    endDate: '2026-10-15',
    duration: 61,
    dependencies: 'T1.2',
    priority: 'CRITICAL',
    responsible: 'Healthcare Compliance Manager',
    deliverables: 'License Application, Clinical Specifications, Floor Plans',
    status: 'Not Started'
  },
  {
    id: 'T1.4',
    name: 'Tax Registration & Compliance Setup',
    description: 'Register with Egyptian Tax Authority (ETA), obtain VAT registration',
    startDate: '2026-08-15',
    endDate: '2026-09-15',
    duration: 31,
    dependencies: 'T1.2',
    priority: 'HIGH',
    responsible: 'Finance Manager',
    deliverables: 'Tax ID, VAT Certificate, Compliance Documentation',
    status: 'Not Started'
  },
  {
    id: 'T1.5',
    name: 'Municipality Approval (Giza Governorate)',
    description: 'Obtain municipal zoning approval for healthcare facility in New Cairo',
    startDate: '2026-08-15',
    endDate: '2026-09-30',
    duration: 46,
    dependencies: 'T1.2',
    priority: 'HIGH',
    responsible: 'Facilities Manager',
    deliverables: 'Zoning Approval, Building Permit',
    status: 'Not Started'
  },
  {
    id: 'T1.6',
    name: 'Civil Defense & Fire Safety Approval',
    description: 'Civil Defense Authority inspections and approvals for fire safety & emergency procedures',
    startDate: '2026-09-15',
    endDate: '2026-10-30',
    duration: 45,
    dependencies: 'T1.5',
    priority: 'CRITICAL',
    responsible: 'Safety & Compliance Officer',
    deliverables: 'Fire Safety Approval, Emergency Procedures Certification',
    status: 'Not Started'
  },
  {
    id: 'T1.7',
    name: 'Environmental & Waste Management Approval',
    description: 'Egyptian Environmental Affairs Agency approval for medical waste handling',
    startDate: '2026-09-15',
    endDate: '2026-11-15',
    duration: 61,
    dependencies: 'T1.3',
    priority: 'HIGH',
    responsible: 'Environmental Health & Safety Officer',
    deliverables: 'Waste Management Plan, Environmental Approval',
    status: 'Not Started'
  },
  {
    id: 'T1.8',
    name: 'Insurance Policies & Coverage',
    description: 'Secure professional liability, general liability, and property insurance',
    startDate: '2026-09-01',
    endDate: '2026-10-01',
    duration: 30,
    dependencies: 'T1.1',
    priority: 'HIGH',
    responsible: 'Risk Manager',
    deliverables: 'Insurance Policies, Coverage Documentation, Certificates',
    status: 'Not Started'
  },
  {
    id: 'T1.9',
    name: 'Data Privacy & GDPR-Equivalent Compliance',
    description: 'Establish patient data protection compliance per Egyptian regulations',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    duration: 44,
    dependencies: 'T1.1',
    priority: 'HIGH',
    responsible: 'Data Protection Officer',
    deliverables: 'Privacy Policy, Data Protection Plan, Consent Forms',
    status: 'Not Started'
  },

  // Phase 2: Facility Preparation (August - December 2026)
  {
    id: 'T2.1',
    name: 'Facility Site Selection & Lease Execution',
    description: 'Identify and secure New Cairo facility (2,500 sqm), execute lease agreement',
    startDate: '2026-07-30',
    endDate: '2026-09-15',
    duration: 48,
    dependencies: 'T1.5',
    priority: 'CRITICAL',
    responsible: 'Facilities Manager',
    deliverables: 'Lease Agreement, Floor Plans, Site Specifications',
    status: 'Not Started'
  },
  {
    id: 'T2.2',
    name: 'Architectural Design & Engineering Plans',
    description: 'Develop detailed architectural and MEP drawings for clinic layout',
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    duration: 60,
    dependencies: 'T2.1',
    priority: 'CRITICAL',
    responsible: 'Facilities Manager',
    deliverables: 'Floor Plans, Electrical Drawings, HVAC Plans, Plumbing Plans',
    status: 'Not Started'
  },
  {
    id: 'T2.3',
    name: 'Interior Design & Layout Planning',
    description: 'Design therapy rooms, reception, waiting areas, staff areas per clinical standards',
    startDate: '2026-08-15',
    endDate: '2026-09-30',
    duration: 46,
    dependencies: 'T2.2',
    priority: 'HIGH',
    responsible: 'Facilities Manager',
    deliverables: '3D Renderings, Design Specifications, Layout Plans',
    status: 'Not Started'
  },
  {
    id: 'T2.4',
    name: 'Construction & Renovation Work',
    description: 'Execute all construction, renovation, installations (electrical, HVAC, plumbing)',
    startDate: '2026-10-01',
    endDate: '2027-01-31',
    duration: 122,
    dependencies: 'T2.2, T2.3',
    priority: 'CRITICAL',
    responsible: 'Construction Manager',
    deliverables: 'Completed Construction, Inspection Reports, Defect Lists',
    status: 'Not Started'
  },
  {
    id: 'T2.5',
    name: 'Furniture & Fixture Installation',
    description: 'Procure and install all furniture for therapy rooms, offices, reception, waiting areas',
    startDate: '2026-11-15',
    endDate: '2027-02-28',
    duration: 105,
    dependencies: 'T2.4',
    priority: 'HIGH',
    responsible: 'Procurement Manager',
    deliverables: 'Installed Furniture, Inventory List, Installation Certificates',
    status: 'Not Started'
  },
  {
    id: 'T2.6',
    name: 'Medical Equipment Procurement & Installation',
    description: 'Procure therapy equipment, assessment tools, medical devices per department',
    startDate: '2026-10-15',
    endDate: '2027-03-31',
    duration: 168,
    dependencies: 'T2.1',
    priority: 'CRITICAL',
    responsible: 'Clinical Equipment Manager',
    deliverables: 'Equipment Inventory, Installation Certificates, Calibration Reports',
    status: 'Not Started'
  },
  {
    id: 'T2.7',
    name: 'IT Infrastructure & Network Setup',
    description: 'Install servers, network, WiFi, security cameras, access control systems',
    startDate: '2026-11-01',
    endDate: '2027-02-28',
    duration: 119,
    dependencies: 'T2.4',
    priority: 'HIGH',
    responsible: 'IT Manager',
    deliverables: 'Network Diagram, Equipment Inventory, Configuration Documentation',
    status: 'Not Started'
  },
  {
    id: 'T2.8',
    name: 'Signage, Branding & Reception Setup',
    description: 'Install interior/exterior signage, clinic branding, reception desk setup',
    startDate: '2027-02-01',
    endDate: '2027-03-15',
    duration: 42,
    dependencies: 'T2.4, T2.5',
    priority: 'MEDIUM',
    responsible: 'Branding Manager',
    deliverables: 'Installed Signage, Reception Setup, Branding Assets',
    status: 'Not Started'
  },
  {
    id: 'T2.9',
    name: 'Final Facility Inspections & Sign-Off',
    description: 'MOH, Civil Defense, Municipality final inspections and approvals',
    startDate: '2027-02-28',
    endDate: '2027-03-31',
    duration: 31,
    dependencies: 'T2.4, T2.6, T2.7',
    priority: 'CRITICAL',
    responsible: 'Compliance Officer',
    deliverables: 'Final Inspection Reports, Approval Certificates',
    status: 'Not Started'
  },

  // Phase 3: Clinical Operations Setup (September 2026 - March 2027)
  {
    id: 'T3.1',
    name: 'Clinical Workflow & Process Design',
    description: 'Design patient journey, appointment workflows, clinical documentation standards',
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    duration: 60,
    dependencies: 'T1.1',
    priority: 'HIGH',
    responsible: 'Clinical Director',
    deliverables: 'Process Maps, Patient Pathways, Documentation Templates',
    status: 'Not Started'
  },
  {
    id: 'T3.2',
    name: 'Department Structure & Protocols',
    description: 'Define OT, PT, Speech, Psychology departments with clinical protocols',
    startDate: '2026-09-15',
    endDate: '2026-11-15',
    duration: 61,
    dependencies: 'T3.1',
    priority: 'HIGH',
    responsible: 'Clinical Director',
    deliverables: 'Department SOPs, Clinical Protocols, Assessment Templates',
    status: 'Not Started'
  },
  {
    id: 'T3.3',
    name: 'Quality Assurance & Infection Control',
    description: 'Establish QA programs, infection control procedures, safety protocols',
    startDate: '2026-10-01',
    endDate: '2026-12-15',
    duration: 76,
    dependencies: 'T3.2',
    priority: 'CRITICAL',
    responsible: 'Quality & Safety Manager',
    deliverables: 'QA Manual, Infection Control Plan, Safety Procedures',
    status: 'Not Started'
  },
  {
    id: 'T3.4',
    name: 'Patient Consent & Documentation System',
    description: 'Create consent forms, clinical documentation templates, privacy notices',
    startDate: '2026-10-15',
    endDate: '2026-12-01',
    duration: 47,
    dependencies: 'T1.9, T3.1',
    priority: 'HIGH',
    responsible: 'Clinical Operations Manager',
    deliverables: 'Consent Forms, Documentation Templates, Privacy Notices',
    status: 'Not Started'
  },
  {
    id: 'T3.5',
    name: 'Appointment & Billing System Setup',
    description: 'Configure clinic management software, appointment system, billing workflows',
    startDate: '2026-11-15',
    endDate: '2027-01-31',
    duration: 78,
    dependencies: 'T2.7',
    priority: 'HIGH',
    responsible: 'Operations & IT Manager',
    deliverables: 'System Configuration, User Manuals, Testing Reports',
    status: 'Not Started'
  },
  {
    id: 'T3.6',
    name: 'Emergency Procedures & Disaster Planning',
    description: 'Develop emergency protocols, evacuation procedures, disaster response plans',
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    duration: 60,
    dependencies: 'T1.6, T3.3',
    priority: 'CRITICAL',
    responsible: 'Safety Manager',
    deliverables: 'Emergency Procedures Manual, Evacuation Plans, Drill Schedules',
    status: 'Not Started'
  },

  // Phase 4: Human Resources (September 2026 - March 2027)
  {
    id: 'T4.1',
    name: 'Organization Structure & Chart',
    description: 'Define organizational structure, reporting lines, role definitions',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    duration: 30,
    dependencies: 'T1.1',
    priority: 'HIGH',
    responsible: 'HR Manager',
    deliverables: 'Org Chart, Role Definitions, Reporting Structure',
    status: 'Not Started'
  },
  {
    id: 'T4.2',
    name: 'Job Descriptions & Hiring Specifications',
    description: 'Create detailed job descriptions for all positions (clinical, admin, support)',
    startDate: '2026-09-15',
    endDate: '2026-10-31',
    duration: 46,
    dependencies: 'T4.1',
    priority: 'HIGH',
    responsible: 'HR Manager',
    deliverables: 'Job Descriptions, Selection Criteria, Interview Guides',
    status: 'Not Started'
  },
  {
    id: 'T4.3',
    name: 'Clinical Staff Recruitment - Tier 1',
    description: 'Recruit core clinical leadership (Director, Clinical Director, Department Heads)',
    startDate: '2026-09-15',
    endDate: '2026-11-30',
    duration: 76,
    dependencies: 'T4.2',
    priority: 'CRITICAL',
    responsible: 'HR Manager',
    deliverables: 'Recruitment Reports, Offers, Signed Contracts',
    status: 'Not Started'
  },
  {
    id: 'T4.4',
    name: 'Clinical Staff Recruitment - Tier 2',
    description: 'Recruit therapists (OT, PT, Speech, Psychology) and assessment specialists',
    startDate: '2026-10-15',
    endDate: '2026-12-31',
    duration: 77,
    dependencies: 'T4.3',
    priority: 'CRITICAL',
    responsible: 'HR Manager',
    deliverables: 'Recruitment Reports, Offers, Contracts, Professional Certifications',
    status: 'Not Started'
  },
  {
    id: 'T4.5',
    name: 'Administrative & Support Staff Recruitment',
    description: 'Recruit reception, administrative, cleaning, security, and support staff',
    startDate: '2026-11-01',
    endDate: '2027-01-31',
    duration: 92,
    dependencies: 'T4.2',
    priority: 'HIGH',
    responsible: 'HR Manager',
    deliverables: 'Recruitment Reports, Offers, Contracts',
    status: 'Not Started'
  },
  {
    id: 'T4.6',
    name: 'Professional License Verification & Registration',
    description: 'Verify all clinical staff licenses, register with Egyptian Medical Syndicate',
    startDate: '2026-11-01',
    endDate: '2027-01-31',
    duration: 92,
    dependencies: 'T4.4',
    priority: 'CRITICAL',
    responsible: 'HR Manager',
    deliverables: 'License Verification Reports, Syndicate Registrations',
    status: 'Not Started'
  },
  {
    id: 'T4.7',
    name: 'Employment Contracts & Documentation',
    description: 'Prepare employment contracts, health insurance enrollment, payroll setup',
    startDate: '2026-11-01',
    endDate: '2027-02-28',
    duration: 119,
    dependencies: 'T4.5',
    priority: 'HIGH',
    responsible: 'HR Manager',
    deliverables: 'Signed Contracts, Insurance Documentation, Payroll Setup',
    status: 'Not Started'
  },
  {
    id: 'T4.8',
    name: 'Staff Orientation & Onboarding',
    description: 'Comprehensive orientation covering policies, procedures, systems, culture',
    startDate: '2027-01-15',
    endDate: '2027-03-15',
    duration: 59,
    dependencies: 'T4.5, T4.7',
    priority: 'HIGH',
    responsible: 'HR Manager',
    deliverables: 'Orientation Completion Reports, Competency Assessments',
    status: 'Not Started'
  },
  {
    id: 'T4.9',
    name: 'Clinical Training & Competency Development',
    description: 'Clinical protocols training, system training, competency assessments',
    startDate: '2027-02-01',
    endDate: '2027-04-05',
    duration: 63,
    dependencies: 'T4.8, T3.2',
    priority: 'CRITICAL',
    responsible: 'Clinical Director',
    deliverables: 'Training Completion Records, Competency Certifications',
    status: 'Not Started'
  },

  // Phase 5: Technology & Systems (October 2026 - March 2027)
  {
    id: 'T5.1',
    name: 'Technology Requirements & System Selection',
    description: 'Define tech requirements, select EMR, billing, CRM, HR, accounting systems',
    startDate: '2026-10-01',
    endDate: '2026-11-15',
    duration: 45,
    dependencies: 'T1.1, T3.5',
    priority: 'HIGH',
    responsible: 'IT Manager',
    deliverables: 'Technology Roadmap, System Selection Reports, Implementation Plans',
    status: 'Not Started'
  },
  {
    id: 'T5.2',
    name: 'EMR & Clinic Management System Implementation',
    description: 'Implement Electronic Medical Records and clinic management software',
    startDate: '2026-11-01',
    endDate: '2027-02-28',
    duration: 119,
    dependencies: 'T5.1, T2.7',
    priority: 'CRITICAL',
    responsible: 'IT Manager',
    deliverables: 'System Implementation Report, User Training Materials, Go-Live Documentation',
    status: 'Not Started'
  },
  {
    id: 'T5.3',
    name: 'Billing & Accounting System Setup',
    description: 'Configure billing system, accounting software, financial controls',
    startDate: '2026-12-01',
    endDate: '2027-02-28',
    duration: 90,
    dependencies: 'T5.1',
    priority: 'HIGH',
    responsible: 'Finance & IT Manager',
    deliverables: 'System Configuration, Chart of Accounts, Control Documentation',
    status: 'Not Started'
  },
  {
    id: 'T5.4',
    name: 'CRM & Patient Communication System',
    description: 'Implement CRM for patient relationship management and communications',
    startDate: '2027-01-01',
    endDate: '2027-03-15',
    duration: 73,
    dependencies: 'T5.1',
    priority: 'MEDIUM',
    responsible: 'IT & Operations Manager',
    deliverables: 'CRM Implementation, Communication Templates, User Guides',
    status: 'Not Started'
  },
  {
    id: 'T5.5',
    name: 'Cybersecurity & Data Protection Setup',
    description: 'Implement cybersecurity measures, data backup, disaster recovery',
    startDate: '2027-01-01',
    endDate: '2027-03-31',
    duration: 89,
    dependencies: 'T2.7, T5.2',
    priority: 'CRITICAL',
    responsible: 'IT Manager',
    deliverables: 'Security Implementation Report, Backup Plans, Compliance Certification',
    status: 'Not Started'
  },

  // Phase 6: Marketing & Launch (January - May 2027)
  {
    id: 'T6.1',
    name: 'Marketing Strategy & Campaign Planning',
    description: 'Develop comprehensive marketing strategy for soft and grand opening',
    startDate: '2026-12-01',
    endDate: '2027-01-31',
    duration: 61,
    dependencies: 'T1.1',
    priority: 'HIGH',
    responsible: 'Marketing Manager',
    deliverables: 'Marketing Plan, Campaign Calendar, Budget Allocation',
    status: 'Not Started'
  },
  {
    id: 'T6.2',
    name: 'Digital Presence & Website Launch',
    description: 'Launch website, social media presence, online booking system',
    startDate: '2027-01-01',
    endDate: '2027-02-28',
    duration: 59,
    dependencies: 'T2.8, T5.4',
    priority: 'HIGH',
    responsible: 'Marketing Manager',
    deliverables: 'Live Website, Social Media Accounts, Online Booking System',
    status: 'Not Started'
  },
  {
    id: 'T6.3',
    name: 'Pre-Launch Marketing Campaign',
    description: 'Execute advertising, PR, partnerships leading to soft opening',
    startDate: '2027-02-01',
    endDate: '2027-03-31',
    duration: 58,
    dependencies: 'T6.1, T6.2',
    priority: 'HIGH',
    responsible: 'Marketing Manager',
    deliverables: 'Campaign Reports, Media Coverage, Partnership Agreements',
    status: 'Not Started'
  },
  {
    id: 'T6.4',
    name: 'Soft Opening (Test Patient Admission)',
    description: 'Soft opening for internal testing and controlled patient intake',
    startDate: '2027-03-01',
    endDate: '2027-03-31',
    duration: 31,
    dependencies: 'T2.9, T4.9, T5.2',
    priority: 'CRITICAL',
    responsible: 'Clinical Director',
    deliverables: 'Soft Opening Report, Issues Resolution Log, Performance Metrics',
    status: 'Not Started'
  },
  {
    id: 'T6.5',
    name: 'Grand Opening Preparation & Marketing',
    description: 'Final marketing push, VIP invitations, media coordination',
    startDate: '2027-04-01',
    endDate: '2027-05-06',
    duration: 35,
    dependencies: 'T6.4',
    priority: 'HIGH',
    responsible: 'Marketing Manager',
    deliverables: 'Grand Opening Event Plan, Guest List, Media Materials',
    status: 'Not Started'
  },
  {
    id: 'T6.6',
    name: 'Grand Opening Event - May 6, 2027',
    description: 'Official clinic grand opening, VIP event, media coverage',
    startDate: '2027-05-06',
    endDate: '2027-05-06',
    duration: 1,
    dependencies: 'T6.5, T2.9',
    priority: 'CRITICAL',
    responsible: 'Project Director',
    deliverables: 'Event Report, Photos/Video, Media Coverage Summary',
    status: 'Not Started'
  },

  // Phase 7: Final Readiness & Operations Launch
  {
    id: 'T7.1',
    name: 'Final Readiness Audit & Checklists',
    description: 'Comprehensive 30-day pre-opening readiness assessment',
    startDate: '2027-04-06',
    endDate: '2027-05-06',
    duration: 30,
    dependencies: 'T6.4',
    priority: 'CRITICAL',
    responsible: 'Project Manager',
    deliverables: 'Final Readiness Report, Checklist Completion, Sign-Off',
    status: 'Not Started'
  },
  {
    id: 'T7.2',
    name: 'Operations Manual Completion & Distribution',
    description: 'Complete all operational manuals, policies, procedures',
    startDate: '2027-02-01',
    endDate: '2027-03-31',
    duration: 58,
    dependencies: 'T3.2, T4.2',
    priority: 'HIGH',
    responsible: 'Operations Manager',
    deliverables: 'Complete Operations Manual, Staff Distribution, Acknowledgments',
    status: 'Not Started'
  },
  {
    id: 'T7.3',
    name: 'Clinical Documentation System Testing',
    description: 'Full testing of EMR, patient records, documentation workflows',
    startDate: '2027-03-01',
    endDate: '2027-03-31',
    duration: 31,
    dependencies: 'T5.2, T3.4',
    priority: 'CRITICAL',
    responsible: 'Clinical Operations Manager',
    deliverables: 'Testing Reports, Issues Resolution, System Sign-Off',
    status: 'Not Started'
  },
  {
    id: 'T7.4',
    name: 'Patient Communication & Appointment Scheduling',
    description: 'Activate patient scheduling, confirmations, reminder systems',
    startDate: '2027-04-01',
    endDate: '2027-05-06',
    duration: 35,
    dependencies: 'T5.3, T6.3',
    priority: 'HIGH',
    responsible: 'Operations Manager',
    deliverables: 'Communication Templates, Scheduling Workflow, Launch Metrics',
    status: 'Not Started'
  }
];

// Egyptian Legal Requirements
const egyptianRequirements = [
  {
    category: 'Company Registration',
    requirement: 'General Authority for Investment (GAFI) Registration',
    documents: 'Certificate of Registration, Investment ID, Commercial Registration Number',
    authority: 'General Authority for Investment (GAFI)',
    processingTime: '7-14 days',
    dependencies: 'Business Plan, Founders ID'
  },
  {
    category: 'Healthcare Licensing',
    requirement: 'Ministry of Health & Population (MOH) Facility License',
    documents: 'Healthcare Facility License, Clinical Specifications, Floor Plans, Staff Lists',
    authority: 'Ministry of Health & Population',
    processingTime: '30-60 days',
    dependencies: 'Facility Details, Clinical Protocols, Infection Control Plan'
  },
  {
    category: 'Tax Compliance',
    requirement: 'Egyptian Tax Authority (ETA) Registration & VAT',
    documents: 'Tax ID Number, VAT Certificate, Annual Declarations',
    authority: 'Egyptian Tax Authority (ETA)',
    processingTime: '10-15 days',
    dependencies: 'Company Registration, Business License'
  },
  {
    category: 'Municipality Approval',
    requirement: 'Giza Governorate Zoning & Building Permit',
    documents: 'Building Permit, Zoning Approval, Site Inspection Reports',
    authority: 'Giza Governorate Building Authority',
    processingTime: '15-30 days',
    dependencies: 'Facility Location, Architectural Drawings'
  },
  {
    category: 'Civil Defense',
    requirement: 'Fire Safety & Emergency Procedures Certification',
    documents: 'Fire Safety Certificate, Emergency Plan, Evacuation Procedures',
    authority: 'Egyptian Civil Defense Authority',
    processingTime: '20-40 days',
    dependencies: 'Architectural Plans, Safety Procedures, Emergency Plan'
  },
  {
    category: 'Environmental',
    requirement: 'Medical Waste Management & Environmental Compliance',
    documents: 'Environmental Approval, Waste Management Contract, Disposal Plan',
    authority: 'Egyptian Environmental Affairs Agency',
    processingTime: '20-45 days',
    dependencies: 'Waste Management Plan, Treatment Details'
  },
  {
    category: 'Insurance',
    requirement: 'Professional Liability & General Liability Insurance',
    documents: 'Insurance Policies, Coverage Certificates, Premium Payments',
    authority: 'Licensed Insurance Companies',
    processingTime: '7-14 days',
    dependencies: 'Facility Information, Coverage Requirements'
  },
  {
    category: 'Employment',
    requirement: 'Employee Registration with Social Insurance Fund (SIF)',
    documents: 'Employee Registration Forms, SIF Certificates, Insurance Cards',
    authority: 'Social Insurance Fund (SIF)',
    processingTime: '5-10 days',
    dependencies: 'Employee Lists, Contracts'
  },
  {
    category: 'Professional Licenses',
    requirement: 'Egyptian Medical Syndicate Registration for Clinical Staff',
    documents: 'Syndicate Membership Certificates, License Verifications',
    authority: 'Egyptian Medical Syndicate',
    processingTime: '10-20 days',
    dependencies: 'Staff Credentials, Professional Qualifications'
  },
  {
    category: 'Data Protection',
    requirement: 'Patient Data Privacy Compliance (Law 151/2020)',
    documents: 'Privacy Policy, Data Protection Plan, Patient Consent Forms',
    authority: 'Ministry of Communications & IT',
    processingTime: 'Ongoing Compliance',
    dependencies: 'IT Systems, Consent Procedures'
  }
];

// Create Master Plan Document
function createMasterPlanDocument() {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        // Title Page
        new Paragraph({
          text: 'TRIAD THERAPEUTIC CLINIC',
          alignment: AlignmentType.CENTER,
          fontSize: 40,
          bold: true,
          color: '1F5F5A',
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: 'PROJECT IMPLEMENTATION PLAN',
          alignment: AlignmentType.CENTER,
          fontSize: 32,
          bold: true,
          color: '2B9B8F',
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: 'New Cairo, Egypt',
          alignment: AlignmentType.CENTER,
          fontSize: 18,
          color: '555555',
          spacing: { after: 400 }
        }),
        new Paragraph({
          text: 'Rehabilitation Center Establishment',
          alignment: AlignmentType.CENTER,
          fontSize: 14,
          italics: true,
          color: '666666',
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: `Project Timeline: July 30, 2026 - May 6, 2027 (Grand Opening)`,
          alignment: AlignmentType.CENTER,
          fontSize: 12,
          color: '999999',
          spacing: { after: 600 }
        }),
        new Paragraph({
          text: `Document Version: 1.0 - Professional Project Management Office (PMO) Deliverable`,
          alignment: AlignmentType.CENTER,
          fontSize: 11,
          italics: true,
          color: '999999'
        }),

        new PageBreak(),

        // Executive Summary
        new Paragraph({
          text: 'EXECUTIVE SUMMARY',
          heading: HeadingLevel.Heading1,
          fontSize: 28,
          bold: true,
          color: '1F5F5A',
          spacing: { before: 240, after: 120 },
          border: {
            bottom: {
              color: '2B9B8F',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 12
            }
          }
        }),

        new Paragraph({
          text: 'Project Scope',
          heading: HeadingLevel.Heading2,
          fontSize: 20,
          bold: true,
          color: '2B9B8F',
          spacing: { before: 200, after: 100 }
        }),

        new Paragraph({
          text: 'This Master Project Implementation Plan outlines the complete establishment of TRIAD Therapeutic Clinic, a multidisciplinary rehabilitation center in New Cairo, Egypt. The project encompasses legal registration, facility development, clinical operations setup, technology infrastructure, human resources development, and market entry across a 10-month timeline.',
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: 'Project Objectives',
          heading: HeadingLevel.Heading2,
          fontSize: 20,
          bold: true,
          color: '2B9B8F',
          spacing: { before: 200, after: 100 }
        }),

        new Paragraph({
          text: '• Achieve Soft Opening in March 2027 with internal testing and controlled patient admission',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '• Execute Grand Opening on May 6, 2027 with full clinical operations and public launch',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '• Secure all Egyptian healthcare licenses and regulatory approvals',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '• Establish world-class clinical operations with Egyptian standards compliance',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '• Recruit and train 25+ clinical and support staff',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '• Implement integrated technology systems for patient care and operations',
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: 'Critical Path Summary',
          heading: HeadingLevel.Heading2,
          fontSize: 20,
          bold: true,
          color: '2B9B8F',
          spacing: { before: 200, after: 100 }
        }),

        new Paragraph({
          text: 'The critical path includes: Company Registration → Healthcare Licensing → Facility Preparation → Medical Equipment Procurement → Clinical Staff Recruitment & Training → System Implementation → Soft Opening → Grand Opening.',
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: 'Key Milestones',
          heading: HeadingLevel.Heading2,
          fontSize: 20,
          bold: true,
          color: '2B9B8F',
          spacing: { before: 200, after: 100 }
        }),

        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Milestone', bold: true, color: 'FFFFFF' })],
                  shading: { type: 'clear', fill: '1F5F5A' },
                  width: { size: 2400, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'Target Date', bold: true, color: 'FFFFFF' })],
                  shading: { type: 'clear', fill: '1F5F5A' },
                  width: { size: 2400, type: WidthType.DXA }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Company & Healthcare Licensing Complete' })],
                  width: { size: 2400, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'October 2026' })],
                  width: { size: 2400, type: WidthType.DXA }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Facility Construction Complete' })],
                  width: { size: 2400, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'January 2027' })],
                  width: { size: 2400, type: WidthType.DXA }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Clinical Staff Fully Trained & Ready' })],
                  width: { size: 2400, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'February 2027' })],
                  width: { size: 2400, type: WidthType.DXA }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Technology Systems Go-Live' })],
                  width: { size: 2400, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'March 2027' })],
                  width: { size: 2400, type: WidthType.DXA }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Soft Opening (Internal Testing)' })],
                  width: { size: 2400, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'March 2027' })],
                  width: { size: 2400, type: WidthType.DXA }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'GRAND OPENING', bold: true })],
                  shading: { type: 'clear', fill: 'E8F4F0' },
                  width: { size: 2400, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'May 6, 2027', bold: true })],
                  shading: { type: 'clear', fill: 'E8F4F0' },
                  width: { size: 2400, type: WidthType.DXA }
                })
              ]
            })
          ],
          width: { size: 100, type: WidthType.PERCENTAGE }
        }),

        new PageBreak(),

        // Section 1: Master Project Timeline
        new Paragraph({
          text: '1. MASTER PROJECT TIMELINE',
          heading: HeadingLevel.Heading1,
          fontSize: 28,
          bold: true,
          color: '1F5F5A',
          spacing: { before: 240, after: 120 },
          border: {
            bottom: {
              color: '2B9B8F',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 12
            }
          }
        }),

        new Paragraph({
          text: 'Complete Task Listing with Dependencies (Extract follows on supporting Excel schedule)',
          spacing: { after: 200 }
        }),

        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'Task ID', bold: true, color: 'FFFFFF' })], shading: { type: 'clear', fill: '1F5F5A' }, width: { size: 600, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: 'Task Name', bold: true, color: 'FFFFFF' })], shading: { type: 'clear', fill: '1F5F5A' }, width: { size: 1600, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: 'Duration', bold: true, color: 'FFFFFF' })], shading: { type: 'clear', fill: '1F5F5A' }, width: { size: 600, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: 'Priority', bold: true, color: 'FFFFFF' })], shading: { type: 'clear', fill: '1F5F5A' }, width: { size: 700, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: 'Responsible', bold: true, color: 'FFFFFF' })], shading: { type: 'clear', fill: '1F5F5A' }, width: { size: 900, type: WidthType.DXA } })
              ]
            }),
            ...projectTasks.slice(0, 10).map((task, idx) => new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: task.id, fontSize: 10 })], width: { size: 600, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: task.name, fontSize: 10 })], width: { size: 1600, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: `${task.duration}d`, fontSize: 10 })], width: { size: 600, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: task.priority, fontSize: 9, color: task.priority === 'CRITICAL' ? 'CC0000' : '1F5F5A' })], width: { size: 700, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: task.responsible, fontSize: 9 })], width: { size: 900, type: WidthType.DXA } })
              ]
            }))
          ],
          width: { size: 100, type: WidthType.PERCENTAGE }
        }),

        new Paragraph({
          text: '... [Complete task list continues in supporting Excel file] ...',
          fontSize: 11,
          italics: true,
          color: '999999',
          spacing: { after: 300 }
        }),

        new PageBreak(),

        // Section 2: Legal & Regulatory
        new Paragraph({
          text: '2. LEGAL & GOVERNMENT REQUIREMENTS (EGYPT)',
          heading: HeadingLevel.Heading1,
          fontSize: 28,
          bold: true,
          color: '1F5F5A',
          spacing: { before: 240, after: 120 },
          border: {
            bottom: {
              color: '2B9B8F',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 12
            }
          }
        }),

        new Paragraph({
          text: 'Required Egyptian Healthcare & Business Licensing',
          spacing: { after: 200 }
        }),

        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'Category', bold: true, color: 'FFFFFF' })], shading: { type: 'clear', fill: '1F5F5A' }, width: { size: 1200, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: 'Requirement', bold: true, color: 'FFFFFF' })], shading: { type: 'clear', fill: '1F5F5A' }, width: { size: 1600, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: 'Authority', bold: true, color: 'FFFFFF' })], shading: { type: 'clear', fill: '1F5F5A' }, width: { size: 1200, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: 'Processing Time', bold: true, color: 'FFFFFF' })], shading: { type: 'clear', fill: '1F5F5A' }, width: { size: 800, type: WidthType.DXA } })
              ]
            }),
            ...egyptianRequirements.map((req, idx) => new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: req.category, fontSize: 10 })], width: { size: 1200, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: req.requirement, fontSize: 10 })], width: { size: 1600, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: req.authority, fontSize: 9 })], width: { size: 1200, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ text: req.processingTime, fontSize: 9 })], width: { size: 800, type: WidthType.DXA } })
              ]
            }))
          ],
          width: { size: 100, type: WidthType.PERCENTAGE }
        }),

        new Paragraph({
          text: 'Critical Notes: All licenses must be obtained before Soft Opening. Healthcare licensing is the critical path item and should be prioritized immediately.',
          fontSize: 11,
          italics: true,
          color: '666666',
          spacing: { before: 200, after: 300 }
        }),

        new PageBreak(),

        // Closing
        new Paragraph({
          text: 'DETAILED SECTIONS CONTINUE:',
          heading: HeadingLevel.Heading2,
          fontSize: 18,
          bold: true,
          color: '1F5F5A',
          spacing: { before: 300, after: 150 }
        }),

        new Paragraph({
          text: '3. Facility Preparation Plan (detailed in supporting documents)',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '4. Clinical Operations Setup (detailed in supporting documents)',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '5. Human Resources Structure & Hiring Plan (detailed in supporting documents)',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '6. Finance & Procurement Plan (detailed in supporting documents)',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '7. Documentation Library & Checklist (detailed in supporting documents)',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '8. Marketing & Launch Plan (detailed in supporting documents)',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '9. Technology Systems Implementation (detailed in supporting documents)',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '10. Risk Management & Contingency Planning (detailed in supporting documents)',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '11. Opening Readiness Checklists (detailed in supporting documents)',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '12. Project Dashboard & Reporting (detailed in supporting documents)',
          spacing: { after: 300 }
        }),

        new Paragraph({
          text: 'All supporting documents are maintained in organized folder structure:',
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: '/Project_Documents/English/ - All English language documents',
          spacing: { after: 40 }
        }),
        new Paragraph({
          text: '/Project_Documents/Arabic/ - All Arabic language documents',
          spacing: { after: 300 }
        }),

        new Paragraph({
          text: 'Document prepared as PMO-level project implementation resource. All supporting schedules, templates, checklists, and forms follow in structured Excel and Word documents.',
          fontSize: 11,
          italics: true,
          color: '666666',
          spacing: { before: 300 }
        })
      ]
    }]
  });

  return doc;
}

// Generate the document
Packer.toBuffer(createMasterPlanDocument()).then(buffer => {
  fs.writeFileSync('/home/user/Sajaa/project_management/English/Master_Plan/TRIAD_Master_Project_Plan_EN.docx', buffer);
  console.log('✓ Master Project Plan (English) created');
  console.log(`  Location: /project_management/English/Master_Plan/`);
  console.log(`  Total Tasks: ${projectTasks.length}`);
  console.log(`  Total Legal Requirements: ${egyptianRequirements.length}`);
  console.log(`  Project Duration: 281 days (July 30, 2026 - May 6, 2027)`);
});
