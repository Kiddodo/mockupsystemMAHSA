import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, CheckCircle, FileCheck, Search, ChevronRight } from 'lucide-react';
import { SplitScreenGrading } from '../grading/SplitScreenGrading';

export const LecturerDashboard = () => {
  const { students, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [gradingStudent, setGradingStudent] = useState(null);

  // Assigned students for Dr. Rahman (DHRM)
  const assignedStudents = students.filter(s => s.lecturer === 'Dr. Rahman');
  const filteredStudents = assignedStudents.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
  );

  const pendingGradingCount = assignedStudents.filter(s => s.marks === null).length;

  if (gradingStudent) {
    return <SplitScreenGrading student={gradingStudent} onBack={() => setGradingStudent(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-200 mb-1.5">
            <span>Evaluator: {currentUser?.name}</span>
            <span>•</span>
            <span>DHRM Programme</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Academic Evaluator Portal</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            You have <strong className="text-amber-700 font-semibold">{pendingGradingCount} candidates</strong> pending evaluation.
          </p>
        </div>

        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or ID..."
            className="pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5]"
          />
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">Assigned Student Submissions</h3>
          <span className="text-xs text-slate-500 font-medium">{filteredStudents.length} Candidates Assigned</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <th className="p-3">Student Name & ID</th>
                <th className="p-3">Host Company</th>
                <th className="p-3 text-center">Clearance</th>
                <th className="p-3 text-center">Submissions Status</th>
                <th className="p-3 text-center">Score</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition">
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{student.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{student.id}</div>
                  </td>
                  <td className="p-3 text-slate-700">
                    {student.company}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                      student.financeCleared && student.facultyApproved ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {student.financeCleared && student.facultyApproved ? 'Cleared' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-slate-700 font-medium">
                      Phase {student.phase} Submissions
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {student.marks ? (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-xs">
                        {student.marks}%
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setGradingStudent(student)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                        student.marks 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300' 
                          : 'bg-[#003DA5] hover:bg-[#002d7a] text-white'
                      }`}
                    >
                      <Award size={13} />
                      <span>{student.marks ? 'Review Grade' : 'Grade Submission'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};