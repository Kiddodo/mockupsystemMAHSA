import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, ZoomIn, ZoomOut, Check, FileText, AlertCircle, MessageSquare } from 'lucide-react';

export const SplitScreenGrading = ({ student, onBack }) => {
  const { submitStudentMarks, showToast } = useApp();
  const [docTab, setDocTab] = useState('logbook');
  const [zoom, setZoom] = useState(100);

  // Rubric Scores
  const [logbookScore, setLogbookScore] = useState(student?.rubricScores?.logbook ?? 18);
  const [chapters, setChapters] = useState(student?.rubricScores?.chapters || {
    ch1: 9,
    ch2: 9,
    ch3: 9,
    ch4: 13,
    ch5: 9,
    ch6: 5
  });
  const [conductScore, setConductScore] = useState(student?.rubricScores?.conduct ?? 19);

  // Required Section Explanations
  const [sectionAExplanation, setSectionAExplanation] = useState(
    student?.rubricScores?.sectionAExplanation || 'Entries submitted consistently with detailed weekly reflections and supervisor sign-offs.'
  );
  const [sectionBExplanation, setSectionBExplanation] = useState(
    student?.rubricScores?.sectionBExplanation || 'Thorough literature review and sound methodology. Findings in Chapter 4 demonstrate clear analytical depth.'
  );
  const [sectionCExplanation, setSectionCExplanation] = useState(
    student?.rubricScores?.sectionCExplanation || 'Exemplary punctuality, professional ethics, and proactive teamwork during host placement.'
  );

  // Optional Supervisor Feedback & Recommendation
  const [feedback, setFeedback] = useState(student?.feedback || '');
  const [recommendation, setRecommendation] = useState(student?.recommendation || '');

  // Validation Error State
  const [validationErrors, setValidationErrors] = useState({});

  const reportTotal = Object.values(chapters).reduce((a, b) => Number(a) + Number(b), 0);
  const finalPercentage = logbookScore + reportTotal + conductScore;

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!sectionAExplanation.trim()) {
      errors.sectionA = 'Please provide an explanation for Section A (Logbook) marks.';
    }
    if (!sectionBExplanation.trim()) {
      errors.sectionB = 'Please provide an explanation for Section B (Report Chapters) marks.';
    }
    if (!sectionCExplanation.trim()) {
      errors.sectionC = 'Please provide an explanation for Section C (Conduct) marks.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast('Please fill in explanations for all 3 rubric sections before submitting.', 'warning');
      return;
    }

    setValidationErrors({});
    submitStudentMarks(student.id, {
      total: finalPercentage,
      rubricScores: { 
        logbook: logbookScore, 
        chapters, 
        conduct: conductScore,
        sectionAExplanation,
        sectionBExplanation,
        sectionCExplanation
      },
      feedback: feedback.trim() || 'Satisfactory completion of placement.',
      recommendation: recommendation || 'Recommended for Employment'
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
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">Faculty Digital Marking Rubric (100%)</h3>
              <p className="text-[11px] text-slate-500">Lecturer explanations required for Sections A, B & C.</p>
            </div>
            <span className="text-xs font-bold text-[#003DA5]">
              Section A: 20% · Section B: 60% · Section C: 20%
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto space-y-6 text-xs">
            {/* Section A: Logbook */}
            <div className={`p-4 rounded-xl border transition ${validationErrors.sectionA ? 'border-red-300 bg-red-50/20' : 'border-slate-200 bg-slate-50'}`}>
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

              {/* Section A Explanation (Required) */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-[#003DA5]" />
                    <span>Section A Marks Explanation & Justification</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] text-red-500 font-bold">Required</span>
                </div>
                <textarea
                  rows={2}
                  value={sectionAExplanation}
                  onChange={(e) => {
                    setSectionAExplanation(e.target.value);
                    if (validationErrors.sectionA) setValidationErrors({...validationErrors, sectionA: null});
                  }}
                  placeholder="Explain reasoning for logbook marks (e.g. entry consistency, depth of daily reflections, mentor verification)..."
                  className={`w-full p-2.5 bg-white border rounded-lg text-xs focus:ring-2 focus:ring-[#003DA5] outline-none ${
                    validationErrors.sectionA ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200'
                  }`}
                />
                {validationErrors.sectionA && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {validationErrors.sectionA}
                  </p>
                )}
              </div>
            </div>

            {/* Section B: Chapters */}
            <div className={`p-4 rounded-xl border transition ${validationErrors.sectionB ? 'border-red-300 bg-red-50/20' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-slate-800">Section B: Report Chapters</span>
                <span className="font-black text-[#003DA5]">{reportTotal} / 60 Marks</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
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

              {/* Section B Explanation (Required) */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-[#003DA5]" />
                    <span>Section B Marks Explanation & Justification</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] text-red-500 font-bold">Required</span>
                </div>
                <textarea
                  rows={2}
                  value={sectionBExplanation}
                  onChange={(e) => {
                    setSectionBExplanation(e.target.value);
                    if (validationErrors.sectionB) setValidationErrors({...validationErrors, sectionB: null});
                  }}
                  placeholder="Explain reasoning for report chapters scoring (e.g. analysis quality, methodology rigor, findings clarity)..."
                  className={`w-full p-2.5 bg-white border rounded-lg text-xs focus:ring-2 focus:ring-[#003DA5] outline-none ${
                    validationErrors.sectionB ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200'
                  }`}
                />
                {validationErrors.sectionB && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {validationErrors.sectionB}
                  </p>
                )}
              </div>
            </div>

            {/* Section C: Conduct */}
            <div className={`p-4 rounded-xl border transition ${validationErrors.sectionC ? 'border-red-300 bg-red-50/20' : 'border-slate-200 bg-slate-50'}`}>
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

              {/* Section C Explanation (Required) */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-[#003DA5]" />
                    <span>Section C Marks Explanation & Justification</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] text-red-500 font-bold">Required</span>
                </div>
                <textarea
                  rows={2}
                  value={sectionCExplanation}
                  onChange={(e) => {
                    setSectionCExplanation(e.target.value);
                    if (validationErrors.sectionC) setValidationErrors({...validationErrors, sectionC: null});
                  }}
                  placeholder="Explain reasoning for professional conduct scoring (e.g. host mentor feedback, punctuality, ethics)..."
                  className={`w-full p-2.5 bg-white border rounded-lg text-xs focus:ring-2 focus:ring-[#003DA5] outline-none ${
                    validationErrors.sectionC ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200'
                  }`}
                />
                {validationErrors.sectionC && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {validationErrors.sectionC}
                  </p>
                )}
              </div>
            </div>

            {/* Optional Supervisor Feedback & Recommendation */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-xs">Supervisor Recommendation & Additional Feedback</span>
                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">Optional</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Overall Recommendation (Optional)</label>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 outline-none"
                >
                  <option value="">— Select recommendation (Optional) —</option>
                  <option value="Highly Recommended for Employment">Highly Recommended for Employment</option>
                  <option value="Recommended for Employment">Recommended for Employment</option>
                  <option value="Recommended with Reservations">Recommended with Reservations</option>
                  <option value="Not Recommended">Not Recommended</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Supervisor Commendation & Feedback Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter any additional optional remarks or commendations for the student..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>
            </div>

            {/* Digital Signature Confirmation */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Digital Evaluator Signature</div>
                <div className="text-[11px] text-slate-500 font-mono">Dr. Rahman (Lecturer) · Digitally Endorsed</div>
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