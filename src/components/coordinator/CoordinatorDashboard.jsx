import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, CheckCircle, Clock, Building2, Upload, FileSpreadsheet, 
  Lock, Unlock, Search, ShieldCheck, Mail, FolderOpen, AlertCircle,
  Calendar, Check, SlidersHorizontal, ShieldAlert, Sparkles
} from 'lucide-react';

export const CoordinatorDashboard = () => {
  const { 
    students, session, selectedProgram, deadlines, 
    updateSubmissionDeadline, toggleSubmissionAutoLock, setAllAutoLocks,
    isSubmissionDeadlinePassed, isSubmissionLocked,
    toggleFinanceClearance, toggleFacultyApproval, showToast 
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterClearance, setFilterClearance] = useState('ALL');
  const [selectedFolderStudent, setSelectedFolderStudent] = useState(null);
  const [emailModalStudent, setEmailModalStudent] = useState(null);
  const [deadlineTab, setDeadlineTab] = useState('ALL'); // ALL, PHASE1, PHASE3, PHASE4

  // Statistics
  const totalStudents = students.length;
  const fullyCleared = students.filter(s => s.financeCleared && s.facultyApproved).length;
  const pendingFinance = students.filter(s => !s.financeCleared).length;
  const pendingFaculty = students.filter(s => !s.facultyApproved).length;

  // Filtered roster
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchesProgram = selectedProgram === 'ALL' || s.program === selectedProgram;
    
    let matchesClearance = true;
    if (filterClearance === 'PENDING_FINANCE') matchesClearance = !s.financeCleared;
    if (filterClearance === 'PENDING_FACULTY') matchesClearance = !s.facultyApproved;
    if (filterClearance === 'CLEARED') matchesClearance = s.financeCleared && s.facultyApproved;

    return matchesSearch && matchesProgram && matchesClearance;
  });

  const deadlineEntries = Object.entries(deadlines).filter(([key, val]) => {
    if (deadlineTab === 'ALL') return true;
    if (deadlineTab === 'PHASE1') return val.phase === 1;
    if (deadlineTab === 'PHASE3') return val.phase === 3;
    if (deadlineTab === 'PHASE4') return val.phase === 4;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">Coordinator Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Session: <strong className="text-slate-700">{session}</strong> · Individual Submission Gating & Clearances
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => showToast('Student list imported from CSV (12 records synced).', 'success')}
            className="px-3.5 py-2 bg-[#003DA5] hover:bg-[#002a74] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet size={15} />
            <span>Import Student CSV</span>
          </button>
          <button
            onClick={() => showToast('Faculty templates uploaded to SharePoint repository.', 'info')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Upload size={15} />
            <span>Upload Templates</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</span>
            <div className="w-8 h-8 bg-blue-50 text-[#003DA5] rounded-lg flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-800 mt-2">{totalStudents}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active candidates</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fully Cleared</span>
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{fullyCleared}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Bursary & Faculty endorsed</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bursary Holds</span>
            <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">{pendingFinance}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pending fee clearance</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty Holds</span>
            <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-600 mt-2">{pendingFaculty}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pending credit verification</div>
        </div>
      </div>

      {/* NEW: Individual Submission Deadlines & Auto-Lock Control Manager */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-[#003DA5]" />
              <h3 className="font-extrabold text-base text-slate-800">Individual Submission Cut-offs & Auto-Lock Control</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure independent deadlines and automated lockout rules for each submission tab.
            </p>
          </div>

          {/* Quick Global Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAllAutoLocks(true)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
            >
              Arm All Auto-Locks
            </button>
            <button
              onClick={() => setAllAutoLocks(false)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
            >
              Disable All Auto-Locks
            </button>
          </div>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex space-x-2 my-4">
          {[
            { id: 'ALL', label: 'All Submissions (6)' },
            { id: 'PHASE1', label: 'Phase 1 (Registration)' },
            { id: 'PHASE3', label: 'Phase 3 (Placement)' },
            { id: 'PHASE4', label: 'Phase 4 (Final Evaluation)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDeadlineTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                deadlineTab === tab.id 
                  ? 'bg-[#003DA5] text-white' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Individual Deadlines Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deadlineEntries.map(([key, item]) => {
            const isPassed = isSubmissionDeadlinePassed(key);
            const isLocked = isSubmissionLocked(key);

            return (
              <div 
                key={key} 
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  isLocked ? 'bg-red-50/50 border-red-200' : item.autoLock ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      Phase {item.phase}
                    </span>
                    {/* Status Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isLocked 
                        ? 'bg-red-100 text-red-700 border-red-300' 
                        : item.autoLock 
                        ? 'bg-blue-100 text-blue-700 border-blue-300' 
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {isLocked ? '🔒 Locked (Expired)' : item.autoLock ? '🛡️ Auto-Lock Armed' : '🔓 Open (Manual)'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">{item.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-3">
                  {/* Date Input */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                      Cut-off Date:
                    </label>
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => updateSubmissionDeadline(key, e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-[#003DA5] outline-none shadow-sm"
                    />
                  </div>

                  {/* Auto-lock Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Auto-Lock Uploads:</span>
                    <button
                      type="button"
                      onClick={() => toggleSubmissionAutoLock(key)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        item.autoLock 
                          ? 'bg-red-600 text-white shadow-sm' 
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {item.autoLock ? <Lock size={12} /> : <Unlock size={12} />}
                      <span>{item.autoLock ? 'Enabled' : 'Disabled'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Centralized Clearance & Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-extrabold text-base text-slate-800">Student Roster & Clearance Endorsement</h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {filteredStudents.length} Students
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or ID..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
              />
            </div>

            <select
              value={filterClearance}
              onChange={(e) => setFilterClearance(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Clearances</option>
              <option value="PENDING_FINANCE">Pending Finance (Bursary)</option>
              <option value="PENDING_FACULTY">Pending Faculty</option>
              <option value="CLEARED">Fully Cleared (Phase 2+)</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="p-4">Student Name & ID</th>
                <th className="p-4">Prog / CGPA</th>
                <th className="p-4">Host Company</th>
                <th className="p-4 text-center">Finance (Bursary)</th>
                <th className="p-4 text-center">Faculty Eligibility</th>
                <th className="p-4 text-center">Workflow Stage</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{student.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{student.id}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-[#003DA5] bg-blue-50 px-2 py-0.5 rounded mr-1.5">{student.program}</span>
                    <span className="text-slate-500 font-medium">CGPA: {student.cgpa}</span>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">
                    {student.company}
                  </td>
                  {/* Finance Toggle */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleFinanceClearance(student.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition border ${
                        student.financeCleared 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                      }`}
                      title="Click to toggle Finance / Bursary clearance"
                    >
                      {student.financeCleared ? '✓ Cleared' : '⏳ Pending'}
                    </button>
                  </td>
                  {/* Faculty Toggle */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleFacultyApproval(student.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition border ${
                        student.facultyApproved 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                      }`}
                      title="Click to toggle Faculty Academic clearance"
                    >
                      {student.facultyApproved ? '✓ Approved' : '⏳ Pending'}
                    </button>
                  </td>
                  {/* Phase & Stage Indicators */}
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                      Phase {student.phase}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => setSelectedFolderStudent(student)}
                        className="p-1.5 text-slate-500 hover:text-[#003DA5] hover:bg-slate-100 rounded-lg transition"
                        title="View SharePoint Folders"
                      >
                        <FolderOpen size={16} />
                      </button>
                      <button
                        onClick={() => setEmailModalStudent(student)}
                        className="p-1.5 text-slate-500 hover:text-[#003DA5] hover:bg-slate-100 rounded-lg transition"
                        title="Email Student"
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SharePoint Folders Modal */}
      {selectedFolderStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-800 mb-1">
              SharePoint Folder: {selectedFolderStudent.name}
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">/2026/INTERNSHIP SEPTEMBER 2026/{selectedFolderStudent.program}/{selectedFolderStudent.name}</p>

            <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                <span>📁 01. PRE-INTERNSHIP (Clearances & SAL)</span>
                <span className="text-slate-400 font-mono">2 items</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                <span>📁 02. OFFER LETTER</span>
                <span className="text-slate-400 font-mono">{selectedFolderStudent.documents?.offerLetter ? '1 item' : '0 items'}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                <span>📁 03. REPORT DUTY AND REPLY FORM</span>
                <span className="text-slate-400 font-mono">{selectedFolderStudent.documents?.reportDuty ? '1 item' : '0 items'}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                <span>📁 04. POST-INTERNSHIP (Reports & Logbook)</span>
                <span className="text-slate-400 font-mono">{selectedFolderStudent.documents?.finalReport ? '2 items' : '0 items'}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedFolderStudent(null)}
                className="bg-[#003DA5] text-white px-4 py-1.5 text-xs font-bold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModalStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-800 mb-2">
              Send Official Notice to {emailModalStudent.name}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">To:</label>
                <input type="text" disabled value={emailModalStudent.registrationData?.email || emailModalStudent.id + '@student.mahsa.edu.my'} className="w-full p-2 bg-slate-100 rounded border border-slate-200 font-mono" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Subject:</label>
                <input type="text" defaultValue="MAHSA IMS: Industrial Training Endorsement Update" className="w-full p-2 border border-slate-200 rounded" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Message:</label>
                <textarea rows={4} defaultValue={`Dear ${emailModalStudent.name},\n\nPlease be advised on your internship clearance status. Please log in to your MAHSA IMS Student Portal to proceed to Phase 2.`} className="w-full p-2 border border-slate-200 rounded" />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEmailModalStudent(null)} className="px-4 py-1.5 border border-slate-200 text-xs font-bold rounded-lg text-slate-600">Cancel</button>
              <button onClick={() => { showToast('Email sent to student.', 'success'); setEmailModalStudent(null); }} className="bg-[#003DA5] text-white px-4 py-1.5 text-xs font-bold rounded-lg">Send Email</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};