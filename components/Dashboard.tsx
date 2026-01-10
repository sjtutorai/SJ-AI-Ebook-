
import React from 'react';
import { EbookProject } from '../types';
import { User } from 'firebase/auth';

interface DashboardProps {
  projects: EbookProject[];
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onSelect, onNew, onDelete, user }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">Creative Hub</h2>
          <p className="text-slate-500">
            {user ? `Welcome back, ${user.displayName || 'Author'}. Manage your educational masterpieces.` : "Unleash your expertise with AI-driven eBook generation."}
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
             <span className="bg-slate-100 px-3 py-1 rounded-full">{projects.length} Total Books</span>
          </div>
        )}
      </div>

      {!user ? (
        <div className="bg-indigo-50 rounded-[3rem] p-16 text-center space-y-8 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-serif font-bold text-slate-900 max-w-lg mx-auto leading-tight">Create professional eBooks for any educational level.</h3>
            <p className="text-slate-500 max-w-md mx-auto">Get started today for free. Our AI helps you architect, write, and design your educational content in minutes.</p>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={onNew}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
              >
                Start Free Project
              </button>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -top-20 w-60 h-60 bg-white/40 rounded-full blur-3xl"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center space-y-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
             <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-800">Your library is empty</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Start your first AI-powered book and share knowledge with the world.</p>
          </div>
          <button 
            onClick={onNew}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
          >
            Create Your First Book
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <div 
              key={project.id}
              className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl transition-all duration-500 border-b-4 border-b-transparent hover:border-b-indigo-500 cursor-pointer overflow-hidden"
              onClick={() => onSelect(project.id)}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); if(confirm("Delete book?")) onDelete(project.id); }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xl font-bold text-slate-900 line-clamp-2 leading-tight h-14 group-hover:text-indigo-600 transition-colors">
                  {project.config.title || 'Untitled Book'}
                </h4>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span className="text-indigo-500">{project.config.genre}</span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                  <span>{project.config.language}</span>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                <span className="group-hover:text-indigo-500 group-hover:translate-x-1 transition-all">Open Project →</span>
              </div>
            </div>
          ))}
          <div 
            onClick={onNew}
            className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
          >
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
             </div>
             <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-600">New E-Book</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
