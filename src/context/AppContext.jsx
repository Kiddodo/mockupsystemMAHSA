import React, { createContext, useContext, useState } from 'react';
import { INITIAL_STUDENTS } from '../data/mockData';

const AppContext = createContext();

export const DEFAULT_SUBMISSION_DEADLINES = {
  phase1_registration: {
    title: 'Registration & Re-Enrolment Form',
    phase: 1,
    date: '2026-09-15',
    time: '23:59',
    autoLock: false,
    description: 'Student personal academic registration and dual-clearance initiation.'
  },
  phase3_offer: {
    title: 'Company Offer Letter & Reply Form',
    phase: 3,
    date: '2026-09-30',
    time: '17:00',
    autoLock: false,
    description: 'Signed industrial placement offer letter from employer.'
  },
  phase3_duty: {
    title: 'Endorsed Report Duty Form',
    phase: 3,
    date: '2026-10-14',
    time: '23:59',
    autoLock: false,
    description: 'Signed confirmation of commencement within first 14 days of placement.'
  },
  phase4_logbook: {
    title: 'Completed Weekly Logbook',
    phase: 4,
    date: '2026-11-20',
    time: '23:59',
    autoLock: false,
    description: '12-week verified daily reflection entries and supervisor sign-offs.'
  },
  phase4_report: {
    title: 'Final Internship Report',
    phase: 4,
    date: '2026-11-25',
    time: '17:00',
    autoLock: false,
    description: 'Comprehensive 5-chapter report with executive summary.'
  },
  phase4_evaluation: {
    title: 'Industry Supervisor Evaluation Form',
    phase: 4,
    date: '2026-11-30',
    time: '23:59',
    autoLock: false,
    description: 'Confidential conduct and performance rubric scored by host mentor.'
  }
};

export const formatDeadline = (dateStr, timeStr = '23:59') => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    const [hours, minutes] = (timeStr || '23:59').split(':');
    const d = new Date(year, month - 1, day, hours, minutes);
    const dateFormatted = d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeFormatted = d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dateFormatted}, ${timeFormatted}`;
  } catch (e) {
    return `${dateStr} ${timeStr || ''}`.trim();
  }
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [session, setSession] = useState('SEP2026');
  const [selectedProgram, setSelectedProgram] = useState('ALL');
  const [deadlines, setDeadlines] = useState(DEFAULT_SUBMISSION_DEADLINES);
  const [toast, setToast] = useState(null);

  // Active student for student view (defaults to Abdul Halim)
  const currentStudent = currentUser?.role === 'student' 
    ? students.find(s => s.id === currentUser.studentId) || students[0]
    : students[0];

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Individual deadline (date + time) and auto-lock methods
  const updateSubmissionDeadline = (key, newDate, newTime) => {
    setDeadlines(prev => ({
      ...prev,
      [key]: { 
        ...prev[key], 
        date: newDate !== undefined ? newDate : prev[key].date,
        time: newTime !== undefined ? newTime : (prev[key].time || '23:59')
      }
    }));
    const item = deadlines[key];
    showToast(`Deadline for ${item?.title} updated to ${newDate || item.date} at ${newTime || item.time || '23:59'}.`, 'success');
  };

  const toggleSubmissionAutoLock = (key) => {
    setDeadlines(prev => {
      const nextState = !prev[key].autoLock;
      return {
        ...prev,
        [key]: { ...prev[key], autoLock: nextState }
      };
    });
    const item = deadlines[key];
    showToast(`Auto-lock for ${item?.title} ${!item?.autoLock ? 'enabled' : 'disabled'}.`, 'info');
  };

  const setAllAutoLocks = (enable) => {
    setDeadlines(prev => {
      const updated = {};
      Object.keys(prev).forEach(k => {
        updated[k] = { ...prev[k], autoLock: enable };
      });
      return updated;
    });
    showToast(`All submission auto-locks ${enable ? 'enabled' : 'disabled'}.`, 'info');
  };

  const isSubmissionDeadlinePassed = (key) => {
    const item = deadlines[key];
    if (!item || !item.date) return false;
    const timeStr = item.time || '23:59';
    return new Date(`${item.date}T${timeStr}:00`) < new Date();
  };

  const isSubmissionLocked = (key) => {
    const item = deadlines[key];
    if (!item) return false;
    return item.autoLock && isSubmissionDeadlinePassed(key);
  };

  // Approval Handlers for Coordinator
  const toggleFinanceClearance = (studentId) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const nextState = !s.financeCleared;
        const bothCleared = nextState && s.facultyApproved;
        const newPhase = bothCleared && s.phase === 1 ? 2 : (s.phase === 2 && !nextState ? 1 : s.phase);
        return {
          ...s,
          financeCleared: nextState,
          phase: newPhase,
          stages: bothCleared ? [1, 1, s.stages[2], s.stages[3]] : s.stages
        };
      }
      return s;
    }));
    showToast('Finance (Bursary) status updated.', 'success');
  };

  const toggleFacultyApproval = (studentId) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const nextState = !s.facultyApproved;
        const bothCleared = s.financeCleared && nextState;
        const newPhase = bothCleared && s.phase === 1 ? 2 : (s.phase === 2 && !nextState ? 1 : s.phase);
        return {
          ...s,
          facultyApproved: nextState,
          phase: newPhase,
          stages: bothCleared ? [1, 1, s.stages[2], s.stages[3]] : s.stages
        };
      }
      return s;
    }));
    showToast('Faculty Academic Eligibility status updated.', 'success');
  };

  const approveBothClearances = (studentId) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          financeCleared: true,
          facultyApproved: true,
          phase: s.phase === 1 ? 2 : s.phase,
          stages: [1, 1, s.stages[2], s.stages[3]]
        };
      }
      return s;
    }));
    showToast('Student granted both Finance & Faculty approvals. Phase 2 unlocked!', 'success');
  };

  const submitPhase1Registration = (studentId, formData) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          phase1Submitted: true,
          registrationData: formData,
          stages: [1, s.stages[1], s.stages[2], s.stages[3]]
        };
      }
      return s;
    }));
    showToast('Registration submitted! Awaiting Finance and Faculty clearance.', 'success');
  };

  const updateStudentDocument = (studentId, docKey, filename, advancePhaseTo = null) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updatedDocs = { ...s.documents, [docKey]: filename };
        let newStages = [...s.stages];
        if (docKey === 'offerLetter') newStages[1] = 1;
        if (docKey === 'reportDuty') newStages[2] = 1;
        if (docKey === 'finalReport' || docKey === 'logbook') newStages[3] = 1;

        return {
          ...s,
          documents: updatedDocs,
          stages: newStages,
          phase: advancePhaseTo ? Math.max(s.phase, advancePhaseTo) : s.phase
        };
      }
      return s;
    }));
    showToast(`${filename} uploaded successfully.`, 'success');
  };

  const submitStudentMarks = (studentId, { total, rubricScores, feedback, recommendation }) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          marks: total,
          rubricScores,
          feedback,
          recommendation,
          stages: [1, 1, 1, 1]
        };
      }
      return s;
    }));
    showToast(`Final grade of ${total}% recorded for student.`, 'success');
  };

  const importStudents = (importedList) => {
    if (!Array.isArray(importedList) || importedList.length === 0) return { addedCount: 0, updatedCount: 0 };
    
    let addedCount = 0;
    let updatedCount = 0;

    setStudents(prev => {
      const studentMap = new Map(prev.map(s => [s.id.toLowerCase(), s]));

      importedList.forEach(item => {
        if (!item.id || !item.name) return;

        const key = item.id.trim().toLowerCase();
        const existing = studentMap.get(key);
        const financeCleared = item.financeCleared === true || String(item.financeCleared).toLowerCase() === 'true' || item.financeCleared === 1 || String(item.financeCleared).toLowerCase() === 'yes';
        const facultyApproved = item.facultyApproved === true || String(item.facultyApproved).toLowerCase() === 'true' || item.facultyApproved === 1 || String(item.facultyApproved).toLowerCase() === 'yes';
        const bothCleared = financeCleared && facultyApproved;
        const phase = Number(item.phase) || (bothCleared ? 2 : 1);

        const newStudent = {
          id: item.id.trim(),
          name: item.name.trim(),
          program: (item.program || existing?.program || 'DHRM').toUpperCase().trim(),
          cgpa: parseFloat(item.cgpa) || existing?.cgpa || 3.00,
          credits: parseInt(item.credits, 10) || existing?.credits || 60,
          company: item.company?.trim() || existing?.company || 'Pending Placement',
          lecturer: item.lecturer?.trim() || existing?.lecturer || 'Dr. Rahman',
          financeCleared,
          facultyApproved,
          phase1Submitted: true,
          phase: phase,
          stages: existing ? existing.stages : [1, bothCleared ? 1 : 0, 0, 0],
          marks: item.marks ? Number(item.marks) : (existing ? existing.marks : null),
          rubricScores: existing ? existing.rubricScores : null,
          feedback: existing ? existing.feedback : null,
          registrationData: existing?.registrationData || {
            icPassport: item.icPassport || '',
            phone: item.phone || '',
            email: item.email || `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@student.mahsa.edu.my`,
            preferredIndustry: item.preferredIndustry || 'Human Resources & Administration',
            preferredLocation: item.preferredLocation || 'Kuala Lumpur / Selangor',
            emergencyContact: ''
          },
          documents: existing?.documents || {
            salDownloaded: bothCleared,
            offerLetter: item.offerLetter || null,
            reportDuty: item.reportDuty || null,
            logbook: null,
            finalReport: null,
            supervisorEvaluation: null
          }
        };

        if (existing) {
          updatedCount++;
        } else {
          addedCount++;
        }
        studentMap.set(key, newStudent);
      });

      return Array.from(studentMap.values());
    });

    const msg = `CSV Import completed: ${addedCount} added, ${updatedCount} updated.`;
    showToast(msg, 'success');
    return { addedCount, updatedCount };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        students,
        currentStudent,
        session,
        setSession,
        selectedProgram,
        setSelectedProgram,
        deadlines,
        updateSubmissionDeadline,
        toggleSubmissionAutoLock,
        setAllAutoLocks,
        isSubmissionDeadlinePassed,
        isSubmissionLocked,
        formatDeadline,
        toast,
        showToast,
        toggleFinanceClearance,
        toggleFacultyApproval,
        approveBothClearances,
        submitPhase1Registration,
        updateStudentDocument,
        submitStudentMarks,
        importStudents
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);