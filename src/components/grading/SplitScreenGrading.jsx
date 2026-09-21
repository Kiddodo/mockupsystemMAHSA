import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, ZoomIn, ZoomOut, Check, FileText, AlertCircle, MessageSquare, Award } from 'lucide-react';

const LOGBOOK_TIERS = [
  { id: 'excellent', label: 'Excellent: Comprehensive reflections, verified weekly', min: 18, max: 20, defaultScore: 19 },
  { id: 'good', label: 'Good: Consistent entries with sound observations', min: 13, max: 17, defaultScore: 15 },
  { id: 'satisfactory', label: 'Satisfactory: Adequate reporting, minor omissions', min: 9, max: 12, defaultScore: 11 },
  { id: 'below_average', label: 'Below Average: Incomplete entries, minimal reflection', min: 5, max: 8, defaultScore: 7 },
  { id: 'poor', label: 'Poor: Critical omissions, lacked supervisor verification', min: 0, max: 4, defaultScore: 2 },
];

const getTierForScore = (score) => {
  if (score >= 18) return 'excellent';
  if (score >= 13) return 'good';
  if (score >= 9) return 'satisfactory';
  if (score >= 5) return 'below_average';
  return 'poor';
};

export const SplitScreenGrading = ({ student, onBack }) => {
  const { submitStudentMarks, showToast } = useApp();
  const [docTab, setDocTab] = useState('logbook');
  const [zoom, setZoom] = useState(100);

  // Rubric Scores
  const initialLogbookScore = student?.rubricScores?.logbook ?? 18;
  const [logbookScore, setLogbookScore] = useState(initialLogbookScore);
  const [selectedTierId, setSelectedTierId] = useState(getTierForScore(initialLogbookScore));

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

  // Handle tier selection
  const handleTierSelect = (tier) => {
    setSelectedTierId(tier.id);
    // If current score is outside this tier, clamp to default or range
    if (logbookScore < tier.min || logbookScore > tier.max) {
      setLogbookScore(tier.defaultScore);
    }
  };

  // Handle exact score change with clamping to tier range
  const handleScoreChange = (newVal, tier) => {
    if (isNaN(newVal)) return;
    const clamped = Math.min(Math.max(newVal, tier.min), tier.max);
    setLogbookScore(clamped);
  };

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
      <div className="bg-[#002d7a] text-white px-5 py-2.5 flex items-center justify-between flex-shrink-0 border-b border-[#001f54]">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-white/10 rounded text-blue-200 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft size={15} />
            <span>Back to Roster</span>
          </button>
          <div className="h-4 w-px bg-blue-400/30" />
          <div className="font-semibold text-xs sm:text-sm">
            Evaluation Workspace: <span className="text-blue-100">{student.name} ({student.id})</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-blue-200 hidden sm:inline">
            Host: {student.company}
          </span>
          <div className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded">
            Total: {finalPercentage}%
          </div>
        </div>
      </div>

      {/* Split Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Document PDF Viewer */}
        <div className="w-1/2 border-r border-slate-300 bg-slate-200 flex flex-col overflow-hidden">
          {/* Document Tabs */}
          <div className="bg-white p-2 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex space-x-1.5">
              <button
                onClick={() => setDocTab('logbook')}
                className={`px-3 py-1 text-xs font-semibold rounded transition ${
                  docTab === 'logbook' ? 'bg-[#003DA5] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Logbook Entries
              </button>
              <button
                onClick={() => setDocTab('report')}
                className={`px-3 py-1 text-xs font-semibold rounded transition ${
                  docTab === 'report' ? 'bg-[#003DA5] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Internship Report
              </button>
              <button
                onClick={() => setDocTab('duty')}
                className={`px-3 py-1 text-xs font-semibold rounded transition ${
                  docTab === 'duty' ? 'bg-[#003DA5] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Report Duty Form
              </button>
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <button onClick={() => setZoom(Math.max(80, zoom - 10))} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ZoomOut size={15} /></button>
              <span className="font-mono text-slate-500 text-xs">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ZoomIn size={15} /></button>
            </div>
          </div>

          {/* Document Content View */}
          <div className="flex-1 p-5 overflow-y-auto flex justify-center">
            <div 
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              className="bg-white rounded border border-slate-300 shadow-sm p-6 max-w-lg w-full text-xs leading-relaxed text-slate-700 transition-transform duration-100 space-y-3"
            >
              <div className="border-b-2 border-[#003DA5] pb-2 text-center">
                <div className="font-bold text-sm text-[#003DA5]">MAHSA UNIVERSITY INDUSTRIAL TRAINING</div>
                <div className="text-xs uppercase text-slate-500">{student.program} · {student.company}</div>
              </div>

              {docTab === 'logbook' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm">WEEKLY ACTIVITY LOG SUMMARY</h4>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <strong className="block text-slate-800 mb-0.5">Week 1–2: Orientation & Department Rotation</strong>
                    <p className="text-xs text-slate-600">Assisted with HR talent onboarding, database entry, and ERP document compilation. Received full induction.</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <strong className="block text-slate-800 mb-0.5">Week 3–8: Talent Sourcing & Performance Appraisals</strong>
                    <p className="text-xs text-slate-600">Screened 40+ candidate applications, coordinated initial interviews, and updated staff training matrices.</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <strong className="block text-slate-800 mb-0.5">Week 9–12: Special Project & Final Review</strong>
                    <p className="text-xs text-slate-600">Completed employee satisfaction survey analytics and delivered presentation to senior management.</p>
                  </div>
                </div>
              )}

              {docTab === 'report' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm">FINAL REPORT: HR SYSTEMS MODERNIZATION</h4>
                  <p className="text-xs text-slate-600">
                    <strong>Chapter 1:</strong> Introduction to {student.company} organizational structure and human resources division.
                  </p>
                  <p className="text-xs text-slate-600">
                    <strong>Chapter 2:</strong> Literature review on automated onboarding frameworks in the Malaysian hospitality sector.
                  </p>
                  <p className="text-xs text-slate-600">
                    <strong>Chapter 3:</strong> Methodology & empirical findings across 12-week analytical engagement.
                  </p>
                </div>
              )}

              {docTab === 'duty' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm">ENDORSED REPORT DUTY CONFIRMATION</h4>
                  <p className="text-xs text-slate-600">
                    This confirms that {student.name} duly reported for training at {student.company} on 1 September 2026 under the mentorship of the HR Department.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Digital Marking Form */}
        <div className="w-1/2 bg-white flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Faculty Marking Rubric (100%)</h3>
              <p className="text-xs text-slate-500">Explanations required for Sections A, B & C.</p>
            </div>
            <span className="text-sm font-semibold text-[#003DA5]">
              Section A: 20% · Section B: 60% · Section C: 20%
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 p-5 overflow-y-auto space-y-5 text-sm">
            {/* Section A: Logbook Evaluation (with Tier Range and Exact Mark Assignment) */}
            <div className={`p-3.5 rounded border transition ${validationErrors.sectionA ? 'border-red-300 bg-red-50/20' : 'border-slate-200 bg-slate-50/50'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-slate-800">Section A: Logbook Evaluation</span>
                <span className="font-bold text-sm text-[#003DA5] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Score: {logbookScore} / 20
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2.5">
                Select rubric tier, then assign exact mark within range.
              </p>

              {/* Tiers List */}
              <div className="space-y-2">
                {LOGBOOK_TIERS.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => handleTierSelect(tier)}
                      className={`p-2.5 rounded border transition cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-50/70 border-[#003DA5]' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="logbookTier"
                            checked={isSelected}
                            onChange={() => handleTierSelect(tier)}
                            className="text-[#003DA5]"
                          />
                          <span className={`text-sm ${isSelected ? 'font-bold text-[#003DA5]' : 'font-medium text-slate-800'}`}>
                            {tier.label}
                          </span>
                        </label>
                        <span className="text-xs font-semibold text-[#003DA5] bg-blue-100/70 px-2 py-0.5 rounded font-mono">
                          {tier.min}–{tier.max}
                        </span>
                      </div>

                      {/* Expanded Exact Mark Range Controller */}
                      {isSelected && (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="mt-2.5 pt-2 border-t border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2.5 rounded border border-blue-100"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">Exact Mark:</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={tier.min}
                                max={tier.max}
                                value={logbookScore}
                                onChange={(e) => handleScoreChange(Number(e.target.value), tier)}
                                className="w-14 p-1 text-center font-bold text-sm bg-blue-50 border border-blue-300 rounded text-[#003DA5] focus:outline-none"
                              />
                              <span className="text-sm text-slate-500">/ 20</span>
                            </div>
                          </div>

                          {/* Quick Pick Buttons */}
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-xs text-slate-500">Pick:</span>
                            {Array.from({ length: tier.max - tier.min + 1 }, (_, i) => tier.min + i).map((scoreVal) => (
                              <button
                                key={scoreVal}
                                type="button"
                                onClick={() => setLogbookScore(scoreVal)}
                                className={`px-2 py-0.5 text-xs rounded transition font-semibold ${
                                  logbookScore === scoreVal
                                    ? 'bg-[#003DA5] text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {scoreVal}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Section A Explanation (Required) */}
              <div className="mt-3 pt-2.5 border-t border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-[#003DA5]" />
                    <span>Section A Justification</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-red-500 font-semibold">Required</span>
                </div>
                <textarea
                  rows={2}
                  value={sectionAExplanation}
                  onChange={(e) => {
                    setSectionAExplanation(e.target.value);
                    if (validationErrors.sectionA) setValidationErrors({...validationErrors, sectionA: null});
                  }}
                  placeholder="Reasoning for logbook score..."
                  className={`w-full p-2 bg-white border rounded text-sm outline-none focus:border-[#003DA5] ${
                    validationErrors.sectionA ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {validationErrors.sectionA && (
                  <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle size={13} /> {validationErrors.sectionA}
                  </p>
                )}
              </div>
            </div>

            {/* Section B: Chapters */}
            <div className={`p-3.5 rounded border transition ${validationErrors.sectionB ? 'border-red-300 bg-red-50/20' : 'border-slate-200 bg-slate-50/50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-slate-800">Section B: Report Chapters</span>
                <span className="font-bold text-sm text-[#003DA5]">{reportTotal} / 60 Marks</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {Object.entries(chapters).map(([ch, val]) => (
                  <div key={ch}>
                    <label className="block text-xs font-semibold text-slate-600 mb-0.5 uppercase">{ch} (Max 10)</label>
                    <input
                      type="number"
                      max={15}
                      min={0}
                      value={val}
                      onChange={(e) => setChapters({ ...chapters, [ch]: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800 text-sm focus:outline-none focus:border-[#003DA5]"
                    />
                  </div>
                ))}
              </div>

              {/* Section B Explanation (Required) */}
              <div className="pt-2.5 border-t border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-[#003DA5]" />
                    <span>Section B Justification</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-red-500 font-semibold">Required</span>
                </div>
                <textarea
                  rows={2}
                  value={sectionBExplanation}
                  onChange={(e) => {
                    setSectionBExplanation(e.target.value);
                    if (validationErrors.sectionB) setValidationErrors({...validationErrors, sectionB: null});
                  }}
                  placeholder="Reasoning for report chapters scoring..."
                  className={`w-full p-2 bg-white border rounded text-sm outline-none focus:border-[#003DA5] ${
                    validationErrors.sectionB ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {validationErrors.sectionB && (
                  <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle size={13} /> {validationErrors.sectionB}
                  </p>
                )}
              </div>
            </div>

            {/* Section C: Conduct */}
            <div className={`p-3.5 rounded border transition ${validationErrors.sectionC ? 'border-red-300 bg-red-50/20' : 'border-slate-200 bg-slate-50/50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-slate-800">Section C: Professional Conduct</span>
                <span className="font-bold text-sm text-[#003DA5]">{conductScore} / 20 Marks</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { score: 19, label: 'Exceptional: Proactive initiative & exemplary ethics (18-20)' },
                  { score: 15, label: 'Good: Reliable, respectful and cooperative (13-17)' }
                ].map((opt) => (
                  <label key={opt.score} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:border-slate-300 text-sm">
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
              <div className="mt-3 pt-2.5 border-t border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-[#003DA5]" />
                    <span>Section C Justification</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-red-500 font-semibold">Required</span>
                </div>
                <textarea
                  rows={2}
                  value={sectionCExplanation}
                  onChange={(e) => {
                    setSectionCExplanation(e.target.value);
                    if (validationErrors.sectionC) setValidationErrors({...validationErrors, sectionC: null});
                  }}
                  placeholder="Reasoning for conduct score..."
                  className={`w-full p-2 bg-white border rounded text-sm outline-none focus:border-[#003DA5] ${
                    validationErrors.sectionC ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {validationErrors.sectionC && (
                  <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle size={13} /> {validationErrors.sectionC}
                  </p>
                )}
              </div>
            </div>

            {/* Optional Supervisor Feedback & Recommendation */}
            <div className="p-3.5 rounded border border-slate-300 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 text-sm">Supervisor Recommendation (Optional)</span>
                <span className="text-slate-500 text-xs">Optional</span>
              </div>

              <div>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-sm text-slate-700 outline-none focus:border-[#003DA5]"
                >
                  <option value="">— Select recommendation (Optional) —</option>
                  <option value="Highly Recommended for Employment">Highly Recommended for Employment</option>
                  <option value="Recommended for Employment">Recommended for Employment</option>
                  <option value="Recommended with Reservations">Recommended with Reservations</option>
                  <option value="Not Recommended">Not Recommended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Supervisor Commendation (Optional)</label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Optional remarks or commendations..."
                  className="w-full p-2 bg-white border border-slate-300 rounded text-sm outline-none focus:border-[#003DA5]"
                />
              </div>
            </div>

            {/* Digital Signature Confirmation */}
            <div className="p-3 rounded border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800 text-sm">Digital Evaluator Endorsement</div>
                <div className="text-xs text-slate-500">Dr. Rahman (Lecturer)</div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold text-xs border border-emerald-200">
                Endorsed
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#003DA5] hover:bg-[#002d7a] text-white font-semibold text-sm rounded transition flex items-center justify-center gap-1.5"
            >
              <Check size={16} />
              <span>Submit Final Evaluation & Sign Grade</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};