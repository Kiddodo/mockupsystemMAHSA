import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle2, Clock, Lock, FileText, Download, Upload, 
  AlertCircle, Eye, Check, Calendar
} from 'lucide-react';

export const StudentDashboard = () => {
  const { 
    currentStudent, submitPhase1Registration, updateStudentDocument, 
    deadlines, isSubmissionLocked, formatDeadline, showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState(currentStudent?.phase || 1);
  const [showSalModal, setShowSalModal] = useState(false);

  const [formData, setFormData] = useState({
    icPassport: currentStudent?.registrationData?.icPassport || '040812-14-5589',
    phone: currentStudent?.registrationData?.phone || '+60 12-345 6789',
    email: currentStudent?.registrationData?.email || currentStudent?.id + '@student.mahsa.edu.my',
    preferredIndustry: currentStudent?.registrationData?.preferredIndustry || 'Human Resource Management',
    preferredLocation: currentStudent?.registrationData?.preferredLocation || 'Kuala Lumpur / Selangor',
    emergencyContact: currentStudent?.registrationData?.emergencyContact || 'Tamar Bin Hassan (Father) - +60 19-876 5432'
  });

  const handlePhase1Submit = (e) => {
    e.preventDefault();
    submitPhase1Registration(currentStudent.id, formData);
  };

  const isPhase2Unlocked = currentStudent?.financeCleared && currentStudent?.facultyApproved;

  // Individual submission lock states
  const lockPhase1 = isSubmissionLocked('phase1_registration');
  const lockOffer = isSubmissionLocked('phase3_offer');
  const lockDuty = isSubmissionLocked('phase3_duty');
  const lockLogbook = isSubmissionLocked('phase4_logbook');
  const lockReport = isSubmissionLocked('phase4_report');
  const lockEval = isSubmissionLocked('phase4_evaluation');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Student Profile Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Matric: {currentStudent?.id}</span>
            <span>•</span>
            <span>Program: <strong className="text-slate-800 font-semibold">{currentStudent?.program}</strong></span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{currentStudent?.name}</h1>
          <p className="text-xs text-slate-600 mt-1">
            Academic Supervisor: <strong className="text-slate-800">{currentStudent?.lecturer}</strong> · Host Company: <strong className="text-slate-800">{currentStudent?.company}</strong>
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 min-w-[240px]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Internship Progress</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-bold text-slate-800">
              {currentStudent?.marks ? 'Phase 4 (Graded)' : `Phase ${currentStudent?.phase} Active`}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              isPhase2Unlocked ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isPhase2Unlocked ? 'Clearances Approved' : 'Clearances Pending'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Calendar size={12} />
            <span>Registration Cut-off: <strong>{formatDeadline(deadlines.phase1_registration?.date, deadlines.phase1_registration?.time)}</strong></span>
          </div>
        </div>
      </div>

      {/* Phase Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
        <button
          onClick={() => setActiveTab(1)}
          className={`p-3 rounded-md border text-left transition flex items-center justify-between ${
            activeTab === 1 ? 'bg-[#003DA5] text-white border-[#003DA5]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className={`text-[11px] font-semibold uppercase tracking-wide ${activeTab === 1 ? 'text-blue-100' : 'text-slate-400'}`}>Phase 1</div>
            <div className="font-bold text-sm mt-0.5">Registration & Clearances</div>
          </div>
          {currentStudent?.financeCleared && currentStudent?.facultyApproved ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Clock size={15} />}
        </button>

        <button
          onClick={() => setActiveTab(2)}
          className={`p-3 rounded-md border text-left transition flex items-center justify-between ${
            activeTab === 2 ? 'bg-[#003DA5] text-white border-[#003DA5]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className={`text-[11px] font-semibold uppercase tracking-wide ${activeTab === 2 ? 'text-blue-100' : 'text-slate-400'}`}>Phase 2</div>
            <div className="font-bold text-sm mt-0.5">Official Letters & Kit</div>
          </div>
          {isPhase2Unlocked ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Lock size={15} className="text-amber-500" />}
        </button>

        <button
          onClick={() => setActiveTab(3)}
          className={`p-3 rounded-md border text-left transition flex items-center justify-between ${
            activeTab === 3 ? 'bg-[#003DA5] text-white border-[#003DA5]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className={`text-[11px] font-semibold uppercase tracking-wide ${activeTab === 3 ? 'text-blue-100' : 'text-slate-400'}`}>Phase 3</div>
            <div className="font-bold text-sm mt-0.5">Offer & Report Duty</div>
          </div>
          {!isPhase2Unlocked ? (
            <Lock size={15} className="text-amber-500" />
          ) : currentStudent?.documents?.offerLetter ? (
            <CheckCircle2 size={16} className="text-emerald-400" />
          ) : (
            <Clock size={15} />
          )}
        </button>

        <button
          onClick={() => setActiveTab(4)}
          className={`p-3 rounded-md border text-left transition flex items-center justify-between ${
            activeTab === 4 ? 'bg-[#003DA5] text-white border-[#003DA5]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className={`text-[11px] font-semibold uppercase tracking-wide ${activeTab === 4 ? 'text-blue-100' : 'text-slate-400'}`}>Phase 4</div>
            <div className="font-bold text-sm mt-0.5">Submissions & Grading</div>
          </div>
          {!isPhase2Unlocked ? (
            <Lock size={15} className="text-amber-500" />
          ) : currentStudent?.marks ? (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">{currentStudent.marks}%</span>
          ) : (
            <Clock size={15} />
          )}
        </button>
      </div>

      {/* Phase 1: Registration & Clearance */}
      {activeTab === 1 && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${currentStudent?.financeCleared ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Department Clearance 1</span>
                  <h3 className="font-bold text-base text-slate-800 mt-0.5">Finance & Bursary Clearance</h3>
                  <p className="text-xs text-slate-600 mt-1">Verifies tuition fee status and zero outstanding balance.</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${currentStudent?.financeCleared ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                  {currentStudent?.financeCleared ? 'Cleared' : 'Pending Review'}
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${currentStudent?.facultyApproved ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Department Clearance 2</span>
                  <h3 className="font-bold text-base text-slate-800 mt-0.5">Faculty Academic Eligibility</h3>
                  <p className="text-xs text-slate-600 mt-1">CGPA: {currentStudent?.cgpa} (≥2.00) · Credits: {currentStudent?.credits} (≥60).</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${currentStudent?.facultyApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                  {currentStudent?.facultyApproved ? 'Approved' : 'Pending Review'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-800">Registration & Re-enrolment for Internship Form</h3>
                <p className="text-xs text-slate-500">Review student particulars and submit for departmental endorsement.</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Cut-off Deadline:</span>
                <span className="font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-mono text-xs border border-slate-200">
                  {formatDeadline(deadlines.phase1_registration?.date, deadlines.phase1_registration?.time)}
                </span>
                {lockPhase1 && (
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded">Locked</span>
                )}
              </div>
            </div>

            <form onSubmit={handlePhase1Submit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input type="text" disabled value={currentStudent?.name} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Matric ID</label>
                  <input type="text" disabled value={currentStudent?.id} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">IC / Passport Number</label>
                  <input type="text" disabled={lockPhase1} value={formData.icPassport} onChange={e => setFormData({...formData, icPassport: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-xs disabled:bg-slate-100 text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Phone</label>
                  <input type="text" disabled={lockPhase1} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-xs disabled:bg-slate-100 text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Preferred Industry</label>
                  <input type="text" disabled={lockPhase1} value={formData.preferredIndustry} onChange={e => setFormData({...formData, preferredIndustry: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-xs disabled:bg-slate-100 text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Location</label>
                  <input type="text" disabled={lockPhase1} value={formData.preferredLocation} onChange={e => setFormData({...formData, preferredLocation: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-xs disabled:bg-slate-100 text-slate-800" />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={lockPhase1}
                  className="bg-[#003DA5] hover:bg-[#002d7a] disabled:opacity-50 text-white font-semibold text-xs px-5 py-2 rounded flex items-center gap-1.5 transition"
                >
                  <Check size={14} /> 
                  <span>{lockPhase1 ? 'Submissions Closed' : 'Save & Submit Registration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phase 2: Document Kit */}
      {activeTab === 2 && (
        <div>
          {!isPhase2Unlocked ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center max-w-lg mx-auto my-8">
              <Lock size={28} className="text-amber-600 mx-auto mb-2" />
              <h3 className="font-bold text-base text-slate-800 mb-1">Phase 2 Currently Gated</h3>
              <p className="text-xs text-slate-600 mb-3">Awaiting Finance (Bursary) and Faculty clearances before releasing the official SAL and document templates.</p>
              <div className="text-[11px] font-medium text-slate-500">Note: Approvals can be granted by the Coordinator or tested via the top bar.</div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#003DA5] text-white rounded flex items-center justify-center flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-800">Student Application Letter (SAL)</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Official endorsement letter from MAHSA Faculty of Business with your student credentials.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowSalModal(true)} className="bg-[#003DA5] hover:bg-[#002d7a] text-white font-semibold text-xs px-3.5 py-1.5 rounded flex items-center gap-1.5 transition">
                    <Eye size={13} /> View Letter
                  </button>
                  <button onClick={() => showToast('SAL PDF Downloaded.', 'success')} className="bg-white hover:bg-slate-50 border border-slate-300 font-semibold text-xs px-3.5 py-1.5 rounded flex items-center gap-1.5 transition text-slate-700">
                    <Download size={13} /> Download PDF
                  </button>
                </div>
              </div>

              {/* Template Kit */}
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <h4 className="font-bold text-base text-slate-800 mb-3">Official Forms & Rubrics Kit</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { title: 'Company Reply Form', desc: 'To be signed by employer offering position.' },
                    { title: 'Report Duty Form', desc: 'To be confirmed by supervisor on Week 1.' },
                    { title: 'Weekly Logbook Template', desc: '12-week activity reflection log.' },
                    { title: 'Supervisor Evaluation Form', desc: 'Industry mentor conduct grading rubric.' },
                    { title: 'Student Feedback Form', desc: 'Host company evaluation survey.' },
                    { title: 'Final Report Rubric', desc: 'Chapters 1 to 5 marking guidelines.' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] text-[#003DA5] font-semibold mb-1">Document #{idx+1}</div>
                        <div className="font-bold text-xs text-slate-800">{item.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                      </div>
                      <button onClick={() => showToast(`${item.title} downloaded.`, 'info')} className="mt-3 text-xs font-semibold text-[#003DA5] flex items-center gap-1">
                        <Download size={12} /> Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase 3: Offer & Report Duty (with Individual Deadlines) */}
      {activeTab === 3 && (
        <div>
          {!isPhase2Unlocked ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center max-w-lg mx-auto my-8">
              <Lock size={28} className="text-amber-600 mx-auto mb-2" />
              <h3 className="font-bold text-base text-slate-800 mb-1">Phase 3 Currently Gated</h3>
              <p className="text-xs text-slate-600 mb-3">You must obtain Finance (Bursary) and Faculty approvals in Phase 1 and receive your official SAL before submitting company offer letters or reporting duty.</p>
              <div className="text-[11px] font-medium text-slate-500">Note: Approvals can be granted by the Coordinator or tested via the top bar.</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Step 1: Offer Letter */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#003DA5] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Step 1: Offer Letter</span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Calendar size={12} /> Deadline: <strong className="text-slate-700">{formatDeadline(deadlines.phase3_offer?.date, deadlines.phase3_offer?.time)}</strong>
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-sm text-slate-800 mt-1">Company Offer Letter</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Official acceptance letter with internship allowance and tenure.</p>
                  
                  {currentStudent?.documents?.offerLetter && (
                    <div className="mt-3 p-2.5 bg-slate-50 border rounded text-xs font-medium text-slate-700 flex items-center gap-2">
                      <FileText size={15} className="text-[#003DA5]" /> {currentStudent.documents.offerLetter}
                    </div>
                  )}

                  {lockOffer && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
                      Cut-off deadline has passed ({formatDeadline(deadlines.phase3_offer?.date, deadlines.phase3_offer?.time)}). Upload locked.
                    </div>
                  )}
                </div>

                <button
                  disabled={lockOffer}
                  onClick={() => updateStudentDocument(currentStudent.id, 'offerLetter', 'OfferLetter_GrandHyatt.pdf', 3)}
                  className="mt-5 w-full py-2 bg-[#003DA5] hover:bg-[#002d7a] disabled:opacity-50 text-white font-semibold text-xs rounded flex items-center justify-center gap-1.5 transition"
                >
                  <Upload size={13} /> 
                  <span>{lockOffer ? 'Uploads Closed' : currentStudent?.documents?.offerLetter ? 'Replace Offer Letter' : 'Upload Offer Letter'}</span>
                </button>
              </div>

              {/* Step 2: Report Duty Form */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#003DA5] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Step 2: Report Duty</span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Calendar size={12} /> Deadline: <strong className="text-slate-700">{formatDeadline(deadlines.phase3_duty?.date, deadlines.phase3_duty?.time)}</strong>
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-800 mt-1">Endorsed Report Duty Form</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Signed by company supervisor confirming reporting date.</p>
                  
                  {currentStudent?.documents?.reportDuty && (
                    <div className="mt-3 p-2.5 bg-slate-50 border rounded text-xs font-medium text-slate-700 flex items-center gap-2">
                      <FileText size={15} className="text-[#003DA5]" /> {currentStudent.documents.reportDuty}
                    </div>
                  )}

                  {lockDuty && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
                      Cut-off deadline has passed ({formatDeadline(deadlines.phase3_duty?.date, deadlines.phase3_duty?.time)}). Upload locked.
                    </div>
                  )}
                </div>

                <button
                  disabled={lockDuty}
                  onClick={() => updateStudentDocument(currentStudent.id, 'reportDuty', 'ReportDuty_Signed.pdf', 4)}
                  className="mt-5 w-full py-2 bg-[#003DA5] hover:bg-[#002d7a] disabled:opacity-50 text-white font-semibold text-xs rounded flex items-center justify-center gap-1.5 transition"
                >
                  <Upload size={13} /> 
                  <span>{lockDuty ? 'Uploads Closed' : currentStudent?.documents?.reportDuty ? 'Replace Report Duty Form' : 'Upload Report Duty Form'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase 4: Submissions (with Individual Deadlines) */}
      {activeTab === 4 && (
        <div>
          {!isPhase2Unlocked ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center max-w-lg mx-auto my-8">
              <Lock size={28} className="text-amber-600 mx-auto mb-2" />
              <h3 className="font-bold text-base text-slate-800 mb-1">Phase 4 Currently Gated</h3>
              <p className="text-xs text-slate-600 mb-3">Internship submissions and grading rubrics are locked until prerequisite Phase 1 clearances (Bursary & Faculty) and official documents are issued.</p>
              <div className="text-[11px] font-medium text-slate-500">Note: Approvals can be granted by the Coordinator or tested via the top bar.</div>
            </div>
          ) : (
            <div className="space-y-5">
              {currentStudent?.marks && (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/70 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Final Grade Recorded: {currentStudent.marks}%</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Evaluated by: <strong>{currentStudent.lecturer}</strong></p>
                    </div>
                    {currentStudent.recommendation && (
                      <span className="bg-white text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded border border-emerald-300 self-start sm:self-auto">
                        {currentStudent.recommendation}
                      </span>
                    )}
                  </div>

                  {/* Section Explanations Grid */}
                  <div className="grid md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded border border-emerald-200">
                      <div className="font-semibold text-slate-800 mb-1">Section A (Logbook) Remarks:</div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        {currentStudent?.rubricScores?.sectionAExplanation || 'Verified consistent reflection logs.'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-emerald-200">
                      <div className="font-semibold text-slate-800 mb-1">Section B (Report) Remarks:</div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        {currentStudent?.rubricScores?.sectionBExplanation || 'Analytical depth and chapters evaluated.'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-emerald-200">
                      <div className="font-semibold text-slate-800 mb-1">Section C (Conduct) Remarks:</div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        {currentStudent?.rubricScores?.sectionCExplanation || 'Professional conduct endorsed by host mentor.'}
                      </p>
                    </div>
                  </div>

                  {currentStudent.feedback && (
                    <div className="bg-white p-3 rounded border border-emerald-200 text-xs text-slate-700">
                      <strong className="font-semibold text-slate-800">Supervisor Commendation:</strong> {currentStudent.feedback}
                    </div>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                {/* Weekly Logbook */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">Section A (20 Marks)</span>
                      <span className="text-[11px] text-slate-500 font-mono">{formatDeadline(deadlines.phase4_logbook?.date, deadlines.phase4_logbook?.time)}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">Completed Logbook</h4>
                    <p className="text-xs text-slate-500 mt-0.5">12-week verified daily reflection entries.</p>
                    {currentStudent?.documents?.logbook && (
                      <p className="mt-2.5 text-xs font-semibold text-[#003DA5]">{currentStudent.documents.logbook}</p>
                    )}
                    {lockLogbook && (
                      <div className="mt-2 text-[11px] text-red-600 font-medium">Locked (Cut-off passed)</div>
                    )}
                  </div>
                  <button 
                    disabled={lockLogbook}
                    onClick={() => updateStudentDocument(currentStudent.id, 'logbook', 'Final_Logbook.pdf')} 
                    className="mt-4 py-2 bg-slate-100 hover:bg-[#003DA5] hover:text-white disabled:opacity-50 text-xs font-semibold rounded transition text-slate-700"
                  >
                    {lockLogbook ? 'Locked' : 'Upload Logbook'}
                  </button>
                </div>

                {/* Final Report */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">Section B (60 Marks)</span>
                      <span className="text-[11px] text-slate-500 font-mono">{formatDeadline(deadlines.phase4_report?.date, deadlines.phase4_report?.time)}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">Final Internship Report</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Chapters 1 to 5 with executive summary.</p>
                    {currentStudent?.documents?.finalReport && (
                      <p className="mt-2.5 text-xs font-semibold text-[#003DA5]">{currentStudent.documents.finalReport}</p>
                    )}
                    {lockReport && (
                      <div className="mt-2 text-[11px] text-red-600 font-medium">Locked (Cut-off passed)</div>
                    )}
                  </div>
                  <button 
                    disabled={lockReport}
                    onClick={() => updateStudentDocument(currentStudent.id, 'finalReport', 'Internship_Report_Final.pdf')} 
                    className="mt-4 py-2 bg-slate-100 hover:bg-[#003DA5] hover:text-white disabled:opacity-50 text-xs font-semibold rounded transition text-slate-700"
                  >
                    {lockReport ? 'Locked' : 'Upload Report'}
                  </button>
                </div>

                {/* Supervisor Evaluation */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">Section C (20 Marks)</span>
                      <span className="text-[11px] text-slate-500 font-mono">{formatDeadline(deadlines.phase4_evaluation?.date, deadlines.phase4_evaluation?.time)}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">Supervisor Evaluation</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Industry conduct assessment rubric.</p>
                    {currentStudent?.documents?.supervisorEvaluation && (
                      <p className="mt-2.5 text-xs font-semibold text-[#003DA5]">{currentStudent.documents.supervisorEvaluation}</p>
                    )}
                    {lockEval && (
                      <div className="mt-2 text-[11px] text-red-600 font-medium">Locked (Cut-off passed)</div>
                    )}
                  </div>
                  <button 
                    disabled={lockEval}
                    onClick={() => updateStudentDocument(currentStudent.id, 'supervisorEvaluation', 'Supervisor_Eval.pdf')} 
                    className="mt-4 py-2 bg-slate-100 hover:bg-[#003DA5] hover:text-white disabled:opacity-50 text-xs font-semibold rounded transition text-slate-700"
                  >
                    {lockEval ? 'Locked' : 'Upload Evaluation'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SAL Modal */}
      {showSalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="border-b-2 border-[#003DA5] pb-3 mb-4 text-center">
              <div className="font-black text-lg text-[#003DA5]">MAHSA UNIVERSITY</div>
              <div className="text-xs text-slate-500 font-bold">Faculty of Business, Finance and Information Technology</div>
            </div>
            <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <p><strong>TO: THE HUMAN RESOURCE MANAGER</strong></p>
              <p>RE: STUDENT INDUSTRIAL TRAINING APPLICATION — {currentStudent?.name.toUpperCase()} ({currentStudent?.id})</p>
              <p>This is to confirm that the student is registered full-time in the Diploma in Human Resource Management (DHRM) programme and is officially endorsed for a 12-week industrial placement.</p>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end">
              <button onClick={() => setShowSalModal(false)} className="bg-[#003DA5] text-white px-4 py-1.5 text-xs font-bold rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};