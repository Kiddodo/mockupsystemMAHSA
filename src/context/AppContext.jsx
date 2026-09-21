import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_STUDENTS } from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // { role, name, email, studentId }
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [session, setSession] = useState('SEP2026');
  const [selectedProgram, setSelectedProgram] = useState('ALL');
  const [deadline, setDeadline] = useState('2026-09-30');
  const [autoLock, setAutoLock] = useState(false);
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

  // Student Submits Phase 1 Registration
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

  // Student Uploads Document in Phase 3 or Phase 4
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

  // Submit Final Grading
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

  // Check deadline status
  const isDeadlinePassed = () => {
    return new Date(deadline + 'T23:59:59') < new Date();
  };

  const isUploadLocked = () => {
    return autoLock && isDeadlinePassed();
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
        deadline,
        setDeadline,
        autoLock,
        setAutoLock,
        toast,
        showToast,
        toggleFinanceClearance,
        toggleFacultyApproval,
        approveBothClearances,
        submitPhase1Registration,
        updateStudentDocument,
        submitStudentMarks,
        isDeadlinePassed,
        isUploadLocked
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
