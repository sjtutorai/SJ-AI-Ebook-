
import React, { useState } from 'react';
import { EbookConfig } from '../types';

interface SetupFormProps {
  onSubmit: (config: EbookConfig) => void;
  isLoading: boolean;
  initialData?: EbookConfig;
}

const SetupForm: React.FC<SetupFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const [formData, setFormData] = useState<EbookConfig>(initialData || {
    title: '',
    author: '',
    genre: 'Educational',
    tone: 'Simple, clear, and easy to understand',
    language: 'English',
    chapterCount: 5,
    classLevel: 'High School',
    length: 'Medium',
    wordLimit: 2500
  });

  const classLevels = ['Primary School', 'Middle School', 'High School', 'College/University', 'Professional'];
  const lengths = ['Short', 'Medium', 'Long'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
  const tones = ['Simple & Clear', 'Academic', 'Professional', 'Storytelling'];

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-serif text-slate-900 mb-4 font-bold tracking-tight">The Scribe Room</h2>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">Define your vision and let SJ AI orchestrate your educational content.</p>
      </div>

      <div className="glass-panel rounded-[3rem] p-12 border border-slate-100 bg-white/80 shadow-2xl space-y-12">
        <div className="space-y-8">
           <div className="grid md:grid-cols-2 gap-8">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Core Topic / Book Title</label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-xl font-serif text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder-slate-300 shadow-inner"
                placeholder="e.g. Masterclass in Quantum Computing"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Target Audience</label>
              <div className="relative">
                <select
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer font-medium"
                  value={formData.classLevel}
                  onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                >
                  {classLevels.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Educational Tone</label>
              <div className="relative">
                <select
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer font-medium"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                >
                  {tones.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Author Name</label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-300 font-medium"
                placeholder="Your Name"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Language</label>
               <div className="relative">
                <select
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer font-medium"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Structure Size</label>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">{formData.chapterCount} Chapters</span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                step="1"
                className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={formData.chapterCount}
                onChange={(e) => setFormData({ ...formData, chapterCount: parseInt(e.target.value) })}
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase px-1">
                <span>Core Essentials</span>
                <span>Deep Dive</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Target Word Count</label>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">{formData.wordLimit.toLocaleString()} Words</span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={formData.wordLimit}
                onChange={(e) => setFormData({ ...formData, wordLimit: parseInt(e.target.value) })}
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase px-1">
                <span>E-Booklet</span>
                <span>Full Manual</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => onSubmit(formData)}
          disabled={!formData.title || !formData.author || isLoading}
          className="w-full bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-6 rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-4 transform hover:-translate-y-1 active:translate-y-0 group"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Architecting Your Content...
            </>
          ) : (
            <>
              Architect My Outline
              <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SetupForm;
