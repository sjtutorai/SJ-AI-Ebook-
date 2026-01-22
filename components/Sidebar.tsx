
import React from 'react';
import { ViewState, AccentColor } from '../types';
import { signOut, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { 
  X, 
  LayoutDashboard, 
  BookPlus, 
  Library, 
  User as UserIcon, 
  Settings, 
  LogOut,
  Plus
} from 'lucide-react';

interface SidebarProps {
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  onNewProject: () => void;
  user: User | null;
  accentColor: AccentColor;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  isOpen, 
  toggleSidebar, 
  onNewProject, 
  user, 
  accentColor 
}) => {
  const menuItems: { id: ViewState; label: string; icon: React.ReactNode; requiresAuth?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'create', label: 'Create E-Book', icon: <BookPlus className="w-5 h-5" /> },
    { id: 'my-books', label: 'My Projects', icon: <Library className="w-5 h-5" />, requiresAuth: true },
    { id: 'profile', label: 'Profile', icon: <UserIcon className="w-5 h-5" />, requiresAuth: true },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const LOGO_URL = "https://res.cloudinary.com/dazlddxht/image/upload/v1767841061/SJ_AI_Ebook.png";

  const accentClasses = {
    indigo: 'text-indigo-600 bg-indigo-600',
    emerald: 'text-emerald-600 bg-emerald-600',
    rose: 'text-rose-600 bg-rose-600',
    amber: 'text-amber-600 bg-amber-600',
    slate: 'text-slate-600 bg-slate-600'
  };

  const handleNavClick = (view: ViewState) => {
    onViewChange(view);
    // On mobile, close sidebar after click
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-slate-900 shadow-2xl
        transform transition-transform duration-300 ease-in-out border-r border-slate-100 dark:border-slate-800
        ${isOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0 md:w-20"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-slate-800 h-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
            {isOpen && (
              <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white truncate animate-in fade-in slide-in-from-left duration-300">
                SJ AI <span className={accentClasses[accentColor].split(' ')[0]}>Ebook</span>
              </h2>
            )}
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action */}
        <div className="p-4">
          <button 
            onClick={() => { onNewProject(); if(window.innerWidth < 768) toggleSidebar(); }}
            className={`w-full flex items-center justify-center gap-3 ${accentClasses[accentColor].split(' ')[1]} text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg active:scale-95 overflow-hidden group`}
          >
            <Plus className={`w-5 h-5 shrink-0 transition-transform ${isOpen ? '' : 'group-hover:rotate-90'}`} />
            {isOpen && <span className="whitespace-nowrap animate-in fade-in duration-300">New E-Book</span>}
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-medium group ${
                activeView === item.id 
                  ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              } ${item.requiresAuth && !user ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <div className={`shrink-0 transition-transform ${activeView === item.id ? accentClasses[accentColor].split(' ')[0] + ' scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              {isOpen && (
                <div className="flex items-center justify-between flex-1 min-w-0 animate-in fade-in slide-in-from-left duration-200">
                  <span className="text-sm font-semibold truncate">{item.label}</span>
                  {item.requiresAuth && !user && (
                    <X className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User Footer */}
        {user && (
          <div className="p-4 border-t border-slate-50 dark:border-slate-800 mt-auto">
            <button 
              onClick={() => signOut(auth)}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all font-medium group"
            >
              <LogOut className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
              {isOpen && <span className="text-sm font-semibold animate-in fade-in duration-300">Sign Out</span>}
            </button>
          </div>
        )}
      </aside>
      
      {/* Spacer for desktop to avoid content overlap */}
      <div className={`hidden md:block shrink-0 transition-all duration-300 ${isOpen ? 'w-72' : 'w-20'}`} />
    </>
  );
};

export default Sidebar;
