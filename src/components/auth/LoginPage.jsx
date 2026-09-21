import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_CREDENTIALS } from '../../data/mockData';
import { Lock, Mail, Shield, ChevronRight, CheckCircle } from 'lucide-react';

export const LoginPage = () => {
  const { setCurrentUser, showToast } = useApp();
  const [role, setRole] = useState('coordinator');
  const [email, setEmail] = useState('coordinator@mahsa.edu.my');
  const [password, setPassword] = useState('mahsa2026');
  const [error, setError] = useState('');

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    const cred = DEMO_CREDENTIALS.find(c => c.role === selectedRole);
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
      setError('');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const cred = DEMO_CREDENTIALS.find(
      c => c.role === role && c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
    );

    if (cred) {
      let userName = 'Coordinator Siti';
      let studentId = null;

      if (role === 'lecturer') {
        userName = 'Dr. Rahman';
      } else if (role === 'student') {
        userName = 'Abdul Halim Bin Tamar';
        studentId = '24-DHRM-0234';
      }

      setCurrentUser({
        role,
        name: userName,
        email: cred.email,
        studentId
      });
      showToast(`Welcome back, ${userName}!`, 'success');
    } else {
      setError('Invalid email or password for selected role. Click one of the demo buttons below to auto-fill.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002a74] via-[#003DA5] to-[#1a55c0] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-5">
        
        {/* Left Branding Panel */}
        <div className="md:col-span-2 bg-gradient-to-b from-[#003DA5] to-[#002a74] p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-2xl text-[#003DA5] shadow-lg">
                M
              </div>
              <div>
                <h1 className="font-extrabold text-xl leading-tight">MAHSA University</h1>
                <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold">Faculty of Business & HR</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-black mt-6 mb-3">Internship Management System</h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              Centralized platform for students, academic evaluators, and faculty coordinators with automated clearance workflows.
            </p>
          </div>

          <div className="space-y-3 my-6">
            <div className="flex items-center space-x-2 text-xs text-blue-100">
              <CheckCircle size={16} className="text-emerald-400" />
              <span>Phase 1: Bursary & Academic Clearance</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-blue-100">
              <CheckCircle size={16} className="text-emerald-400" />
              <span>Phase 2: Official SAL & Document Kit</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-blue-100">
              <CheckCircle size={16} className="text-emerald-400" />
              <span>Phase 3: Offer Letter & Report Duty</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-blue-100">
              <CheckCircle size={16} className="text-emerald-400" />
              <span>Phase 4: Split-Screen Grading Engine</span>
            </div>
          </div>

          <div className="text-xs text-blue-200 border-t border-blue-400/20 pt-4 flex items-center gap-2">
            <Shield size={14} />
            <span>Secure Academic Portal · 2026</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center bg-slate-50">
          <div className="mb-6">
            <h3 className="text-2xl font-extrabold text-slate-800">Sign In</h3>
            <p className="text-sm text-slate-500 mt-1">Select your access role to enter your portal</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selector Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                User Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('coordinator')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                    role === 'coordinator'
                      ? 'bg-[#003DA5] text-white border-[#003DA5] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Coordinator
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('lecturer')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                    role === 'lecturer'
                      ? 'bg-[#003DA5] text-white border-[#003DA5] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Lecturer
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('student')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                    role === 'student'
                      ? 'bg-[#003DA5] text-white border-[#003DA5] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Student
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003DA5] text-slate-800"
                  placeholder="name@mahsa.edu.my"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003DA5] text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#003DA5] hover:bg-[#002a74] text-white font-bold rounded-lg transition shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <span>Access Dashboard</span>
              <ChevronRight size={16} />
            </button>
          </form>

          {/* Quick Demo Autofill buttons */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Demo Credentials (Click to Auto-fill):
            </p>
            <div className="space-y-1.5">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => handleRoleSelect(cred.role)}
                  className="w-full text-left px-2.5 py-1.5 rounded bg-white hover:bg-blue-50 border border-slate-200 text-xs text-slate-700 flex justify-between items-center transition"
                >
                  <span className="font-semibold">{cred.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
