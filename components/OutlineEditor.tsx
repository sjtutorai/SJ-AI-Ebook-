
import React from 'react';
import { EbookProject, Chapter } from '../types';

interface OutlineEditorProps {
  project: EbookProject;
  onUpdate: (outline: Chapter[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const OutlineEditor: React.FC<OutlineEditorProps> = ({ project, onUpdate, onNext, onBack }) => {
  
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
      status: 'pending'
    };
    onUpdate([...project.outline, newCh]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-serif text-gray-900 mb-2 font-bold tracking-tight">Book Blueprint</h2>
          <p className="text-gray-500">Refine your table of contents before the AI begins the full generation.</p>
        </div>
        <button 
          onClick={addChapter}
          className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-xl text-sm transition-all border border-gray-100 shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Add Chapter
        </button>
      </div>

      <div className="space-y-6 mb-12">
        {project.outline.map((chapter, idx) => (
          <div key={chapter.id} className="glass-panel rounded-3xl p-8 group relative bg-white border border-gray-100 shadow-md hover:shadow-lg transition-all">
            <div className="absolute -left-4 top-8 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-sm font-bold text-white border-4 border-white shadow-xl">
              {idx + 1}
            </div>
            <div className="flex gap-6">
              <div className="flex-1 space-y-4">
                <input
                  type="text"
                  className="w-full bg-transparent text-2xl font-bold text-gray-900 focus:outline-none border-b-2 border-transparent focus:border-indigo-500/30 pb-2 transition-all"
                  value={chapter.title}
                  onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
                />
                <textarea
                  className="w-full bg-transparent text-gray-600 text-base focus:outline-none resize-none min-h-[60px] font-medium leading-relaxed"
                  value={chapter.summary}
                  onChange={(e) => updateChapter(chapter.id, { summary: e.target.value })}
                  placeholder="What happens in this chapter?"
                />
              </div>
              <button 
                onClick={() => removeChapter(chapter.id)}
                className="opacity-0 group-hover:opacity-100 p-3 text-gray-300 hover:text-red-500 transition-all self-start"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={onBack}
          className="px-10 py-4 rounded-2xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          Back to Setup
        </button>
        <button 
          onClick={onNext}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5"
        >
          Confirm Outline & Start Writing
        </button>
      </div>
    </div>
  );
};

export default OutlineEditor;
