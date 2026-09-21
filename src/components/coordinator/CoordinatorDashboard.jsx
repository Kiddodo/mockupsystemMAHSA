import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, CheckCircle, Clock, Building2, Upload, FileSpreadsheet, 
  Lock, Unlock, Search, ShieldCheck, Mail, FolderOpen, AlertCircle,
  Calendar, Check, SlidersHorizontal, ShieldAlert
} from 'lucide-react';

export const CoordinatorDashboard = () => {
  const { 
    students, session, selectedProgram, deadlines, 
    updateSubmissionDeadline, toggleSubmissionAutoLock, setAllAutoLocks,
    isSubmissionDeadlinePassed, isSubmissionLocked, formatDeadline,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Coordinator Administration</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Active Session: <strong className="text-slate-700">{session}</strong> · Individual Submission Gating & Clearances
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => showToast('Student list imported from CSV (12 records synced).', 'success')}
            className="px-3 py-1.5 bg-[#003DA5] hover:bg-[#002d7a] text-white text-sm font-semibold rounded flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet size={15} />
            <span>Import Student CSV</span>
          </button>
          <button
            onClick={() => showToast('Faculty templates uploaded to SharePoint repository.', 'info')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-semibold rounded flex items-center gap-1.5 transition"
          >
            <Upload size={15} />
            <span>Upload Templates</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-5">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Enrolled</span>
            <div className="w-7 h-7 bg-blue-50 text-[#003DA5] rounded flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalStudents}</div>
          <div className="text-xs text-slate-500 mt-0.5">Active candidates</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fully Cleared</span>
            <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center font-bold">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{fullyCleared}</div>
          <div className="text-xs text-slate-500 mt-0.5">Bursary & Faculty endorsed</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bursary Holds</span>
            <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded flex items-center justify-center font-bold">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{pendingFinance}</div>
          <div className="text-xs text-slate-500 mt-0.5">Pending fee clearance</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Faculty Holds</span>
            <div className="w-7 h-7 bg-slate-100 text-slate-700 rounded flex items-center justify-center font-bold">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-2">{pendingFaculty}</div>
          <div className="text-xs text-slate-500 mt-0.5">Pending credit verification</div>
        </div>
      </div>

      {/* Individual Submission Deadlines & Auto-Lock Control Manager */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-[#003DA5]" />
              <h3 className="font-bold text-base text-slate-800">Submission Cut-offs & Auto-Lock Settings</h3>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Set cut-off dates, times, and automated lockouts for each phase independently.
            </p>
          </div>

          {/* Quick Global Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAllAutoLocks(true)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded transition"
            >
              Arm All Auto-Locks
            </button>
            <button
              onClick={() => setAllAutoLocks(false)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded transition"
            >
              Disable All Auto-Locks
            </button>
          </div>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 my-3.5">
          {[
            { id: 'ALL', label: 'All Submissions (6)' },
            { id: 'PHASE1', label: 'Phase 1 (Registration)' },
            { id: 'PHASE3', label: 'Phase 3 (Placement)' },
            { id: 'PHASE4', label: 'Phase 4 (Final Evaluation)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDeadlineTab(tab.id)}
              className={`px-3 py-1 text-sm font-medium rounded transition ${
                deadlineTab === tab.id 
                  ? 'bg-[#003DA5] text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Individual Deadlines Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {deadlineEntries.map(([key, item]) => {
            const isPassed = isSubmissionDeadlinePassed(key);
            const isLocked = isSubmissionLocked(key);

            return (
              <div 
                key={key} 
                className={`p-3.5 rounded border transition flex flex-col justify-between ${
                  isLocked ? 'bg-red-50/40 border-red-200' : item.autoLock ? 'bg-blue-50/30 border-blue-200' : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      Phase {item.phase}
                    </span>
                    {/* Status Badge */}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                      isLocked 
                        ? 'bg-red-100 text-red-700 border-red-300' 
                        : item.autoLock 
                        ? 'bg-blue-100 text-blue-700 border-blue-300' 
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {isLocked ? 'Locked (Cut-off passed)' : item.autoLock ? 'Auto-Lock Armed' : 'Manual Control'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">{item.description}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/70 space-y-2">
                  {/* Date and Time Inputs */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-0.5 flex items-center gap-1">
                        <Calendar size={12} /> Date
                      </label>
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) => updateSubmissionDeadline(key, e.target.value, item.time)}
                        className="w-full text-sm p-1.5 bg-white border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:border-[#003DA5]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-0.5 flex items-center gap-1">
                        <Clock size={12} /> Time
                      </label>
                      <input
                        type="time"
                        value={item.time || '23:59'}
                        onChange={(e) => updateSubmissionDeadline(key, item.date, e.target.value)}
                        className="w-full text-sm p-1.5 bg-white border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:border-[#003DA5]"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    Deadline: <strong className="text-slate-700">{formatDeadline(item.date, item.time)}</strong>
                  </div>

                  {/* Auto-lock Switch */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm text-slate-600 font-medium">Auto-Lock:</span>
                    <button
                      type="button"
                      onClick={() => toggleSubmissionAutoLock(key)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${
                        item.autoLock 
                          ? 'bg-red-600 text-white' 
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      <span>{item.autoLock ? 'Armed' : 'Off'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Centralized Clearance & Roster Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-800">Student Clearances & Roster</h3>
            <span className="text-sm text-slate-500 font-medium">
              ({filteredStudents.length} Students)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or ID..."
                className="pl-7 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-[#003DA5]"
              />
            </div>

            <select
              value={filterClearance}
              onChange={(e) => setFilterClearance(e.target.value)}
              className="text-sm bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Clearances</option>
              <option value="PENDING_FINANCE">Pending Finance (Bursary)</option>
              <option value="PENDING_FACULTY">Pending Faculty</option>
              <option value="CLEARED">Fully Cleared</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <th className="p-3">Student Name & ID</th>
                <th className="p-3">Prog / CGPA</th>
                <th className="p-3">Host Company</th>
                <th className="p-3 text-center">Finance (Bursary)</th>
                <th className="p-3 text-center">Faculty Clearance</th>
                <th className="p-3 text-center">Current Phase</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition">
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{student.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{student.id}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-[#003DA5] bg-blue-50 px-1.5 py-0.5 rounded mr-1.5 border border-blue-100">{student.program}</span>
                    <span className="text-slate-600">CGPA: {student.cgpa}</span>
                  </td>
                  <td className="p-3 text-slate-700">
                    {student.company}
                  </td>
                  {/* Finance Toggle */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleFinanceClearance(student.id)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition border ${
                        student.financeCleared 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                      title="Click to toggle Finance / Bursary clearance"
                    >
                      {student.financeCleared ? 'Cleared' : 'Pending'}
                    </button>
                  </td>
                  {/* Faculty Toggle */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleFacultyApproval(student.id)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition border ${
                        student.facultyApproved 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                      title="Click to toggle Faculty clearance"
                    >
                      {student.facultyApproved ? 'Approved' : 'Pending'}
                    </button>
                  </td>
                  {/* Phase & Stage Indicators */}
                  <td className="p-3 text-center">
                    <span className="font-medium text-slate-700">
                      Phase {student.phase}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => setSelectedFolderStudent(student)}
                        className="p-1.5 text-slate-500 hover:text-[#003DA5] hover:bg-slate-100 rounded transition"
                        title="View SharePoint Folders"
                      >
                        <FolderOpen size={16} />
                      </button>
                      <button
                        onClick={() => setEmailModalStudent(student)}
                        className="p-1.5 text-slate-500 hover:text-[#003DA5] hover:bg-slate-100 rounded transition"
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 border border-slate-200 shadow-md">
            <h3 className="font-bold text-base text-slate-800 mb-0.5">
              Repository Folder: {selectedFolderStudent.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono mb-3">/2026/INTERNSHIP SEPTEMBER 2026/{selectedFolderStudent.program}/{selectedFolderStudent.name}</p>

            <div className="space-y-1.5 border border-slate-200 rounded p-2.5 bg-slate-50 text-sm">
              <div className="p-2 bg-white rounded border border-slate-200 flex justify-between items-center">
                <span>📁 01. PRE-INTERNSHIP (Clearances & SAL)</span>
                <span className="text-slate-500 font-mono text-xs">2 items</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 flex justify-between items-center">
                <span>📁 02. OFFER LETTER</span>
                <span className="text-slate-500 font-mono text-xs">{selectedFolderStudent.documents?.offerLetter ? '1 item' : '0 items'}</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 flex justify-between items-center">
                <span>📁 03. REPORT DUTY AND REPLY FORM</span>
                <span className="text-slate-500 font-mono text-xs">{selectedFolderStudent.documents?.reportDuty ? '1 item' : '0 items'}</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 flex justify-between items-center">
                <span>📁 04. POST-INTERNSHIP (Reports & Logbook)</span>
                <span className="text-slate-500 font-mono text-xs">{selectedFolderStudent.documents?.finalReport ? '2 items' : '0 items'}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedFolderStudent(null)}
                className="bg-[#003DA5] hover:bg-[#002d7a] text-white px-4 py-2 text-sm font-semibold rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModalStudent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 border border-slate-200 shadow-md">
            <h3 className="font-bold text-sm text-slate-800 mb-2">
              Send Official Notice to {emailModalStudent.name}
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">To:</label>
                <input type="text" disabled value={emailModalStudent.registrationData?.email || emailModalStudent.id + '@student.mahsa.edu.my'} className="w-full p-1.5 bg-slate-100 rounded border border-slate-200 font-mono" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Subject:</label>
                <input type="text" defaultValue="MAHSA IMS: Industrial Training Endorsement Update" className="w-full p-1.5 border border-slate-300 rounded text-slate-800" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Message:</label>
                <textarea rows={4} defaultValue={`Dear ${emailModalStudent.name},\n\nPlease be advised on your internship clearance status. Please log in to your MAHSA IMS Student Portal to proceed to Phase 2.`} className="w-full p-1.5 border border-slate-300 rounded text-slate-800" />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEmailModalStudent(null)} className="px-3.5 py-1.5 border border-slate-300 text-xs font-semibold rounded text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={() => { showToast('Email sent to student.', 'success'); setEmailModalStudent(null); }} className="bg-[#003DA5] hover:bg-[#002d7a] text-white px-3.5 py-1.5 text-xs font-semibold rounded transition">Send Notice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};