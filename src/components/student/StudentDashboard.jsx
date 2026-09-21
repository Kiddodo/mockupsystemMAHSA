import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle2, Clock, Lock, FileText, Download, Upload, 
  AlertCircle, Eye, Check
} from 'lucide-react';

export const StudentDashboard = () => {
  const { currentStudent, submitPhase1Registration, updateStudentDocument, deadline, isUploadLocked, showToast } = useApp();
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
  const locked = isUploadLocked();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-[#002a74] to-[#003DA5] rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-900/60 border border-blue-400/30 rounded-full px-3 py-1 text-xs font-semibold mb-3">
            <span>ID: {currentStudent?.id}</span>
            <span>•</span>
            <span>Program: {currentStudent?.program}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">{currentStudent?.name}</h1>
          <p className="text-blue-100 text-sm mt-1">
            Assigned Evaluator: <strong className="text-white font-bold">{currentStudent?.lecturer}</strong> · Company: {currentStudent?.company}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[260px]">
          <div className="text-xs uppercase font-bold tracking-wider text-blue-200 mb-1">Workflow Status</div>
          <div className="flex items-center justify-between">
            <span className="text-base font-black text-white">
              {currentStudent?.marks ? 'Phase 4 (Graded)' : `Phase ${currentStudent?.phase} Active`}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              isPhase2Unlocked ? 'bg-emerald-400/20 text-emerald-300' : 'bg-amber-400/20 text-amber-200'
            }`}>
              {isPhase2Unlocked ? 'Clearances Endorsed' : 'Pending Approvals'}
            </span>
          </div>
          <div className="text-[11px] text-blue-200 mt-2">
            Submission Deadline: <strong>{deadline}</strong>
          </div>
        </div>
      </div>

      {locked && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} className="flex-shrink-0" />
          <div className="text-sm">
            <strong className="font-bold">Submissions Locked:</strong> Coordinator deadline passed and auto-lock is active.
          </div>
        </div>
      )}

      {/* Phase Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <button
          onClick={() => setActiveTab(1)}
          className={`p-4 rounded-xl border text-left transition flex items-center justify-between ${
            activeTab === 1 ? 'bg-[#003DA5] text-white border-[#003DA5] shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 1 ? 'text-blue-200' : 'text-slate-400'}`}>Phase 1</div>
            <div className="font-extrabold text-sm mt-0.5">Registration & Clearances</div>
          </div>
          {currentStudent?.financeCleared && currentStudent?.facultyApproved ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Clock size={16} />}
        </button>

        <button
          onClick={() => setActiveTab(2)}
          className={`p-4 rounded-xl border text-left transition flex items-center justify-between ${
            activeTab === 2 ? 'bg-[#003DA5] text-white border-[#003DA5] shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 2 ? 'text-blue-200' : 'text-slate-400'}`}>Phase 2</div>
            <div className="font-extrabold text-sm mt-0.5">Official Letters & Kit</div>
          </div>
          {isPhase2Unlocked ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Lock size={16} className="text-amber-500" />}
        </button>

        <button
          onClick={() => setActiveTab(3)}
          className={`p-4 rounded-xl border text-left transition flex items-center justify-between ${
            activeTab === 3 ? 'bg-[#003DA5] text-white border-[#003DA5] shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 3 ? 'text-blue-200' : 'text-slate-400'}`}>Phase 3</div>
            <div className="font-extrabold text-sm mt-0.5">Offer & Report Duty</div>
          </div>
          {currentStudent?.documents?.offerLetter ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Clock size={16} />}
        </button>

        <button
          onClick={() => setActiveTab(4)}
          className={`p-4 rounded-xl border text-left transition flex items-center justify-between ${
            activeTab === 4 ? 'bg-[#003DA5] text-white border-[#003DA5] shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 4 ? 'text-blue-200' : 'text-slate-400'}`}>Phase 4</div>
            <div className="font-extrabold text-sm mt-0.5">Submissions & Grading</div>
          </div>
          {currentStudent?.marks ? <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2 py-0.5 rounded-full">{currentStudent.marks}%</span> : <Clock size={16} />}
        </button>
      </div>

      {/* Phase 1: Registration & Clearance */}
      {activeTab === 1 && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`p-5 rounded-xl border ${currentStudent?.financeCleared ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Clearance 1</span>
                  <h3 className="font-extrabold text-base text-slate-800 mt-1">Finance & Bursary Clearance</h3>
                  <p className="text-xs text-slate-600 mt-1">Verifies tuition fee status and no outstanding balance.</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentStudent?.financeCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {currentStudent?.financeCleared ? '✓ Cleared' : '⏳ Pending Review'}
                </span>
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${currentStudent?.facultyApproved ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Clearance 2</span>
                  <h3 className="font-extrabold text-base text-slate-800 mt-1">Faculty Academic Eligibility</h3>
                  <p className="text-xs text-slate-600 mt-1">CGPA: {currentStudent?.cgpa} (≥2.00) · Credits: {currentStudent?.credits} (≥60).</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentStudent?.facultyApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {currentStudent?.facultyApproved ? '✓ Approved' : '⏳ Pending Review'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="font-extrabold text-lg text-slate-800 mb-1">Registration & Re-enrolment for Internship Form</h3>
            <p className="text-xs text-slate-500 mb-6">Review your student details and submit for departmental endorsement.</p>

            <form onSubmit={handlePhase1Submit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
                  <input type="text" disabled value={currentStudent?.name} className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Matric ID</label>
                  <input type="text" disabled value={currentStudent?.id} className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">IC / Passport Number</label>
                  <input type="text" value={formData.icPassport} onChange={e => setFormData({...formData, icPassport: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Contact Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Preferred Industry</label>
                  <input type="text" value={formData.preferredIndustry} onChange={e => setFormData({...formData, preferredIndustry: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Target Location</label>
                  <input type="text" value={formData.preferredLocation} onChange={e => setFormData({...formData, preferredLocation: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button type="submit" className="bg-[#003DA5] hover:bg-[#002a74] text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow flex items-center gap-2">
                  <Check size={16} /> Save & Submit Registration
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
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-xl mx-auto my-8">
              <Lock size={32} className="text-amber-500 mx-auto mb-3" />
              <h3 className="font-extrabold text-lg text-slate-800 mb-2">Phase 2 Currently Locked</h3>
              <p className="text-xs text-slate-600 mb-4">Awaiting Finance (Bursary) and Faculty Academic endorsements before releasing official SAL.</p>
              <div className="text-xs font-bold text-slate-500">Tip: Click "⚡ Quick Unlock Phase 2" in the top bar to test live unlock.</div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#003DA5] text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-800">Student Application Letter (SAL)</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Official endorsement letter from MAHSA Faculty of Business with your student credentials.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowSalModal(true)} className="bg-[#003DA5] text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5">
                    <Eye size={14} /> View Letter
                  </button>
                  <button onClick={() => showToast('SAL PDF Downloaded.', 'success')} className="bg-white border border-slate-200 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5">
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              </div>

              {/* Template Kit */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h4 className="font-extrabold text-base text-slate-800 mb-4">Official Forms & Rubrics Kit</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { title: 'Company Reply Form', desc: 'To be signed by employer offering position.' },
                    { title: 'Report Duty Form', desc: 'To be confirmed by supervisor on Week 1.' },
                    { title: 'Weekly Logbook Template', desc: '12-week activity reflection log.' },
                    { title: 'Supervisor Evaluation Form', desc: 'Industry mentor conduct grading rubric.' },
                    { title: 'Student Feedback Form', desc: 'Host company evaluation survey.' },
                    { title: 'Final Report Rubric', desc: 'Chapters 1 to 5 marking guidelines.' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="w-6 h-6 bg-blue-100 text-[#003DA5] rounded flex items-center justify-center text-xs font-bold mb-2">0{idx+1}</div>
                        <div className="font-bold text-sm text-slate-800">{item.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{item.desc}</div>
                      </div>
                      <button onClick={() => showToast(`${item.title} downloaded.`, 'info')} className="mt-4 text-xs font-bold text-[#003DA5] flex items-center gap-1">
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

      {/* Phase 3: Offer & Report Duty */}
      {activeTab === 3 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#003DA5] bg-blue-50 px-2.5 py-1 rounded-full">Phase 3 · Step 1</span>
              <h4 className="font-extrabold text-base text-slate-800 mt-3">Company Offer Letter</h4>
              <p className="text-xs text-slate-500 mt-1">Official acceptance letter with internship allowance and tenure.</p>
              {currentStudent?.documents?.offerLetter && (
                <div className="mt-4 p-3 bg-slate-50 border rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <FileText size={16} className="text-[#003DA5]" /> {currentStudent.documents.offerLetter}
                </div>
              )}
            </div>
            <button
              disabled={locked}
              onClick={() => updateStudentDocument(currentStudent.id, 'offerLetter', 'OfferLetter_GrandHyatt.pdf', 3)}
              className="mt-6 w-full py-2.5 bg-[#003DA5] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2"
            >
              <Upload size={14} /> Upload Offer Letter
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#003DA5] bg-blue-50 px-2.5 py-1 rounded-full">Phase 3 · Step 2</span>
              <h4 className="font-extrabold text-base text-slate-800 mt-3">Report Duty Form</h4>
              <p className="text-xs text-slate-500 mt-1">Signed by company supervisor confirming your reporting date.</p>
              {currentStudent?.documents?.reportDuty && (
                <div className="mt-4 p-3 bg-slate-50 border rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <FileText size={16} className="text-[#003DA5]" /> {currentStudent.documents.reportDuty}
                </div>
              )}
            </div>
            <button
              disabled={locked}
              onClick={() => updateStudentDocument(currentStudent.id, 'reportDuty', 'ReportDuty_Signed.pdf', 4)}
              className="mt-6 w-full py-2.5 bg-[#003DA5] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2"
            >
              <Upload size={14} /> Upload Report Duty Form
            </button>
          </div>
        </div>
      )}

      {/* Phase 4: Submissions */}
      {activeTab === 4 && (
        <div className="space-y-6">
          {currentStudent?.marks && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800">Final Grade Recorded: {currentStudent.marks}%</h3>
                <p className="text-xs text-slate-600 mt-1">Evaluated by {currentStudent.lecturer}.</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400">Section A (20 Marks)</span>
                <h4 className="font-bold text-sm text-slate-800 mt-1">Completed Logbook</h4>
                <p className="text-xs text-slate-500 mt-1">12-week daily entries.</p>
              </div>
              <button onClick={() => updateStudentDocument(currentStudent.id, 'logbook', 'Final_Logbook.pdf')} className="mt-4 py-2 bg-slate-100 hover:bg-[#003DA5] hover:text-white text-xs font-bold rounded-lg transition">Upload Logbook</button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400">Section B (60 Marks)</span>
                <h4 className="font-bold text-sm text-slate-800 mt-1">Final Internship Report</h4>
                <p className="text-xs text-slate-500 mt-1">Chapters 1 to 5.</p>
              </div>
              <button onClick={() => updateStudentDocument(currentStudent.id, 'finalReport', 'Internship_Report_Final.pdf')} className="mt-4 py-2 bg-slate-100 hover:bg-[#003DA5] hover:text-white text-xs font-bold rounded-lg transition">Upload Report</button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400">Section C (20 Marks)</span>
                <h4 className="font-bold text-sm text-slate-800 mt-1">Supervisor Evaluation</h4>
                <p className="text-xs text-slate-500 mt-1">Industry conduct assessment.</p>
              </div>
              <button onClick={() => updateStudentDocument(currentStudent.id, 'supervisorEvaluation', 'Supervisor_Eval.pdf')} className="mt-4 py-2 bg-slate-100 hover:bg-[#003DA5] hover:text-white text-xs font-bold rounded-lg transition">Upload Evaluation</button>
            </div>
          </div>
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