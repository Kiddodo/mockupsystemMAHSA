import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue, set, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, isFirebaseEnabled } from '../firebase';
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

// ---------- Firebase helpers ----------
// Realtime Database rejects undefined values and certain key characters.
const clean = (obj) => JSON.parse(JSON.stringify(obj));
const studentKey = (id) => String(id).trim().replace(/[.#$\[\]\/]/g, '_');
const studentsToMap = (list) => Object.fromEntries(list.map(s => [studentKey(s.id), clean(s)]));

// Keep the original roster order; newly imported students go at the end.
const INITIAL_ORDER = new Map(INITIAL_STUDENTS.map((s, i) => [s.id, i]));

// Realtime Database drops null fields, so restore the shape the UI expects.
const normalizeStudent = (s) => ({
  ...s,
  marks: s.marks ?? null,
  rubricScores: s.rubricScores ?? null,
  feedback: s.feedback ?? null,
  registrationData: s.registrationData ?? null,
  stages: Array.from({ length: 4 }, (_, i) => (s.stages && s.stages[i]) || 0),
  documents: {
    salDownloaded: false,
    offerLetter: null,
    reportDuty: null,
    logbook: null,
    finalReport: null,
    supervisorEvaluation: null,
    ...(s.documents || {})
  }
});

export const INITIAL_SESSIONS = [
  { id: 'SEP2026', label: 'Session: Sept 2026', startDate: '2026-09-01', endDate: '2027-01-31' },
  { id: 'MAR2026', label: 'Session: Mar 2026', startDate: '2026-03-01', endDate: '2026-07-31' }
];

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState(isFirebaseEnabled ? [] : INITIAL_STUDENTS);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [session, setSession] = useState('SEP2026');
  const [selectedProgram, setSelectedProgram] = useState('ALL');
  const [deadlines, setDeadlines] = useState(DEFAULT_SUBMISSION_DEADLINES);
  const [toast, setToast] = useState(null);
  // 'local' = no Firebase config, 'connecting', 'online', 'error' = fell back to local data
  const [dbStatus, setDbStatus] = useState(isFirebaseEnabled ? 'connecting' : 'local');
  const useFirebase = isFirebaseEnabled && dbStatus !== 'error';

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

  // Live sync with Firebase Realtime Database
  useEffect(() => {
    if (!isFirebaseEnabled) return;

    let connected = false;
    const handleDbError = (err) => {
      console.error('Firebase error:', err);
      connected = true;
      setStudents(INITIAL_STUDENTS);
      setDbStatus('error');
      showToast(`Could not reach Firebase (${err.message}). Showing local data.`, 'warning');
    };

    // If Firebase doesn't answer within 10 seconds, don't leave the app stuck loading.
    const timeout = setTimeout(() => {
      if (connected) return;
      setStudents(INITIAL_STUDENTS);
      setDbStatus('error');
      showToast('Firebase is not responding. Showing local data — changes will not be saved.', 'warning');
    }, 10000);

    const studentsRef = ref(db, 'students');
    const unsubStudents = onValue(studentsRef, (snap) => {
      connected = true;
      if (!snap.exists()) {
        // First run: upload the full roster from mockData.js
        set(studentsRef, studentsToMap(INITIAL_STUDENTS)).catch(handleDbError);
        return;
      }
      const list = Object.values(snap.val()).map(normalizeStudent);
      list.sort((a, b) => (INITIAL_ORDER.get(a.id) ?? Infinity) - (INITIAL_ORDER.get(b.id) ?? Infinity));
      setStudents(list);
      setDbStatus('online');
    }, handleDbError);

    const deadlinesRef = ref(db, 'settings/deadlines');
    const unsubDeadlines = onValue(deadlinesRef, (snap) => {
      if (!snap.exists()) {
        set(deadlinesRef, clean(DEFAULT_SUBMISSION_DEADLINES)).catch(handleDbError);
        return;
      }
      setDeadlines({ ...DEFAULT_SUBMISSION_DEADLINES, ...snap.val() });
    }, handleDbError);

    return () => {
      clearTimeout(timeout);
      unsubStudents();
      unsubDeadlines();
    };
  }, []);

  // Save one student (Firebase, or local state when offline)
  const updateStudent = (studentId, updater) => {
    const current = students.find(s => s.id === studentId);
    if (!current) return;
    const next = updater(current);
    if (useFirebase) {
      set(ref(db, `students/${studentKey(studentId)}`), clean(next))
        .catch(err => showToast(`Save failed: ${err.message}`, 'warning'));
    } else {
      setStudents(prev => prev.map(s => (s.id === studentId ? next : s)));
    }
  };

  const saveDeadlines = (next) => {
    if (useFirebase) {
      set(ref(db, 'settings/deadlines'), clean(next))
        .catch(err => showToast(`Save failed: ${err.message}`, 'warning'));
    } else {
      setDeadlines(next);
    }
  };

  // Individual deadline (date + time) and auto-lock methods
  const updateSubmissionDeadline = (key, newDate, newTime) => {
    const prevItem = deadlines[key];
    saveDeadlines({
      ...deadlines,
      [key]: {
        ...prevItem,
        date: newDate !== undefined ? newDate : prevItem.date,
        time: newTime !== undefined ? newTime : (prevItem.time || '23:59')
      }
    });
    showToast(`Deadline for ${prevItem?.title} updated to ${newDate || prevItem.date} at ${newTime || prevItem.time || '23:59'}.`, 'success');
  };

  const toggleSubmissionAutoLock = (key) => {
    const item = deadlines[key];
    saveDeadlines({ ...deadlines, [key]: { ...item, autoLock: !item.autoLock } });
    showToast(`Auto-lock for ${item?.title} ${!item?.autoLock ? 'enabled' : 'disabled'}.`, 'info');
  };

  const setAllAutoLocks = (enable) => {
    const updated = {};
    Object.keys(deadlines).forEach(k => {
      updated[k] = { ...deadlines[k], autoLock: enable };
    });
    saveDeadlines(updated);
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
    updateStudent(studentId, s => {
      const nextState = !s.financeCleared;
      const bothCleared = nextState && s.facultyApproved;
      const newPhase = bothCleared && s.phase === 1 ? 2 : (s.phase === 2 && !nextState ? 1 : s.phase);
      return {
        ...s,
        financeCleared: nextState,
        phase: newPhase,
        stages: bothCleared ? [1, 1, s.stages[2], s.stages[3]] : s.stages
      };
    });
    showToast('Finance (Bursary) status updated.', 'success');
  };

  const toggleFacultyApproval = (studentId) => {
    updateStudent(studentId, s => {
      const nextState = !s.facultyApproved;
      const bothCleared = s.financeCleared && nextState;
      const newPhase = bothCleared && s.phase === 1 ? 2 : (s.phase === 2 && !nextState ? 1 : s.phase);
      return {
        ...s,
        facultyApproved: nextState,
        phase: newPhase,
        stages: bothCleared ? [1, 1, s.stages[2], s.stages[3]] : s.stages
      };
    });
    showToast('Faculty Academic Eligibility status updated.', 'success');
  };

  const approveBothClearances = (studentId) => {
    updateStudent(studentId, s => ({
      ...s,
      financeCleared: true,
      facultyApproved: true,
      phase: s.phase === 1 ? 2 : s.phase,
      stages: [1, 1, s.stages[2], s.stages[3]]
    }));
    showToast('Student granted both Finance & Faculty approvals. Phase 2 unlocked!', 'success');
  };

  const submitPhase1Registration = (studentId, formData) => {
    updateStudent(studentId, s => ({
      ...s,
      phase1Submitted: true,
      registrationData: formData,
      stages: [1, s.stages[1], s.stages[2], s.stages[3]]
    }));
    showToast('Registration submitted! Awaiting Finance and Faculty clearance.', 'success');
  };

  // docValue: applies the document (name/url/size) to a student record and
  // advances phase/stage tracking, shared by both the Storage and local paths.
  const applyStudentDocument = (studentId, docKey, docValue, advancePhaseTo) => {
    updateStudent(studentId, s => {
      const updatedDocs = { ...s.documents, [docKey]: docValue };
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
    });
  };

  // file is a real File object selected by the student.
  // When Firebase Storage is configured, it's uploaded there so coordinators
  // and lecturers on any device get a real, working download link. Otherwise
  // we fall back to an in-memory object URL, which only works for viewers in
  // this same browser tab/session (no backend to share it through).
  const updateStudentDocument = async (studentId, docKey, file, advancePhaseTo = null) => {
    if (useFirebase && storage) {
      showToast(`Uploading ${file.name}...`, 'info');
      try {
        const path = `students/${studentKey(studentId)}/${docKey}/${Date.now()}_${file.name}`;
        const fileRef = storageRef(storage, path);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        applyStudentDocument(studentId, docKey, {
          name: file.name,
          url,
          size: file.size,
          uploadedAt: new Date().toISOString()
        }, advancePhaseTo);
        showToast(`${file.name} uploaded successfully.`, 'success');
      } catch (err) {
        console.error('Firebase Storage upload error:', err);
        // Graceful fallback: show the file on screen so user testing isn't blocked
        applyStudentDocument(studentId, docKey, {
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          uploadedAt: new Date().toISOString()
        }, advancePhaseTo);
        showToast(`Saved locally only. (Enable Firebase Storage in Firebase Console for cloud upload)`, 'warning');
      }
      return;
    }

    // Local fallback (no Firebase Storage configured)
    const current = students.find(s => s.id === studentId);
    const existing = current?.documents?.[docKey];
    if (existing?.url && existing.url.startsWith('blob:')) {
      URL.revokeObjectURL(existing.url);
    }
    applyStudentDocument(studentId, docKey, {
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      uploadedAt: new Date().toISOString()
    }, advancePhaseTo);
    showToast(`${file.name} uploaded successfully (local only — not saved to Firebase Storage).`, 'success');
  };

  // Deletes an uploaded document: removes the real file from Firebase Storage
  // (or revokes the local blob URL when Storage wasn't used) and clears the
  // field on the student record.
  const removeStudentDocument = async (studentId, docKey) => {
    const current = students.find(s => s.id === studentId);
    const existing = current?.documents?.[docKey];
    if (!existing) return;

    try {
      if (existing.url?.startsWith('blob:')) {
        URL.revokeObjectURL(existing.url);
      } else if (existing.url && storage) {
        await deleteObject(storageRef(storage, existing.url));
      }
    } catch (err) {
      // File may already be gone from Storage (e.g. deleted manually) — that's fine,
      // we still want to clear the field either way.
      console.warn('Storage delete warning:', err.message);
    }

    updateStudent(studentId, s => ({
      ...s,
      documents: { ...s.documents, [docKey]: null }
    }));
    showToast(`${existing.name || 'Document'} removed.`, 'info');
  };

  const submitStudentMarks = (studentId, { total, rubricScores, feedback, recommendation }) => {
    updateStudent(studentId, s => ({
      ...s,
      marks: total,
      rubricScores,
      feedback,
      recommendation,
      stages: [1, 1, 1, 1]
    }));
    showToast(`Final grade of ${total}% recorded for student.`, 'success');
  };

  const importStudents = (importedList) => {
    if (!Array.isArray(importedList) || importedList.length === 0) return { addedCount: 0, updatedCount: 0 };
    
    let addedCount = 0;
    let updatedCount = 0;
    const studentMap = new Map(students.map(s => [s.id.toLowerCase(), s]));
    const changed = {};

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
      changed[studentKey(newStudent.id)] = clean(newStudent);
    });

    if (useFirebase) {
      update(ref(db, 'students'), changed)
        .catch(err => showToast(`Import failed to save: ${err.message}`, 'warning'));
    } else {
      setStudents(Array.from(studentMap.values()));
    }

    const msg = `CSV Import completed: ${addedCount} added, ${updatedCount} updated.`;
    showToast(msg, 'success');
    return { addedCount, updatedCount };
  };

  // Add individual student
  const addStudent = (studentData) => {
    if (!studentData?.id || !studentData?.name) {
      showToast('Matric ID and Full Name are required.', 'warning');
      return { success: false, message: 'Matric ID and Full Name are required.' };
    }

    const cleanId = studentData.id.trim();
    const key = cleanId.toLowerCase();
    const existing = students.find(s => s.id.trim().toLowerCase() === key);
    if (existing) {
      showToast(`Student with ID ${cleanId} already exists.`, 'warning');
      return { success: false, message: `Student with ID ${cleanId} already exists.` };
    }

    const financeCleared = Boolean(studentData.financeCleared);
    const facultyApproved = Boolean(studentData.facultyApproved);
    const bothCleared = financeCleared && facultyApproved;
    const phase = Number(studentData.phase) || (bothCleared ? 2 : 1);

    const newStudent = normalizeStudent({
      id: cleanId,
      name: studentData.name.trim(),
      program: (studentData.program || 'DHRM').toUpperCase().trim(),
      cgpa: parseFloat(studentData.cgpa) || 3.00,
      credits: parseInt(studentData.credits, 10) || 60,
      company: studentData.company?.trim() || 'Pending Placement',
      lecturer: studentData.lecturer?.trim() || 'Dr. Rahman',
      session: studentData.session || session,
      financeCleared,
      facultyApproved,
      phase1Submitted: true,
      phase: phase,
      stages: [1, bothCleared ? 1 : 0, 0, 0],
      marks: null,
      rubricScores: null,
      feedback: null,
      registrationData: {
        icPassport: studentData.icPassport?.trim() || '',
        phone: studentData.phone?.trim() || '',
        email: studentData.email?.trim() || `${studentData.name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@student.mahsa.edu.my`,
        preferredIndustry: studentData.preferredIndustry?.trim() || 'General Management',
        preferredLocation: studentData.preferredLocation?.trim() || 'Kuala Lumpur / Selangor',
        emergencyContact: studentData.emergencyContact?.trim() || ''
      },
      documents: {
        salDownloaded: bothCleared,
        offerLetter: null,
        reportDuty: null,
        logbook: null,
        finalReport: null,
        supervisorEvaluation: null
      }
    });

    if (useFirebase) {
      set(ref(db, `students/${studentKey(newStudent.id)}`), clean(newStudent))
        .catch(err => showToast(`Failed to save to database: ${err.message}`, 'warning'));
    } else {
      setStudents(prev => [newStudent, ...prev]);
    }

    showToast(`Student ${newStudent.name} (${newStudent.id}) registered successfully!`, 'success');
    return { success: true, student: newStudent };
  };

  // Add new academic session
  const addSession = (sessionData) => {
    if (!sessionData?.id || !sessionData?.label) {
      showToast('Session Code and Label are required.', 'warning');
      return false;
    }

    const cleanId = sessionData.id.trim().toUpperCase();
    if (sessions.some(s => s.id === cleanId)) {
      showToast(`Session ${cleanId} already exists.`, 'warning');
      return false;
    }

    const newSession = {
      id: cleanId,
      label: sessionData.label.trim(),
      startDate: sessionData.startDate || '',
      endDate: sessionData.endDate || ''
    };

    setSessions(prev => [newSession, ...prev]);
    setSession(cleanId);
    showToast(`New session "${newSession.label}" created and activated!`, 'success');
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        students,
        currentStudent,
        sessions,
        session,
        setSession,
        addSession,
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
        removeStudentDocument,
        submitStudentMarks,
        importStudents,
        addStudent,
        dbStatus
      }}
    >
      {dbStatus === 'connecting' ? (
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Connecting to database…
        </div>
      ) : children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
