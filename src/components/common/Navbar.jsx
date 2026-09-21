import React from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, GraduationCap, ShieldCheck, User, Calendar, BookOpen, Layers } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, setCurrentUser, session, setSession, selectedProgram, setSelectedProgram, currentStudent, approveBothClearances } = useApp();

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const getRoleBadge = () => {
    switch (currentUser?.role) {
      case 'coordinator':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">Coordinator</span>;
      case 'lecturer':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">Lecturer</span>;
      case 'student':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold">Student Portal</span>;
      default:
        return null;
    }
  };

  return (
    <nav className="bg-[#003DA5] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-black text-xl text-[#003DA5] shadow-sm">
              M
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight flex items-center gap-2">
                MAHSA University
                {getRoleBadge()}
              </div>
              <p className="text-xs text-blue-100 font-medium">Internship Management System (IMS)</p>
            </div>
          </div>

          {/* Quick Demo Approvals Bar (for Coordinator & Student testing) */}
          {currentUser?.role === 'student' && currentStudent && (
            <div className="hidden md:flex items-center bg-blue-900/60 border border-blue-400/30 rounded-lg px-3 py-1.5 space-x-2 text-xs">
              <span className="text-blue-200">Testing Tools:</span>
              <button
                onClick={() => approveBothClearances(currentStudent.id)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2.5 py-1 rounded transition text-xs shadow-sm"
                title="Instantly approve Finance and Faculty to unlock Phase 2"
              >
                ⚡ Quick Unlock Phase 2
              </button>
            </div>
          )}

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            {currentUser?.role === 'coordinator' && (
              <div className="flex items-center space-x-2">
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="bg-blue-900/70 border border-blue-400/30 text-white text-xs rounded-md px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="SEP2026">INTERNSHIP SEPT 2026</option>
                  <option value="MAR2026">INTERNSHIP MAR 2026</option>
                </select>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="bg-blue-900/70 border border-blue-400/30 text-white text-xs rounded-md px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="ALL">All Programs</option>
                  <option value="DHRM">DHRM</option>
                  <option value="DBA">DBA</option>
                  <option value="BBA">BBA</option>
                </select>
              </div>
            )}

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-3 border-l border-blue-400/30 pl-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold leading-tight">{currentUser?.name}</div>
                <div className="text-[11px] text-blue-200">{currentUser?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-blue-800 rounded-lg transition text-blue-100 hover:text-white"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
