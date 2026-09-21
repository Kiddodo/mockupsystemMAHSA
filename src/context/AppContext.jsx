import React, { createContext, useContext, useState } from 'react';
import { INITIAL_STUDENTS } from '../data/mockData';

const AppContext = createContext();

export const DEFAULT_SUBMISSION_DEADLINES = {
  phase1_registration: {
    title: 'Registration & Re-Enrolment Form',
    phase: 1,
    date: '2026-09-15',
    autoLock: false,
    description: 'Student personal academic registration and dual-clearance initiation.'
  },
  phase3_offer: {
    title: 'Company Offer Letter & Reply Form',
    phase: 3,
    date: '2026-09-30',
    autoLock: false,
    description: 'Signed industrial placement offer letter from employer.'
  },
  phase3_duty: {
    title: 'Endorsed Report Duty Form',
    phase: 3,
    date: '2026-10-14',
    autoLock: false,
    description: 'Signed confirmation of commencement within first 14 days of placement.'
  },
  phase4_logbook: {
    title: 'Completed Weekly Logbook',
    phase: 4,
    date: '2026-11-20',
    autoLock: false,
    description: '12-week verified daily reflection entries and supervisor sign-offs.'
  },
  phase4_report: {
    title: 'Final Internship Report',
    phase: 4,
    date: '2026-11-25',
    autoLock: false,
    description: 'Comprehensive 5-chapter report with executive summary.'
  },
  phase4_evaluation: {
    title: 'Industry Supervisor Evaluation Form',
    phase: 4,
    date: '2026-11-30',
    autoLock: false,
    description: 'Confidential conduct and performance rubric scored by host mentor.'
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

  // Individual deadline and auto-lock methods
  const updateSubmissionDeadline = (key, newDate) => {
    setDeadlines(prev => ({
      ...prev,
      [key]: { ...prev[key], date: newDate }
    }));
    showToast(`Deadline for ${deadlines[key]?.title} updated to ${newDate}.`, 'success');
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
    return new Date(item.date + 'T23:59:59') < new Date();
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
        toast,
        showToast,
        toggleFinanceClearance,
        toggleFacultyApproval,
        approveBothClearances,
        submitPhase1Registration,
        updateStudentDocument,
        submitStudentMarks
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);