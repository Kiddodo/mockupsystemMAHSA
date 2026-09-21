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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 mb-2">
            <span>Evaluator: {currentUser?.name}</span>
            <span>•</span>
            <span>DHRM Programme</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">Academic Evaluator Portal</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            You have <strong className="text-amber-600 font-bold">{pendingGradingCount} students</strong> pending final report & logbook evaluation.
          </p>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter assigned students..."
            className="pl-8 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003DA5] shadow-sm"
          />
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-800">Assigned Student Submissions</h3>
          <span className="text-xs text-slate-400 font-semibold">{filteredStudents.length} Candidates Assigned</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="p-4">Student Name & ID</th>
                <th className="p-4">Host Company</th>
                <th className="p-4 text-center">Clearance Status</th>
                <th className="p-4 text-center">Submissions Status</th>
                <th className="p-4 text-center">Score</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{student.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{student.id}</div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">
                    {student.company}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      student.financeCleared && student.facultyApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {student.financeCleared && student.facultyApproved ? '✓ Cleared' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-slate-700">
                      Phase {student.phase} Submissions
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {student.marks ? (
                      <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full text-xs">
                        {student.marks}%
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">—</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setGradingStudent(student)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5 ${
                        student.marks 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                          : 'bg-[#003DA5] hover:bg-[#002a74] text-white'
                      }`}
                    >
                      <Award size={14} />
                      <span>{student.marks ? 'Review / Re-Grade' : 'Grade Now'}</span>
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