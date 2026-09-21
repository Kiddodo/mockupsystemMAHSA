import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { LoginPage } from './components/auth/LoginPage';
import { CoordinatorDashboard } from './components/coordinator/CoordinatorDashboard';
import { LecturerDashboard } from './components/lecturer/LecturerDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export function App() {
  const { currentUser, toast } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Nunito'] text-slate-800">
      {currentUser ? (
        <>
          <Navbar />
          <main className="flex-1">
            {currentUser.role === 'coordinator' && <CoordinatorDashboard />}
            {currentUser.role === 'lecturer' && <LecturerDashboard />}
            {currentUser.role === 'student' && <StudentDashboard />}
          </main>
        </>
      ) : (
        <LoginPage />
      )}

      {/* Global Toast Notifications */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-bold text-white ${
            toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'warning' ? 'bg-amber-600' : 'bg-[#003DA5]'
          }`}>
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'warning' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;