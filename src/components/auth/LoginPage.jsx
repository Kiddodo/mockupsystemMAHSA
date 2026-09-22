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
        userName = 'Abdullah Hasyim Bin Ahmad Iskandar';
        studentId = 'DHRM24086001';
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-12">
      {/* Container */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* University Header Banner */}
        <div className="bg-[#003DA5] p-6 text-white text-center">
          <div className="w-12 h-12 bg-white text-[#003DA5] font-bold text-2xl rounded flex items-center justify-center mx-auto mb-3 shadow-sm">
            M
          </div>
          <h1 className="font-bold text-xl leading-tight">MAHSA University</h1>
          <p className="text-xs text-blue-100 mt-0.5">Faculty of Business, Finance & Information Technology</p>
          <div className="mt-3 inline-block bg-[#002d7a] text-blue-100 text-xs font-medium px-2.5 py-1 rounded border border-blue-400/30">
            Internship Management System
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800">Sign In to Your Account</h2>
            <p className="text-sm text-slate-500 mt-0.5">Choose your role to access your dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selector Tabs */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Select Portal Role
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('coordinator')}
                  className={`py-2 text-sm font-semibold rounded transition ${
                    role === 'coordinator'
                      ? 'bg-white text-[#003DA5] shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Coordinator
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('lecturer')}
                  className={`py-2 text-sm font-semibold rounded transition ${
                    role === 'lecturer'
                      ? 'bg-white text-[#003DA5] shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lecturer
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('student')}
                  className={`py-2 text-sm font-semibold rounded transition ${
                    role === 'student'
                      ? 'bg-white text-[#003DA5] shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Student
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800"
                  placeholder="name@mahsa.edu.my"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#003DA5] hover:bg-[#002d7a] text-white font-semibold rounded transition text-sm flex items-center justify-center gap-1.5 mt-2"
            >
              <span>Sign In</span>
              <ChevronRight size={15} />
            </button>
          </form>

          {/* Quick Demo Autofill section */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Demo Quick-Select
            </div>
            <div className="space-y-1.5">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => handleRoleSelect(cred.role)}
                  className={`w-full text-left px-3 py-2 rounded border text-sm flex justify-between items-center transition ${
                    role === cred.role
                      ? 'bg-blue-50 border-blue-200 text-[#003DA5]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold">{cred.label}</span>
                  <span className="text-xs text-slate-500">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Shield size={14} className="text-slate-400" />
          <span>MAHSA University Academic Information Portal © 2026</span>
        </div>
      </div>
    </div>
  );
};
