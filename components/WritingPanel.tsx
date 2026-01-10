
import React, { useState, useEffect, useRef } from 'react';
import { EbookProject, Chapter } from '../types';
import { generateChapterContent } from '../services/geminiService';

interface WritingPanelProps {
  project: EbookProject;
  onUpdateProject: (p: EbookProject) => void;
  onNext: () => void;
  onBack: () => void;
}

const WritingPanel: React.FC<WritingPanelProps> = ({ project, onUpdateProject, onNext, onBack }) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const activeChapter = project.outline[activeChapterIndex];

  // Calculate progress
  const completedChapters = project.outline.filter(ch => ch.status === 'completed').length;
  const totalChapters = project.outline.length;
  const progressPercent = Math.round((completedChapters / totalChapters) * 100);

  useEffect(() => {
    // Automatically start generation if any chapter is pending and we aren't already generating
    const firstPendingIndex = project.outline.findIndex(ch => ch.status === 'pending');
    if (firstPendingIndex !== -1 && !isAutoGenerating) {
      handleGenerateAll();
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && activeChapter) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = activeChapter.content || 
          (activeChapter.status === 'generating' 
            ? `<div class="flex items-center gap-3 text-indigo-500 animate-pulse font-sans"><svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> AI is writing this chapter...</div>`
            : `<p class="text-slate-400 italic">Start writing Chapter ${activeChapterIndex + 1} here...</p>`);
      }
    }
  }, [activeChapterIndex, activeChapter?.content, activeChapter?.status]);

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

  const handleGenerateAll = async () => {
    if (isAutoGenerating) return;
    setIsAutoGenerating(true);

    const newOutline = [...project.outline];
    
    // Process chapters sequentially to avoid hitting rate limits and maintain context
    for (let i = 0; i < newOutline.length; i++) {
      if (newOutline[i].status === 'completed') continue;

      setActiveChapterIndex(i);
      
      // Update status to generating
      newOutline[i] = { ...newOutline[i], status: 'generating' };
      onUpdateProject({ ...project, outline: [...newOutline] });

      try {
        const content = await generateChapterContent(project.config, newOutline[i], project.outline);
        newOutline[i] = {
          ...newOutline[i],
          content: content,
          status: 'completed'
        };
        onUpdateProject({ ...project, outline: [...newOutline] });
      } catch (error) {
        console.error(`Failed to generate chapter ${i + 1}:`, error);
        newOutline[i] = { ...newOutline[i], status: 'error' };
        onUpdateProject({ ...project, outline: [...newOutline] });
        // Break on error to allow user to retry or fix
        break;
      }
    }
    
    setIsAutoGenerating(false);
  };

  const handleSingleGenerate = async (index: number) => {
    const chapter = project.outline[index];
    if (!chapter || isAutoGenerating) return;

    const newOutline = [...project.outline];
    newOutline[index] = { ...newOutline[index], status: 'generating' };
    onUpdateProject({ ...project, outline: newOutline });

    try {
      const content = await generateChapterContent(project.config, chapter, project.outline);
      newOutline[index] = {
        ...newOutline[index],
        content: content,
        status: 'completed'
      };
      onUpdateProject({ ...project, outline: newOutline });
    } catch (error) {
      newOutline[index] = { ...newOutline[index], status: 'error' };
      onUpdateProject({ ...project, outline: newOutline });
    }
  };

  const StatusIndicator = ({ status }: { status: Chapter['status'] }) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
        );
      case 'generating':
        return (
          <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 h-[calc(100vh-180px)]">
      {/* Global Progress Bar */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-6">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
            <span>Production Status</span>
            <span>{completedChapters} / {totalChapters} Chapters Completed</span>
          </div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000 ease-out shadow-lg shadow-indigo-500/50"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
        {progressPercent < 100 && !isAutoGenerating && (
          <button 
            onClick={handleGenerateAll}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            Complete All Chapters
          </button>
        )}
      </div>

      <div className="flex-1 flex gap-6 min-h-0 relative">
        {/* Sidebar Navigation */}
        {showSidebar && (
          <div className="w-72 flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-hide animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manuscript Outline</h3>
              <button onClick={() => setShowSidebar(false)} className="text-slate-300 hover:text-indigo-600 transition-colors p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
              </button>
            </div>
            {project.outline.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapterIndex(idx)}
                className={`text-left p-4 rounded-2xl transition-all border relative group ${
                  activeChapterIndex === idx 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-bold uppercase opacity-60 mb-0.5 tracking-tighter">Module {idx + 1}</div>
                    <div className="font-bold text-sm truncate leading-tight">{ch.title}</div>
                  </div>
                  <div className="shrink-0">
                    <StatusIndicator status={ch.status} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Main Editor */}
        <div className={`flex-1 flex flex-col glass-panel rounded-3xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-xl transition-all duration-300 ${!showSidebar ? 'w-full' : ''}`}>
          <div className="p-6 border-b border-slate-50 dark:border-slate-900 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/30">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">{activeChapter?.title}</h2>
                {activeChapter?.status === 'generating' && (
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">Writing...</span>
                )}
              </div>
              <p className="text-xs text-slate-400 italic mt-1 truncate">{activeChapter?.summary}</p>
            </div>
            <div className="flex gap-3 ml-4 shrink-0">
              {!showSidebar && (
                <button onClick={() => setShowSidebar(true)} className="text-slate-400 hover:text-indigo-600 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold transition-all bg-white dark:bg-slate-900">
                  Open Outline
                </button>
              )}
              {activeChapter?.status !== 'completed' && !isAutoGenerating && (
                <button
                  onClick={() => handleSingleGenerate(activeChapterIndex)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Redo This Module
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide bg-white dark:bg-slate-950">
            <div
              ref={editorRef}
              contentEditable={activeChapter?.status !== 'generating'}
              onInput={handleManualInput}
              className="prose prose-slate dark:prose-invert prose-lg max-w-none focus:outline-none min-h-full font-serif leading-relaxed text-slate-800 dark:text-slate-200"
              placeholder="Wait for AI to generate content or type here..."
            />
          </div>

          <div className="p-4 border-t border-slate-50 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/30 flex justify-between items-center">
            <button 
              onClick={onBack} 
              disabled={isAutoGenerating}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Adjust Blueprint
            </button>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300 dark:text-slate-600">
                  {activeChapter?.content?.length || 0} Characters
                </span>
                {isAutoGenerating && (
                   <span className="text-[9px] text-indigo-400 font-bold animate-pulse">AUTOPILOT ACTIVE</span>
                )}
              </div>
              <button
                onClick={onNext}
                disabled={progressPercent < 100}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${
                  progressPercent < 100 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                    : 'bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 text-white'
                }`}
              >
                {progressPercent < 100 ? 'Writing in Progress...' : 'Finalize & Preview'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingPanel;
