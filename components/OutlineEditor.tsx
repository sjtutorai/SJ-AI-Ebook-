
import React from 'react';
import { EbookProject, Chapter, ChapterTemplate } from '../types';

interface OutlineEditorProps {
  project: EbookProject;
  onUpdate: (outline: Chapter[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const OutlineEditor: React.FC<OutlineEditorProps> = ({ project, onUpdate, onNext, onBack }) => {
  
  const chapterTypes: { value: ChapterTemplate; label: string }[] = [
    { value: 'introduction', label: 'Introduction' },
    { value: 'standard', label: 'Standard Content' },
    { value: 'case-study', label: 'Case Study' },
    { value: 'tutorial', label: 'Tutorial/Guide' },
    { value: 'summary', label: 'Recap & Summary' },
    { value: 'key-takeaways', label: 'Key Takeaways' }
  ];

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    const newOutline = project.outline.map(ch => 
      ch.id === id ? { ...ch, ...updates } : ch
    );
    onUpdate(newOutline);
  };

  const removeChapter = (id: string) => {
    onUpdate(project.outline.filter(ch => ch.id !== id));
  };

  const addChapter = () => {
    const newCh: Chapter = {
      id: `ch-${Date.now()}`,
      title: 'New Chapter',
      summary: 'Describe what this chapter covers...',
      content: '',
      type: 'standard',
      status: 'pending'
    };
    onUpdate([...project.outline, newCh]);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-5xl font-serif text-slate-900 mb-4 font-bold tracking-tight">Curation Blueprint</h2>
          <p className="text-slate-500 text-lg">Architect your educational sequence. Select specialized templates for targeted learning.</p>
        </div>
        <button 
          onClick={addChapter}
          className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-8 py-4 rounded-[1.5rem] text-sm transition-all border border-slate-100 shadow-lg flex items-center gap-3 active:scale-95"
        >
          <div className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
          </div>
          Add Module
        </button>
      </div>

      <div className="space-y-8 mb-16">
        {project.outline.map((chapter, idx) => (
          <div key={chapter.id} className="glass-panel rounded-[2.5rem] p-10 group relative bg-white border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="absolute -left-6 top-10 w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-sm font-bold text-white border-4 border-white shadow-2xl group-hover:bg-indigo-600 transition-colors">
              {idx + 1}
            </div>
            <div className="flex gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Module Title</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner"
                      value={chapter.title}
                      onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Structure Template</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer shadow-inner"
                      value={chapter.type}
                      onChange={(e) => updateChapter(chapter.id, { type: e.target.value as ChapterTemplate })}
                    >
                      {chapterTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Key Objectives & Context</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-slate-600 text-base focus:outline-none resize-none min-h-[100px] font-medium leading-relaxed shadow-inner"
                    value={chapter.summary}
                    onChange={(e) => updateChapter(chapter.id, { summary: e.target.value })}
                    placeholder="What specific knowledge will be transferred in this module?"
                  />
                </div>
              </div>
              <button 
                onClick={() => removeChapter(chapter.id)}
                className="opacity-0 group-hover:opacity-100 p-4 text-slate-300 hover:text-red-500 transition-all self-start bg-slate-50 rounded-2xl"
                title="Remove Module"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-8 px-4">
        <button 
          onClick={onBack}
          className="px-12 py-5 rounded-[2rem] border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
        >
          Modify Setup
        </button>
        <button 
          onClick={onNext}
          className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-6 rounded-[2rem] shadow-2xl shadow-indigo-600/20 transition-all transform hover:-translate-y-1 active:translate-y-0 text-lg flex items-center justify-center gap-4 group"
        >
          Confirm Blueprint & Initiate Auto-Writing
          <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        </button>
      </div>
    </div>
  );
};

export default OutlineEditor;
