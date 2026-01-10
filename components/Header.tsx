
import React from 'react';
import { User } from 'firebase/auth';
import { Step, AccentColor } from '../types';

interface HeaderProps {
  step: Step | null;
  user: User | null;
  toggleSidebar: () => void;
  onShowAuth: () => void;
  accentColor: AccentColor;
}

const Header: React.FC<HeaderProps> = ({ step, user, toggleSidebar, onShowAuth, accentColor }) => {
  const steps: { key: Step; label: string }[] = [
    { key: 'setup', label: 'Identity' },
    { key: 'outline', label: 'Blueprint' },
    { key: 'writing', label: 'Curation' },
    { key: 'preview', label: 'Publication' },
  ];

  const accentClasses = {
    indigo: 'text-indigo-600 bg-indigo-600',
    emerald: 'text-emerald-600 bg-emerald-600',
    rose: 'text-rose-600 bg-rose-600',
    amber: 'text-amber-600 bg-amber-600',
    slate: 'text-slate-600 bg-slate-600'
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between h-20 shrink-0 relative z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        {step && (
          <nav className="hidden md:flex items-center gap-6 ml-6">
            {steps.map((s, idx) => (
              <div key={s.key} className="flex items-center">
                <span className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${step === s.key ? accentClasses[accentColor].split(' ')[0] : 'text-slate-300 dark:text-slate-600 opacity-60'}`}>
                  {s.label}
                </span>
                {idx < steps.length - 1 && (
                  <div className="w-4 h-[1px] bg-slate-100 dark:bg-slate-800 mx-4"></div>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.displayName || user.email?.split('@')[0]}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-medium">Author ID: {user.uid.substr(0, 5)}</p>
            </div>
            <div className={`w-10 h-10 rounded-full border-2 ${accentClasses[accentColor].split(' ')[0].replace('text', 'border')} border-opacity-20 shadow-sm overflow-hidden bg-slate-100 dark:bg-slate-800`}>
               <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`} 
                alt="User" 
                className="w-full h-full object-cover" 
              />
            </div>
          </>
        ) : (
          <button 
            onClick={onShowAuth}
            className={`${accentClasses[accentColor].split(' ')[1]} text-white text-[10px] uppercase tracking-widest font-bold px-6 py-2.5 rounded-xl hover:bg-slate-900 dark:hover:bg-black transition-all shadow-md active:scale-95`}
          >
            Sign In / Sign Up
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
