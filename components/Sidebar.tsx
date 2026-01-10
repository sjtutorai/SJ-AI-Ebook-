
import React from 'react';
import { ViewState, AccentColor } from '../types';
import { signOut, User } from 'firebase/auth';
import { auth } from '../services/firebase';

interface SidebarProps {
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  onNewProject: () => void;
  user: User | null;
  accentColor: AccentColor;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, onNewProject, user, accentColor }) => {
  const menuItems: { id: ViewState; label: string; icon: React.ReactNode; requiresAuth?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
    { id: 'create', label: 'Create E-Book', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg> },
    { id: 'my-books', label: 'My Library', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>, requiresAuth: true },
    { id: 'profile', label: 'Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>, requiresAuth: true },
    { id: 'settings', label: 'Settings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  ];

  const LOGO_URL = "https://res.cloudinary.com/dazlddxht/image/upload/v1767841061/SJ_AI_Ebook.png";

  const accentClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 text-indigo-400',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 text-emerald-400',
    rose: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 text-rose-400',
    amber: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20 text-amber-400',
    slate: 'bg-slate-600 hover:bg-slate-500 shadow-slate-600/20 text-slate-400'
  };

  return (
    <aside className={`bg-slate-900 text-slate-300 flex flex-col transition-all duration-500 ease-in-out ${isOpen ? 'w-72' : 'w-20'} h-screen border-r border-slate-800 relative z-50`}>
      <div className="p-6 mb-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shrink-0 shadow-xl border border-white/20">
          <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain p-0.5" />
        </div>
        {isOpen && (
          <div className="animate-in fade-in slide-in-from-left duration-300">
            <h1 className="text-white font-bold tracking-tight text-lg">SJ AI <span className={accentClasses[accentColor].split(' ')[3]}>Studio</span></h1>
          </div>
        )}
      </div>

      <div className="px-3 mb-8">
        <button 
          onClick={onNewProject}
          className={`w-full flex items-center justify-center gap-3 ${accentClasses[accentColor].split(' ').slice(0, 3).join(' ')} text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 overflow-hidden`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
          {isOpen && <span className="whitespace-nowrap">New E-Book</span>}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium group ${
              activeView === item.id 
                ? 'bg-slate-800 text-white shadow-inner' 
                : 'hover:bg-slate-800/50 hover:text-white'
            } ${item.requiresAuth && !user ? 'opacity-50' : ''}`}
          >
            <div className={`shrink-0 transition-transform ${activeView === item.id ? accentClasses[accentColor].split(' ')[3] + ' scale-110' : 'group-hover:scale-110'}`}>
              {item.icon}
            </div>
            {isOpen && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="text-sm whitespace-nowrap animate-in fade-in slide-in-from-left duration-200">{item.label}</span>
                {item.requiresAuth && !user && (
                  <svg className="w-3.5 h-3.5 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                )}
              </div>
            )}
          </button>
        ))}
      </nav>

      {user && (
        <div className="p-3 border-t border-slate-800 mt-auto">
          <button 
            onClick={() => signOut(auth)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-all font-medium overflow-hidden group`}
          >
            <svg className="w-5 h-5 shrink-0 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            {isOpen && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
