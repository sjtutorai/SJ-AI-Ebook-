import React, { useState } from 'react';
import { EbookConfig } from '../types';

interface SetupFormProps {
  onSubmit: (config: EbookConfig) => void;
  isLoading: boolean;
}

const SetupForm: React.FC<SetupFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<EbookConfig>({
    title: '',
    author: '',
    genre: 'Educational',
    tone: 'Simple, clear, and easy to understand',
    language: 'English',
    chapterCount: 5,
    classLevel: 'High School',
    length: 'Medium'
  });

  const genres = ['Educational', 'Business', 'Fiction', 'Self-Help', 'Sci-Fi', 'Biography', 'Health'];
  const classLevels = ['Primary School', 'Middle School', 'High School', 'College/University', 'Professional'];
  const lengths = ['Short', 'Medium', 'Long'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-serif text-slate-900 mb-4 font-bold tracking-tight">Ebook Creator</h2>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">Generate professional educational ebooks for students using AI.</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-10 border border-slate-100 bg-white/80 shadow-2xl space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Topic / Book Title</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-300"
              placeholder="e.g. Introduction to Quantum Physics"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Target Audience / Class Level</label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                value={formData.classLevel}
                onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
              >
                {classLevels.map(cl => <option key={cl} value={cl}>{cl}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Ebook Length</label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value as any })}
              >
                {lengths.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Author Name</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-300"
              placeholder="Your Name"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Language</label>
             <div className="relative">
              <select
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
          </div>

          <div className="col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Chapter Count</label>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{formData.chapterCount} Chapters</span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              step="1"
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              value={formData.chapterCount}
              onChange={(e) => setFormData({ ...formData, chapterCount: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <button
          onClick={() => onSubmit(formData)}
          disabled={!formData.title || !formData.author || isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Preparing Educational Content...
            </>
          ) : (
            <>
              Generate Course Outline
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SetupForm;