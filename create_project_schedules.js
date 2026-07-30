const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Create workbook for Detailed Project Timeline
async function createProjectTimeline() {
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Master Schedule
  const scheduleSheet = workbook.addWorksheet('Master Schedule', { pageSetup: { paperSize: 9, orientation: 'landscape' } });
  scheduleSheet.columns = [
    { header: 'Task ID', key: 'id', width: 12, style: { font: { bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'FF1F5F5A' } }, font: { color: { rgb: 'FFFFFFFF' } } } },
    { header: 'Task Name', key: 'name', width: 35, style: { font: { bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'FF1F5F5A' } }, font: { color: { rgb: 'FFFFFFFF' } } } },
    { header: 'Description', key: 'desc', width: 40 },
    { header: 'Start Date', key: 'start', width: 15 },
    { header: 'End Date', key: 'end', width: 15 },
    { header: 'Duration (days)', key: 'duration', width: 14 },
    { header: 'Dependencies', key: 'deps', width: 20 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Responsible', key: 'responsible', width: 25 },
    { header: 'Status', key: 'status', width: 12 }
  ];

  const tasks = [
    { id: 'T1.1', name: 'Project Initiation & Planning', desc: 'Establish governance, scope, team', start: '2026-07-30', end: '2026-08-15', duration: 16, deps: 'None', priority: 'CRITICAL', responsible: 'Project Director', status: 'Not Started' },
    { id: 'T1.2', name: 'Company Registration (GAFI)', desc: 'Register with General Authority for Investment', start: '2026-08-01', end: '2026-08-30', duration: 30, deps: 'T1.1', priority: 'CRITICAL', responsible: 'Legal Officer', status: 'Not Started' },
    { id: 'T1.3', name: 'Healthcare Licensing - MOH', desc: 'Ministry of Health facility license application', start: '2026-08-15', end: '2026-10-15', duration: 61, deps: 'T1.2', priority: 'CRITICAL', responsible: 'Healthcare Compliance', status: 'Not Started' },
    { id: 'T1.4', name: 'Tax Registration & VAT', desc: 'ETA registration, VAT setup', start: '2026-08-15', end: '2026-09-15', duration: 31, deps: 'T1.2', priority: 'HIGH', responsible: 'Finance Manager', status: 'Not Started' },
    { id: 'T1.5', name: 'Municipality Approval (Giza)', desc: 'Zoning approval, building permits', start: '2026-08-15', end: '2026-09-30', duration: 46, deps: 'T1.2', priority: 'HIGH', responsible: 'Facilities Manager', status: 'Not Started' },
    { id: 'T1.6', name: 'Civil Defense & Fire Safety', desc: 'Fire safety certification, emergency procedures', start: '2026-09-15', end: '2026-10-30', duration: 45, deps: 'T1.5', priority: 'CRITICAL', responsible: 'Safety Officer', status: 'Not Started' },
    { id: 'T1.7', name: 'Environmental & Waste Approval', desc: 'Medical waste management, environmental approval', start: '2026-09-15', end: '2026-11-15', duration: 61, deps: 'T1.3', priority: 'HIGH', responsible: 'EHS Officer', status: 'Not Started' },
    { id: 'T1.8', name: 'Insurance Policies', desc: 'Professional & general liability insurance', start: '2026-09-01', end: '2026-10-01', duration: 30, deps: 'T1.1', priority: 'HIGH', responsible: 'Risk Manager', status: 'Not Started' },
    { id: 'T1.9', name: 'Data Privacy Compliance', desc: 'Patient data protection, Law 151/2020', start: '2026-09-01', end: '2026-10-15', duration: 44, deps: 'T1.1', priority: 'HIGH', responsible: 'Data Protection Officer', status: 'Not Started' },
    { id: 'T2.1', name: 'Facility Site Selection', desc: 'Identify and lease New Cairo facility', start: '2026-07-30', end: '2026-09-15', duration: 48, deps: 'T1.5', priority: 'CRITICAL', responsible: 'Facilities Manager', status: 'Not Started' },
    { id: 'T2.2', name: 'Architectural Design', desc: 'Develop architectural and MEP drawings', start: '2026-08-01', end: '2026-09-30', duration: 60, deps: 'T2.1', priority: 'CRITICAL', responsible: 'Facilities Manager', status: 'Not Started' },
    { id: 'T2.3', name: 'Interior Design', desc: 'Design therapy rooms, reception, waiting areas', start: '2026-08-15', end: '2026-09-30', duration: 46, deps: 'T2.2', priority: 'HIGH', responsible: 'Facilities Manager', status: 'Not Started' },
    { id: 'T2.4', name: 'Construction & Renovation', desc: 'Execute all construction, installations', start: '2026-10-01', end: '2027-01-31', duration: 122, deps: 'T2.2, T2.3', priority: 'CRITICAL', responsible: 'Construction Manager', status: 'Not Started' },
    { id: 'T2.5', name: 'Furniture Installation', desc: 'Procure and install all furniture', start: '2026-11-15', end: '2027-02-28', duration: 105, deps: 'T2.4', priority: 'HIGH', responsible: 'Procurement Manager', status: 'Not Started' },
    { id: 'T2.6', name: 'Medical Equipment', desc: 'Procurement and installation of therapy equipment', start: '2026-10-15', end: '2027-03-31', duration: 168, deps: 'T2.1', priority: 'CRITICAL', responsible: 'Clinical Equipment Mgr', status: 'Not Started' },
    { id: 'T2.7', name: 'IT Infrastructure', desc: 'Servers, network, WiFi, cameras, access control', start: '2026-11-01', end: '2027-02-28', duration: 119, deps: 'T2.4', priority: 'HIGH', responsible: 'IT Manager', status: 'Not Started' },
    { id: 'T2.8', name: 'Signage & Branding', desc: 'Install signage, clinic branding, reception setup', start: '2027-02-01', end: '2027-03-15', duration: 42, deps: 'T2.4, T2.5', priority: 'MEDIUM', responsible: 'Branding Manager', status: 'Not Started' },
    { id: 'T2.9', name: 'Final Inspections', desc: 'MOH, Civil Defense, Municipality final approvals', start: '2027-02-28', end: '2027-03-31', duration: 31, deps: 'T2.4, T2.6, T2.7', priority: 'CRITICAL', responsible: 'Compliance Officer', status: 'Not Started' },
    { id: 'T3.1', name: 'Clinical Workflow Design', desc: 'Patient journey, workflows, documentation', start: '2026-09-01', end: '2026-10-31', duration: 60, deps: 'T1.1', priority: 'HIGH', responsible: 'Clinical Director', status: 'Not Started' },
    { id: 'T3.2', name: 'Department Structure', desc: 'Define OT, PT, Speech, Psychology departments', start: '2026-09-15', end: '2026-11-15', duration: 61, deps: 'T3.1', priority: 'HIGH', responsible: 'Clinical Director', status: 'Not Started' },
    { id: 'T3.3', name: 'Quality & Infection Control', desc: 'QA programs, infection control, safety', start: '2026-10-01', end: '2026-12-15', duration: 76, deps: 'T3.2', priority: 'CRITICAL', responsible: 'Quality & Safety Mgr', status: 'Not Started' },
    { id: 'T3.4', name: 'Patient Consent & Docs', desc: 'Consent forms, documentation templates', start: '2026-10-15', end: '2026-12-01', duration: 47, deps: 'T1.9, T3.1', priority: 'HIGH', responsible: 'Clinical Ops Mgr', status: 'Not Started' },
    { id: 'T3.5', name: 'Appointment & Billing', desc: 'Configure clinic management and billing systems', start: '2026-11-15', end: '2027-01-31', duration: 78, deps: 'T2.7', priority: 'HIGH', responsible: 'Ops & IT Manager', status: 'Not Started' },
    { id: 'T3.6', name: 'Emergency Procedures', desc: 'Emergency protocols, evacuation, disaster plans', start: '2026-11-01', end: '2026-12-31', duration: 60, deps: 'T1.6, T3.3', priority: 'CRITICAL', responsible: 'Safety Manager', status: 'Not Started' },
    { id: 'T4.1', name: 'Organization Structure', desc: 'Define organizational structure and roles', start: '2026-09-01', end: '2026-09-30', duration: 30, deps: 'T1.1', priority: 'HIGH', responsible: 'HR Manager', status: 'Not Started' },
    { id: 'T4.2', name: 'Job Descriptions', desc: 'Create job descriptions for all positions', start: '2026-09-15', end: '2026-10-31', duration: 46, deps: 'T4.1', priority: 'HIGH', responsible: 'HR Manager', status: 'Not Started' },
    { id: 'T4.3', name: 'Clinical Staff Recruitment Tier 1', desc: 'Recruit Director, Clinical Director, Heads', start: '2026-09-15', end: '2026-11-30', duration: 76, deps: 'T4.2', priority: 'CRITICAL', responsible: 'HR Manager', status: 'Not Started' },
    { id: 'T4.4', name: 'Clinical Staff Recruitment Tier 2', desc: 'Recruit therapists (OT, PT, Speech, Psych)', start: '2026-10-15', end: '2026-12-31', duration: 77, deps: 'T4.3', priority: 'CRITICAL', responsible: 'HR Manager', status: 'Not Started' },
    { id: 'T4.5', name: 'Admin & Support Staff', desc: 'Recruit reception, admin, cleaning, security', start: '2026-11-01', end: '2027-01-31', duration: 92, deps: 'T4.2', priority: 'HIGH', responsible: 'HR Manager', status: 'Not Started' },
    { id: 'T4.6', name: 'License Verification', desc: 'Verify staff licenses, Medical Syndicate registration', start: '2026-11-01', end: '2027-01-31', duration: 92, deps: 'T4.4', priority: 'CRITICAL', responsible: 'HR Manager', status: 'Not Started' },
    { id: 'T4.7', name: 'Employment Contracts', desc: 'Prepare contracts, health insurance, payroll', start: '2026-11-01', end: '2027-02-28', duration: 119, deps: 'T4.5', priority: 'HIGH', responsible: 'HR Manager', status: 'Not Started' },
    { id: 'T4.8', name: 'Staff Orientation', desc: 'Comprehensive orientation and onboarding', start: '2027-01-15', end: '2027-03-15', duration: 59, deps: 'T4.5, T4.7', priority: 'HIGH', responsible: 'HR Manager', status: 'Not Started' },
    { id: 'T4.9', name: 'Clinical Training', desc: 'Clinical protocols, system training, competency', start: '2027-02-01', end: '2027-04-05', duration: 63, deps: 'T4.8, T3.2', priority: 'CRITICAL', responsible: 'Clinical Director', status: 'Not Started' },
    { id: 'T5.1', name: 'Technology Requirements', desc: 'Define tech requirements, select systems', start: '2026-10-01', end: '2026-11-15', duration: 45, deps: 'T1.1, T3.5', priority: 'HIGH', responsible: 'IT Manager', status: 'Not Started' },
    { id: 'T5.2', name: 'EMR Implementation', desc: 'Implement Electronic Medical Records system', start: '2026-11-01', end: '2027-02-28', duration: 119, deps: 'T5.1, T2.7', priority: 'CRITICAL', responsible: 'IT Manager', status: 'Not Started' },
    { id: 'T5.3', name: 'Billing & Accounting', desc: 'Configure billing system and accounting software', start: '2026-12-01', end: '2027-02-28', duration: 90, deps: 'T5.1', priority: 'HIGH', responsible: 'Finance & IT Mgr', status: 'Not Started' },
    { id: 'T5.4', name: 'CRM Implementation', desc: 'Implement CRM for patient management', start: '2027-01-01', end: '2027-03-15', duration: 73, deps: 'T5.1', priority: 'MEDIUM', responsible: 'IT & Ops Mgr', status: 'Not Started' },
    { id: 'T5.5', name: 'Cybersecurity Setup', desc: 'Cybersecurity, data backup, disaster recovery', start: '2027-01-01', end: '2027-03-31', duration: 89, deps: 'T2.7, T5.2', priority: 'CRITICAL', responsible: 'IT Manager', status: 'Not Started' },
    { id: 'T6.1', name: 'Marketing Strategy', desc: 'Develop marketing strategy and campaigns', start: '2026-12-01', end: '2027-01-31', duration: 61, deps: 'T1.1', priority: 'HIGH', responsible: 'Marketing Manager', status: 'Not Started' },
    { id: 'T6.2', name: 'Digital Presence', desc: 'Launch website, social media, online booking', start: '2027-01-01', end: '2027-02-28', duration: 59, deps: 'T2.8, T5.4', priority: 'HIGH', responsible: 'Marketing Manager', status: 'Not Started' },
    { id: 'T6.3', name: 'Pre-Launch Marketing', desc: 'Advertising, PR, partnerships pre-opening', start: '2027-02-01', end: '2027-03-31', duration: 58, deps: 'T6.1, T6.2', priority: 'HIGH', responsible: 'Marketing Manager', status: 'Not Started' },
    { id: 'T6.4', name: 'Soft Opening', desc: 'Soft opening for internal testing', start: '2027-03-01', end: '2027-03-31', duration: 31, deps: 'T2.9, T4.9, T5.2', priority: 'CRITICAL', responsible: 'Clinical Director', status: 'Not Started' },
    { id: 'T6.5', name: 'Grand Opening Prep', desc: 'Final marketing, VIP invitations, media', start: '2027-04-01', end: '2027-05-06', duration: 35, deps: 'T6.4', priority: 'HIGH', responsible: 'Marketing Manager', status: 'Not Started' },
    { id: 'T6.6', name: 'GRAND OPENING', desc: 'Official clinic grand opening', start: '2027-05-06', end: '2027-05-06', duration: 1, deps: 'T6.5, T2.9', priority: 'CRITICAL', responsible: 'Project Director', status: 'Not Started' },
    { id: 'T7.1', name: 'Final Readiness Audit', desc: 'Comprehensive pre-opening readiness assessment', start: '2027-04-06', end: '2027-05-06', duration: 30, deps: 'T6.4', priority: 'CRITICAL', responsible: 'Project Manager', status: 'Not Started' },
    { id: 'T7.2', name: 'Operations Manual', desc: 'Complete operations manual and policies', start: '2027-02-01', end: '2027-03-31', duration: 58, deps: 'T3.2, T4.2', priority: 'HIGH', responsible: 'Ops Manager', status: 'Not Started' },
    { id: 'T7.3', name: 'EMR Testing', desc: 'Full EMR and documentation system testing', start: '2027-03-01', end: '2027-03-31', duration: 31, deps: 'T5.2, T3.4', priority: 'CRITICAL', responsible: 'Clinical Ops Mgr', status: 'Not Started' },
    { id: 'T7.4', name: 'Patient Scheduling', desc: 'Activate patient scheduling and confirmations', start: '2027-04-01', end: '2027-05-06', duration: 35, deps: 'T5.3, T6.3', priority: 'HIGH', responsible: 'Ops Manager', status: 'Not Started' }
  ];

  tasks.forEach((task, idx) => {
    const row = scheduleSheet.addRow(task);
    row.getCell('priority').fill = task.priority === 'CRITICAL' ? { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'FFFF9999' } } : {};
    row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'FFFFC7CE' } };
  });

  // Sheet 2: Milestone Summary
  const milestoneSheet = workbook.addWorksheet('Milestones');
  milestoneSheet.columns = [
    { header: 'Milestone', key: 'milestone', width: 40 },
    { header: 'Target Date', key: 'date', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Responsible', key: 'responsible', width: 25 }
  ];

  const milestones = [
    { milestone: 'Company Registration Complete', date: '2026-08-30', status: 'Not Started', responsible: 'Legal Officer' },
    { milestone: 'Healthcare Licensing Received', date: '2026-10-15', status: 'Not Started', responsible: 'Healthcare Compliance' },
    { milestone: 'All Approvals Complete', date: '2026-11-15', status: 'Not Started', responsible: 'Compliance Officer' },
    { milestone: 'Facility Construction Complete', date: '2027-01-31', status: 'Not Started', responsible: 'Construction Manager' },
    { milestone: 'Medical Equipment Installed', date: '2027-03-31', status: 'Not Started', responsible: 'Clinical Equipment Mgr' },
    { milestone: 'All Staff Trained & Ready', date: '2027-02-28', status: 'Not Started', responsible: 'Clinical Director' },
    { milestone: 'Technology Systems Go-Live', date: '2027-02-28', status: 'Not Started', responsible: 'IT Manager' },
    { milestone: 'Soft Opening (Testing Phase)', date: '2027-03-31', status: 'Not Started', responsible: 'Clinical Director' },
    { milestone: 'GRAND OPENING', date: '2027-05-06', status: 'Not Started', responsible: 'Project Director' }
  ];

  milestones.forEach(m => {
    milestoneSheet.addRow(m);
  });

  // Sheet 3: Critical Path
  const criticalSheet = workbook.addWorksheet('Critical Path');
  criticalSheet.columns = [
    { header: 'Sequence', key: 'seq', width: 8 },
    { header: 'Task', key: 'task', width: 40 },
    { header: 'Duration', key: 'duration', width: 12 },
    { header: 'Status', key: 'status', width: 15 }
  ];

  const criticalPath = [
    { seq: 1, task: 'Project Initiation', duration: 16, status: 'Not Started' },
    { seq: 2, task: 'Company Registration', duration: 30, status: 'Not Started' },
    { seq: 3, task: 'Healthcare Licensing', duration: 61, status: 'Not Started' },
    { seq: 4, task: 'Facility Selection', duration: 48, status: 'Not Started' },
    { seq: 5, task: 'Architectural Design', duration: 60, status: 'Not Started' },
    { seq: 6, task: 'Construction & Renovation', duration: 122, status: 'Not Started' },
    { seq: 7, task: 'Medical Equipment', duration: 168, status: 'Not Started' },
    { seq: 8, task: 'Clinical Staff Recruitment & Training', duration: 169, status: 'Not Started' },
    { seq: 9, task: 'Technology Implementation', duration: 119, status: 'Not Started' },
    { seq: 10, task: 'Final Inspections', duration: 31, status: 'Not Started' },
    { seq: 11, task: 'Soft Opening', duration: 31, status: 'Not Started' },
    { seq: 12, task: 'Grand Opening', duration: 1, status: 'Not Started' }
  ];

  criticalPath.forEach(cp => {
    criticalSheet.addRow(cp);
  });

  await workbook.xlsx.writeFile('/home/user/Sajaa/project_management/English/Master_Plan/01_TRIAD_Detailed_Project_Timeline_EN.xlsx');
  console.log('✓ Detailed Project Timeline (Excel) created');
}

// Create Legal Requirements Checklist
async function createLegalChecklist() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Legal Requirements');

  sheet.columns = [
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Requirement', key: 'requirement', width: 35 },
    { header: 'Authority', key: 'authority', width: 25 },
    { header: 'Required Documents', key: 'documents', width: 40 },
    { header: 'Start Date', key: 'startDate', width: 15 },
    { header: 'Target Date', key: 'targetDate', width: 15 },
    { header: 'Processing Time', key: 'processingTime', width: 15 },
    { header: 'Responsible', key: 'responsible', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Notes', key: 'notes', width: 30 }
  ];

  const legalItems = [
    {
      category: 'Registration',
      requirement: 'GAFI Investment Registration',
      authority: 'General Authority for Investment',
      documents: 'Business Plan, Founders ID, Residence Proof',
      startDate: '2026-08-01',
      targetDate: '2026-08-30',
      processingTime: '7-14 days',
      responsible: 'Legal Officer',
      status: 'Not Started',
      notes: 'Critical path item - required before MOH application'
    },
    {
      category: 'Healthcare License',
      requirement: 'Ministry of Health Facility License',
      authority: 'Ministry of Health & Population',
      documents: 'License Application, Facility Plans, Clinical Protocols, Staff Credentials, Floor Plans',
      startDate: '2026-08-15',
      targetDate: '2026-10-15',
      processingTime: '30-60 days',
      responsible: 'Healthcare Compliance',
      status: 'Not Started',
      notes: 'CRITICAL - Must be obtained before soft opening'
    },
    {
      category: 'Tax Compliance',
      requirement: 'Egyptian Tax Authority Registration',
      authority: 'Egyptian Tax Authority (ETA)',
      documents: 'Tax ID Application, Business Registration, Identification Documents',
      startDate: '2026-08-15',
      targetDate: '2026-09-15',
      processingTime: '10-15 days',
      responsible: 'Finance Manager',
      status: 'Not Started',
      notes: 'Prerequisite for VAT registration'
    },
    {
      category: 'Tax Compliance',
      requirement: 'VAT Registration',
      authority: 'Egyptian Tax Authority (ETA)',
      documents: 'VAT Registration Application, Tax ID, Business Details',
      startDate: '2026-09-01',
      targetDate: '2026-09-30',
      processingTime: '10-15 days',
      responsible: 'Finance Manager',
      status: 'Not Started',
      notes: 'Required for billing and accounting'
    },
    {
      category: 'Municipal',
      requirement: 'Giza Governorate Zoning Approval',
      authority: 'Giza Governorate Authority',
      documents: 'Zoning Application, Facility Location Map, Building Plans',
      startDate: '2026-08-15',
      targetDate: '2026-09-30',
      processingTime: '15-30 days',
      responsible: 'Facilities Manager',
      status: 'Not Started',
      notes: 'Required before construction can begin'
    },
    {
      category: 'Municipal',
      requirement: 'Building Construction Permit',
      authority: 'Giza Governorate Building Authority',
      documents: 'Building Permit Application, Architectural Drawings, Engineer Approval',
      startDate: '2026-08-20',
      targetDate: '2026-10-15',
      processingTime: '20-40 days',
      responsible: 'Facilities Manager',
      status: 'Not Started',
      notes: 'Needed for renovation/construction activities'
    },
    {
      category: 'Safety & Civil Defense',
      requirement: 'Fire Safety Certification',
      authority: 'Egyptian Civil Defense Authority',
      documents: 'Fire Safety Plan, Emergency Procedures, Floor Plans, Inspection Reports',
      startDate: '2026-09-15',
      targetDate: '2026-10-30',
      processingTime: '20-40 days',
      responsible: 'Safety Officer',
      status: 'Not Started',
      notes: 'CRITICAL - Required before facility operations'
    },
    {
      category: 'Safety & Civil Defense',
      requirement: 'Emergency Evacuation Procedures Approval',
      authority: 'Egyptian Civil Defense Authority',
      documents: 'Evacuation Plan, Drill Procedures, Staff Training Records',
      startDate: '2026-10-01',
      targetDate: '2026-11-15',
      processingTime: '30-45 days',
      responsible: 'Safety Officer',
      status: 'Not Started',
      notes: 'Must be integrated with MOH requirements'
    },
    {
      category: 'Environmental',
      requirement: 'Medical Waste Management Approval',
      authority: 'Egyptian Environmental Affairs Agency',
      documents: 'Waste Management Plan, Treatment Method Details, Contractor Agreement',
      startDate: '2026-09-15',
      targetDate: '2026-11-15',
      processingTime: '20-45 days',
      responsible: 'EHS Officer',
      status: 'Not Started',
      notes: 'Must identify licensed waste management contractor'
    },
    {
      category: 'Insurance',
      requirement: 'Professional Liability Insurance',
      authority: 'Licensed Insurance Companies',
      documents: 'Insurance Policy, Coverage Certificate, Premium Proof',
      startDate: '2026-09-01',
      targetDate: '2026-10-01',
      processingTime: '7-14 days',
      responsible: 'Risk Manager',
      status: 'Not Started',
      notes: 'Minimum coverage recommended: 1M EGP'
    },
    {
      category: 'Insurance',
      requirement: 'General Liability Insurance',
      authority: 'Licensed Insurance Companies',
      documents: 'Insurance Policy, Coverage Certificate, Premium Proof',
      startDate: '2026-09-01',
      targetDate: '2026-10-01',
      processingTime: '7-14 days',
      responsible: 'Risk Manager',
      status: 'Not Started',
      notes: 'Property and operations coverage'
    },
    {
      category: 'Employment',
      requirement: 'Social Insurance Fund (SIF) Registration',
      authority: 'Social Insurance Fund',
      documents: 'Employee Registration Forms, Contracts, Identification Documents',
      startDate: '2026-11-01',
      targetDate: '2026-11-30',
      processingTime: '5-10 days per employee',
      responsible: 'HR Manager',
      status: 'Not Started',
      notes: 'Must be done for all employees before start'
    },
    {
      category: 'Professional Licenses',
      requirement: 'Egyptian Medical Syndicate Registration',
      authority: 'Egyptian Medical Syndicate',
      documents: 'License Verification, Educational Credentials, Professional Certificates',
      startDate: '2026-11-01',
      targetDate: '2027-01-31',
      processingTime: '10-20 days',
      responsible: 'HR Manager',
      status: 'Not Started',
      notes: 'CRITICAL for all clinical staff - required before patient care'
    },
    {
      category: 'Data Protection',
      requirement: 'Data Privacy Compliance (Law 151/2020)',
      authority: 'Ministry of Communications & IT',
      documents: 'Privacy Policy, Data Protection Plan, IT Security Measures',
      startDate: '2026-09-01',
      targetDate: '2026-10-15',
      processingTime: 'Ongoing',
      responsible: 'Data Protection Officer',
      status: 'Not Started',
      notes: 'Continuous compliance throughout operations'
    },
    {
      category: 'Patient Records',
      requirement: 'Clinical Documentation System Approval',
      authority: 'Ministry of Health & Population',
      documents: 'EMR System Details, Security Protocols, Audit Trails',
      startDate: '2026-12-01',
      targetDate: '2027-02-28',
      processingTime: '15-30 days',
      responsible: 'Clinical Ops Manager',
      status: 'Not Started',
      notes: 'Ensure MOH compliance for all documentation'
    }
  ];

  legalItems.forEach(item => {
    sheet.addRow(item);
  });

  await workbook.xlsx.writeFile('/home/user/Sajaa/project_management/English/Legal_Regulatory/02_TRIAD_Legal_Requirements_Checklist_EN.xlsx');
  console.log('✓ Legal Requirements Checklist (Excel) created');
}

// Run all functions
async function main() {
  await createProjectTimeline();
  await createLegalChecklist();
  console.log('\n✓ All supporting schedules and checklists created');
  console.log('  Location: /project_management/English/');
  console.log('  Files: Project Timeline, Legal Checklist, and additional documents');
}

main().catch(console.error);
