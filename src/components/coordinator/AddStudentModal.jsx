import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, UserPlus, AlertCircle, CheckCircle, Building2, 
  GraduationCap, ShieldCheck, Mail, Phone, IdCard
} from 'lucide-react';

const PROGRAMMES = [
  { id: 'DHRM', label: 'Diploma in Human Resource Management (DHRM)' },
  { id: 'DBA', label: 'Diploma in Business Administration (DBA)' },
  { id: 'BBA', label: 'Bachelor of Business Administration (BBA)' },
  { id: 'DIM', label: 'Diploma in Management (DIM)' },
  { id: 'BAC', label: 'Bachelor of Accounting (BAC)' },
  { id: 'DAC', label: 'Diploma in Accounting (DAC)' }
];

const LECTURERS = [
  'Dr. Rahman',
  'Dr. Lee',
  'Prof. Azman',
  'Dr. Siti Nurhaliza',
  'Assoc. Prof. Tan Sri Dr. Khalid'
];

export const AddStudentModal = ({ isOpen, onClose }) => {
  const { sessions, session: currentSession, addStudent } = useApp();

  const [matricId, setMatricId] = useState('');
  const [name, setName] = useState('');
  const [program, setProgram] = useState('DHRM');
  const [cgpa, setCgpa] = useState('3.20');
  const [credits, setCredits] = useState('64');
  const [company, setCompany] = useState('');
  const [lecturer, setLecturer] = useState('Dr. Rahman');
  const [studentSession, setStudentSession] = useState(currentSession || 'SEP2026');
  const [icPassport, setIcPassport] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredIndustry, setPreferredIndustry] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [financeCleared, setFinanceCleared] = useState(false);
  const [facultyApproved, setFacultyApproved] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Auto-generate student email placeholder based on name and ID
  const handleNameChange = (val) => {
    setName(val);
    if (!email || email.includes('@student.mahsa.edu.my')) {
      const slug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '.');
      setEmail(slug ? `${slug}@student.mahsa.edu.my` : '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanId = matricId.trim();
    const cleanName = name.trim();

    if (!cleanId) {
      setError('Matric ID is required (e.g. 24-DHRM-0999).');
      return;
    }
    if (!cleanName) {
      setError('Student full name is required.');
      return;
    }

    const res = addStudent({
      id: cleanId,
      name: cleanName,
      program,
      cgpa: parseFloat(cgpa) || 3.00,
      credits: parseInt(credits, 10) || 60,
      company: company.trim() || 'Pending Placement',
      lecturer,
      session: studentSession,
      icPassport,
      phone,
      email,
      preferredIndustry: preferredIndustry.trim() || 'General Business Management',
      preferredLocation: preferredLocation.trim() || 'Kuala Lumpur / Selangor',
      financeCleared,
      facultyApproved
    });

    if (res?.success) {
      // Reset form
      setMatricId('');
      setName('');
      setCompany('');
      setIcPassport('');
      setPhone('');
      setEmail('');
      setFinanceCleared(false);
      setFacultyApproved(false);
      onClose();
    } else if (res?.message) {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in duration-150">
        {/* Header */}
        <div className="bg-[#003DA5] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={18} />
            <h3 className="font-bold text-base">Register Individual Student</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Academic Identity */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <GraduationCap size={14} className="text-[#003DA5]" /> 1. Student Particulars & Academic Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Matric ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={matricId}
                  onChange={(e) => setMatricId(e.target.value.toUpperCase())}
                  placeholder="e.g. 24-DHRM-0999"
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded font-mono uppercase focus:outline-none focus:border-[#003DA5] text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Full Name (as in IC / Passport) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Nurul Izzah Binti Roslan"
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Programme</label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800"
                >
                  {PROGRAMMES.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  max="4.00"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Credits Completed</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Academic Supervisor</label>
                <select
                  value={lecturer}
                  onChange={(e) => setLecturer(e.target.value)}
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800"
                >
                  {LECTURERS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Internship Session</label>
                <select
                  value={studentSession}
                  onChange={(e) => setStudentSession(e.target.value)}
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800"
                >
                  {sessions?.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Host Placement & Contact Details */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Building2 size={14} className="text-[#003DA5]" /> 2. Placement & Contact Particulars
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Host Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Grand Hyatt Kuala Lumpur"
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800"
                />
                <p className="text-xs text-slate-400 mt-0.5">Defaults to "Pending Placement" if left blank</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Preferred Location</label>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. Kuala Lumpur / Petaling Jaya"
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">IC / Passport Number</label>
                <input
                  type="text"
                  value={icPassport}
                  onChange={(e) => setIcPassport(e.target.value)}
                  placeholder="e.g. 040812-14-5589"
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +60 12-345 6789"
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Student Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@student.mahsa.edu.my"
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Initial Department Clearances */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#003DA5]" /> 3. Department Clearances (Initial Gating)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="p-3 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-start gap-2.5 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={financeCleared}
                  onChange={(e) => setFinanceCleared(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#003DA5] rounded"
                />
                <div>
                  <span className="block font-semibold text-sm text-slate-800">Finance & Bursary Cleared</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Zero outstanding tuition fees verified by Finance.</span>
                </div>
              </label>

              <label className="p-3 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-start gap-2.5 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={facultyApproved}
                  onChange={(e) => setFacultyApproved(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#003DA5] rounded"
                />
                <div>
                  <span className="block font-semibold text-sm text-slate-800">Faculty Academic Clearance</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Meets credit and CGPA threshold verified by Faculty.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#003DA5] hover:bg-[#002d7a] text-white text-sm font-semibold rounded flex items-center gap-1.5 transition"
            >
              <UserPlus size={16} />
              <span>Register Student</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
