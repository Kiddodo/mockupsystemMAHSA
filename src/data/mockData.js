export const INITIAL_STUDENTS = [
  {
    id: '24-DHRM-0234',
    name: 'Abdul Halim Bin Tamar',
    program: 'DHRM',
    cgpa: 3.42,
    credits: 64,
    company: 'Grand Hyatt Kuala Lumpur',
    lecturer: 'Dr. Rahman',
    financeCleared: false,
    facultyApproved: false,
    phase1Submitted: true,
    phase: 1, // 1 to 4
    stages: [1, 0, 0, 0], // pre, offer, duty, post
    marks: null,
    rubricScores: null,
    feedback: null,
    registrationData: {
      icPassport: '040812-14-5589',
      phone: '+60 12-345 6789',
      email: 'abdul.halim@student.mahsa.edu.my',
      preferredIndustry: 'Hospitality Human Resources',
      preferredLocation: 'Kuala Lumpur / Selangor',
      emergencyContact: 'Tamar Bin Hassan (Father) - +60 19-876 5432'
    },
    documents: {
      salDownloaded: false,
      offerLetter: null,
      reportDuty: null,
      logbook: null,
      finalReport: null,
      supervisorEvaluation: null
    }
  },
  {
    id: '24-DHRM-0145',
    name: 'Siti Aisyah Binti Malik',
    program: 'DHRM',
    cgpa: 3.65,
    credits: 72,
    company: 'Marriott Hotels Malaysia',
    lecturer: 'Dr. Rahman',
    financeCleared: true,
    facultyApproved: true,
    phase1Submitted: true,
    phase: 3,
    stages: [1, 1, 1, 0],
    marks: null,
    registrationData: {
      icPassport: '040523-10-6644',
      phone: '+60 13-987 6543',
      email: 'siti.aisyah@student.mahsa.edu.my',
      preferredIndustry: 'Talent Acquisition & HR',
      preferredLocation: 'Petaling Jaya',
      emergencyContact: 'Malik Bin Ahmad (Father) - +60 12-443 2211'
    },
    documents: {
      salDownloaded: true,
      offerLetter: 'Offer_Letter_Marriott.pdf',
      reportDuty: 'Report_Duty_Signed.pdf',
      logbook: null,
      finalReport: null,
      supervisorEvaluation: null
    }
  },
  {
    id: '24-DHRM-0302',
    name: 'Muhammad Fariz Hakim',
    program: 'DHRM',
    cgpa: 3.20,
    credits: 68,
    company: 'Hilton Kuala Lumpur',
    lecturer: 'Dr. Rahman',
    financeCleared: true,
    facultyApproved: true,
    phase1Submitted: true,
    phase: 4,
    stages: [1, 1, 1, 1],
    marks: 88,
    registrationData: {
      icPassport: '040219-14-7711',
      phone: '+60 17-223 4455',
      email: 'fariz.hakim@student.mahsa.edu.my',
      preferredIndustry: 'Corporate HR Relations',
      preferredLocation: 'Kuala Lumpur',
      emergencyContact: 'Hakim Bin Rosli (Father) - +60 11-2233 4455'
    },
    documents: {
      salDownloaded: true,
      offerLetter: 'Hilton_OfferLetter.pdf',
      reportDuty: 'Hilton_ReportDuty_Endorsed.pdf',
      logbook: 'Fariz_Complete_Logbook.pdf',
      finalReport: 'Fariz_Internship_Report_Final.pdf',
      supervisorEvaluation: 'Supervisor_Eval_Hilton.pdf'
    }
  },
  {
    id: '24-DBA-0089',
    name: 'Lim Wei Xiang',
    program: 'DBA',
    cgpa: 3.80,
    credits: 76,
    company: 'Deloitte Malaysia',
    lecturer: 'Prof. Lee',
    financeCleared: true,
    facultyApproved: false,
    phase1Submitted: true,
    phase: 1,
    stages: [1, 0, 0, 0],
    marks: null,
    registrationData: {
      icPassport: '040311-14-1123',
      phone: '+60 16-778 9900',
      email: 'lim.weixiang@student.mahsa.edu.my',
      preferredIndustry: 'Business Advisory & Audit',
      preferredLocation: 'Damansara',
      emergencyContact: 'Lim Boon Kiat (Father) - +60 12-887 6655'
    },
    documents: {
      salDownloaded: false,
      offerLetter: null,
      reportDuty: null,
      logbook: null,
      finalReport: null,
      supervisorEvaluation: null
    }
  },
  {
    id: '24-BBA-0056',
    name: 'Rajesh Kumar Pillai',
    program: 'BBA',
    cgpa: 2.95,
    credits: 58,
    company: 'Petronas Dagangan',
    lecturer: 'Mdm. Chan',
    financeCleared: false,
    facultyApproved: false,
    phase1Submitted: false,
    phase: 1,
    stages: [0, 0, 0, 0],
    marks: null,
    registrationData: null,
    documents: {
      salDownloaded: false,
      offerLetter: null,
      reportDuty: null,
      logbook: null,
      finalReport: null,
      supervisorEvaluation: null
    }
  }
];

export const DEMO_CREDENTIALS = [
  { role: 'coordinator', email: 'coordinator@mahsa.edu.my', password: 'mahsa2026', label: 'Coordinator Admin' },
  { role: 'lecturer', email: 'dr.rahman@mahsa.edu.my', password: 'lecturer123', label: 'Lecturer / Supervisor (Dr. Rahman)' },
  { role: 'student', email: 'abdul.halim@student.mahsa.edu.my', password: 'student123', label: 'Student (Abdul Halim - Phase 1)' }
];
