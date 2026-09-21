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
        return <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded font-semibold">Coordinator</span>;
      case 'lecturer':
        return <span className="bg-emerald-100 text-emerald-900 text-xs px-2 py-0.5 rounded font-semibold">Lecturer</span>;
      case 'student':
        return <span className="bg-blue-100 text-blue-900 text-xs px-2 py-0.5 rounded font-semibold">Student Portal</span>;
      default:
        return null;
    }
  };

  return (
    <nav className="bg-[#003DA5] text-white border-b border-[#002d7a] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-lg text-[#003DA5]">
              M
            </div>
            <div>
              <div className="font-bold text-base tracking-normal flex items-center gap-2">
                MAHSA University
                {getRoleBadge()}
              </div>
              <p className="text-xs text-blue-200">Internship Management System</p>
            </div>
          </div>

          {/* Demo Approvals Bar (for Coordinator & Student testing) */}
          {currentUser?.role === 'student' && currentStudent && (
            <div className="hidden md:flex items-center space-x-2 text-xs">
              <span className="text-blue-200">Testing:</span>
              <button
                onClick={() => approveBothClearances(currentStudent.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1 rounded transition text-xs"
                title="Approve Finance and Faculty clearances to unlock Phase 2"
              >
                Approve Clearances (Demo)
              </button>
            </div>
          )}

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {currentUser?.role === 'coordinator' && (
              <div className="flex items-center space-x-2">
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="bg-[#002d7a] border border-blue-400/40 text-white text-xs rounded px-2.5 py-1 focus:outline-none"
                >
                  <option value="SEP2026">Session: Sept 2026</option>
                  <option value="MAR2026">Session: Mar 2026</option>
                </select>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="bg-[#002d7a] border border-blue-400/40 text-white text-xs rounded px-2.5 py-1 focus:outline-none"
                >
                  <option value="ALL">All Programs</option>
                  <option value="DHRM">DHRM</option>
                  <option value="DBA">DBA</option>
                  <option value="BBA">BBA</option>
                </select>
              </div>
            )}

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-3 border-l border-blue-400/30 pl-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold leading-tight">{currentUser?.name}</div>
                <div className="text-xs text-blue-200">{currentUser?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-[#002d7a] rounded text-blue-100 hover:text-white transition"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
