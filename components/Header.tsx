import React from 'react';
import { signOut, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Step } from '../types';

interface HeaderProps {
  step: Step;
  onReset: () => void;
  user: User | null;
  onShowAuth: () => void;
}

const Header: React.FC<HeaderProps> = ({ step, onReset, user, onShowAuth }) => {
  const steps: { key: Step; label: string }[] = [
    { key: 'setup', label: 'Basics' },
    { key: 'outline', label: 'Outline' },
    { key: 'writing', label: 'Writing' },
    { key: 'preview', label: 'Publish' },
  ];

  const LOGO_URL = "https://res.cloudinary.com/dazlddxht/image/upload/v1767841061/SJ_AI_Ebook.png";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4 cursor-pointer group" onClick={onReset}>
        <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-md group-hover:scale-105 transition-transform border border-slate-100">
          <img 
            src={LOGO_URL} 
            alt="SJ AI Ebook Logo" 
            className="w-full h-full object-contain p-1"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">SJ AI <span className="text-indigo-600">Ebook</span></h1>
          <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold mt-1">Creation Studio</p>
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-10">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex items-center">
            <span className={`text-xs uppercase tracking-widest font-bold transition-colors ${step === s.key ? 'text-indigo-600' : 'text-slate-300'}`}>
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-100 mx-5"></div>
            )}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{user.displayName || user.email?.split('@')[0]}</p>
              <button 
                onClick={() => signOut(auth)}
                className="text-[10px] text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest font-bold"
              >
                Sign Out
              </button>
            </div>
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`} 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-slate-50 shadow-sm" 
            />
          </div>
        ) : (
          <button 
            onClick={onShowAuth}
            className="bg-slate-900 text-white text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-xl hover:bg-indigo-600 transition-all shadow-md active:scale-95"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;