import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, ZoomIn, ZoomOut, Check, FileText, BookOpen, UserCheck, Shield } from 'lucide-react';

export const SplitScreenGrading = ({ student, onBack }) => {
  const { submitStudentMarks } = useApp();
  const [docTab, setDocTab] = useState('logbook');
  const [zoom, setZoom] = useState(100);

  // Rubric Scores
  const [logbookScore, setLogbookScore] = useState(student?.rubricScores?.logbook || 18);
  const [chapters, setChapters] = useState(student?.rubricScores?.chapters || {
    ch1: 9,
    ch2: 9,
    ch3: 9,
    ch4: 13,
    ch5: 9,
    ch6: 5
  });
  const [conductScore, setConductScore] = useState(student?.rubricScores?.conduct || 19);
  const [feedback, setFeedback] = useState(student?.feedback || 'Demonstrated outstanding dedication and professional communication throughout the 12-week placement.');
  const [recommendation, setRecommendation] = useState(student?.recommendation || 'Highly Recommended for Employment');
  const [signed, setSigned] = useState(true);

  const canvasRef = useRef(null);

  const reportTotal = Object.values(chapters).reduce((a, b) => Number(a) + Number(b), 0);
  const finalPercentage = logbookScore + reportTotal + conductScore;

  const handleSubmit = (e) => {
    e.preventDefault();
    submitStudentMarks(student.id, {
      total: finalPercentage,
      rubricScores: { logbook: logbookScore, chapters, conduct: conductScore },
      feedback,
      recommendation
    });
    onBack();
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Top Engine Bar */}
      <div className="bg-[#002a74] text-white px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-md">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/10 rounded-lg text-blue-200 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={16} />
            <span>Back to Roster</span>
          </button>
          <div className="h-4 w-px bg-blue-400/30" />
          <div className="font-extrabold text-sm">
            Split-Screen Evaluation Workspace: <span className="text-blue-200">{student.name} ({student.id})</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs bg-blue-900/80 px-3 py-1 rounded-full border border-blue-400/30 text-blue-200">
            Company: {student.company}
          </span>
          <div className="bg-emerald-500 text-white font-black text-sm px-3.5 py-1 rounded-lg shadow-sm">
            Total: {finalPercentage}%
          </div>
        </div>
      </div>

      {/* Split Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Document PDF Viewer */}
        <div className="w-1/2 border-r border-slate-300 bg-slate-200 flex flex-col overflow-hidden">
          {/* Document Tabs */}
          <div className="bg-white p-2.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex space-x-2">
              <button
                onClick={() => setDocTab('logbook')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  docTab === 'logbook' ? 'bg-[#003DA5] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📔 Logbook (Week 1–12)
              </button>
              <button
                onClick={() => setDocTab('report')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  docTab === 'report' ? 'bg-[#003DA5] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📄 Final Internship Report
              </button>
              <button
                onClick={() => setDocTab('duty')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  docTab === 'duty' ? 'bg-[#003DA5] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📋 Report Duty Form
              </button>
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <button onClick={() => setZoom(Math.max(80, zoom - 10))} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ZoomOut size={16} /></button>
              <span className="font-mono text-slate-500">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ZoomIn size={16} /></button>
            </div>
          </div>

          {/* Document Content View */}
          <div className="flex-1 p-6 overflow-y-auto flex justify-center">
            <div 
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full text-xs leading-relaxed text-slate-700 transition-transform duration-100 space-y-4"
            >
              <div className="border-b-2 border-[#003DA5] pb-3 text-center">
                <div className="font-black text-sm text-[#003DA5]">MAHSA UNIVERSITY INDUSTRIAL TRAINING</div>
                <div className="text-[10px] uppercase text-slate-400 font-bold">{student.program} · {student.company}</div>
              </div>

              {docTab === 'logbook' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">WEEKLY ACTIVITY LOG SUMMARY</h4>
                  <div className="p-3 bg-slate-50 border rounded-lg">
                    <strong className="block text-slate-800 mb-1">Week 1–2: Orientation & Department Rotation</strong>
                    <p className="text-[11px] text-slate-600">Assisted with HR talent onboarding, database entry, and ERP document compilation. Received full induction.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-lg">
                    <strong className="block text-slate-800 mb-1">Week 3–8: Talent Sourcing & Performance Appraisals</strong>
                    <p className="text-[11px] text-slate-600">Screened 40+ candidate applications, coordinated initial interviews, and updated staff training matrices.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-lg">
                    <strong className="block text-slate-800 mb-1">Week 9–12: Special Project & Final Review</strong>
                    <p className="text-[11px] text-slate-600">Completed employee satisfaction survey analytics and delivered presentation to senior management.</p>
                  </div>
                </div>
              )}

              {docTab === 'report' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">FINAL REPORT: HR SYSTEMS MODERNIZATION</h4>
                  <p className="text-[11px] text-slate-600">
                    <strong>Chapter 1:</strong> Introduction to {student.company} organizational structure and human resources division.
                  </p>
                  <p className="text-[11px] text-slate-600">
                    <strong>Chapter 2:</strong> Literature review on automated onboarding frameworks in the Malaysian hospitality sector.
                  </p>
                  <p className="text-[11px] text-slate-600">
                    <strong>Chapter 3:</strong> Methodology & empirical findings across 12-week analytical engagement.
                  </p>
                </div>
              )}

              {docTab === 'duty' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">ENDORSED REPORT DUTY CONFIRMATION</h4>
                  <p className="text-[11px] text-slate-600">
                    This confirms that {student.name} duly reported for training at {student.company} on 1 September 2026 under the mentorship of the HR Department.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Digital Marking Form */}
        <div className="w-1/2 bg-white flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <h3 className="font-extrabold text-sm text-slate-800">Faculty Digital Marking Rubric (100%)</h3>
            <span className="text-xs font-bold text-[#003DA5]">
              Section A: 20% · Section B: 60% · Section C: 20%
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto space-y-6 text-xs">
            {/* Section A: Logbook */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-slate-800">Section A: Logbook Evaluation</span>
                <span className="font-black text-[#003DA5]">{logbookScore} / 20 Marks</span>
              </div>
              <div className="space-y-2">
                {[
                  { score: 18, label: 'Excellent: Comprehensive reflections, verified weekly (18-20)' },
                  { score: 14, label: 'Good: Consistent entries with sound observations (13-17)' },
                  { score: 10, label: 'Satisfactory: Adequate reporting, minor omissions (9-12)' }
                ].map((opt) => (
                  <label key={opt.score} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:border-blue-400">
                    <input
                      type="radio"
                      name="logbook"
                      checked={logbookScore === opt.score}
                      onChange={() => setLogbookScore(opt.score)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section B: Chapters */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-slate-800">Section B: Report Chapters</span>
                <span className="font-black text-[#003DA5]">{reportTotal} / 60 Marks</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(chapters).map(([ch, val]) => (
                  <div key={ch}>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">{ch} (Max 10)</label>
                    <input
                      type="number"
                      max={15}
                      min={0}
                      value={val}
                      onChange={(e) => setChapters({ ...chapters, [ch]: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-200 rounded font-bold text-slate-800 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section C: Conduct */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-slate-800">Section C: Professional Conduct</span>
                <span className="font-black text-[#003DA5]">{conductScore} / 20 Marks</span>
              </div>
              <div className="space-y-2">
                {[
                  { score: 19, label: 'Exceptional: Proactive initiative & exemplary ethics (18-20)' },
                  { score: 15, label: 'Good: Reliable, respectful and cooperative (13-17)' }
                ].map((opt) => (
                  <label key={opt.score} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:border-blue-400">
                    <input
                      type="radio"
                      name="conduct"
                      checked={conductScore === opt.score}
                      onChange={() => setConductScore(opt.score)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Evaluator Remarks */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Supervisor Commendation & Feedback</label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            {/* Digital Signature Confirmation */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Digital Evaluator Signature</div>
                <div className="text-[11px] text-slate-500 font-mono">Dr. Rahman (Lecturer) · Digitally Validated</div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold text-xs">
                ✓ Signed
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Check size={18} />
              <span>Submit Final Marks ({finalPercentage}%)</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};