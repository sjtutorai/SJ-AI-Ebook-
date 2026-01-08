
import React, { useState, useEffect, useRef } from 'react';
import { EbookProject } from '../types';
import { generateChapterContent } from '../services/geminiService';

interface WritingPanelProps {
  project: EbookProject;
  onUpdateProject: (p: EbookProject) => void;
  onNext: () => void;
  onBack: () => void;
}

const WritingPanel: React.FC<WritingPanelProps> = ({ project, onUpdateProject, onNext, onBack }) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const activeChapter = project.outline[activeChapterIndex];

  useEffect(() => {
    if (editorRef.current && activeChapter) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = activeChapter.content || `<p class="text-slate-400 italic">Start writing Chapter ${activeChapterIndex + 1} here...</p>`;
      }
    }
  }, [activeChapterIndex, activeChapter?.content]);

  const handleManualInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      const newOutline = [...project.outline];
      newOutline[activeChapterIndex] = {
        ...newOutline[activeChapterIndex],
        content: newContent
      };
      onUpdateProject({ ...project, outline: newOutline });
    }
  };

  const handleGenerateChapter = async () => {
    if (!activeChapter) return;
    setIsGenerating(true);
    
    try {
      const content = await generateChapterContent(project.config, activeChapter, project.outline);
      const newOutline = [...project.outline];
      newOutline[activeChapterIndex] = {
        ...newOutline[activeChapterIndex],
        content: content,
        status: 'completed'
      };
      onUpdateProject({ ...project, outline: newOutline });
      
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
    } catch (error) {
      console.error("Failed to generate chapter:", error);
      alert("AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex gap-6 h-[calc(100vh-220px)] relative">
      {/* Sidebar Navigation */}
      {showSidebar && (
        <div className="w-64 flex flex-col gap-2 overflow-y-auto pr-4 scrollbar-hide animate-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chapters</h3>
            <button onClick={() => setShowSidebar(false)} className="text-slate-300 hover:text-indigo-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            </button>
          </div>
          {project.outline.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => setActiveChapterIndex(idx)}
              className={`text-left p-4 rounded-xl transition-all border ${
                activeChapterIndex === idx 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold uppercase opacity-60 mb-1">Chapter {idx + 1}</div>
              <div className="font-bold text-sm truncate">{ch.title}</div>
            </button>
          ))}
        </div>
      )}

      {!showSidebar && (
        <button 
          onClick={() => setShowSidebar(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full ml-4 z-10 bg-white border border-slate-200 p-2 rounded-r-xl shadow-md hover:text-indigo-600 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
        </button>
      )}

      {/* Main Editor */}
      <div className={`flex-1 flex flex-col glass-panel rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-xl transition-all duration-300 ${!showSidebar ? 'w-full' : ''}`}>
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 truncate">{activeChapter?.title}</h2>
            <p className="text-xs text-slate-400 italic mt-1 truncate">{activeChapter?.summary}</p>
          </div>
          <div className="flex gap-3 ml-4 shrink-0">
            {!showSidebar && (
               <button onClick={() => setShowSidebar(true)} className="text-slate-400 hover:text-indigo-600 px-3 py-2 rounded-xl border border-slate-100 text-xs font-bold transition-all">
                Show Sidebar
              </button>
            )}
            <button
              onClick={handleGenerateChapter}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Writing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  AI Write Chapter
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleManualInput}
            className="prose prose-slate prose-lg max-w-none focus:outline-none min-h-full font-serif leading-relaxed text-slate-800"
            placeholder="Start writing or use AI to generate content..."
          />
        </div>

        <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-sm font-bold flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Edit Outline
          </button>
          <div className="flex items-center gap-6">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">
              {activeChapter?.content?.length || 0} Characters
            </span>
            <button
              onClick={onNext}
              className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md"
            >
              Finish Book & Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingPanel;
