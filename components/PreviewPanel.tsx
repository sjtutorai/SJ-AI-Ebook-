import React, { useState, useRef } from 'react';
import { EbookProject, CoverStyle, EbookMetadata, ProjectSnapshot } from '../types';
import { exportEbook } from '../services/exportService';
import { generateCoverImage } from '../services/geminiService';

interface PreviewPanelProps {
  project: EbookProject;
  onUpdateProject: (p: EbookProject) => void;
  onRestoreHistory: (snapshot: ProjectSnapshot) => void;
  onBack: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ project, onUpdateProject, onRestoreHistory, onBack }) => {
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');

  const colors = [
    { name: 'Indigo', hex: '#4f46e5', bg: 'bg-indigo-900', text: 'text-white' },
    { name: 'Crimson', hex: '#991b1b', bg: 'bg-red-950', text: 'text-white' },
    { name: 'Forest', hex: '#065f46', bg: 'bg-emerald-950', text: 'text-white' },
    { name: 'Midnight', hex: '#020617', bg: 'bg-black', text: 'text-white' },
    { name: 'Parchment', hex: '#fafaf9', bg: 'bg-stone-50', text: 'text-stone-900' },
    { name: 'Solar', hex: '#f59e0b', bg: 'bg-amber-500', text: 'text-slate-900' },
  ];

  const fonts = [
    'Playfair Display', 'Inter', 'Montserrat', 'Lora', 'Roboto Mono', 'Cinzel', 'Libre Baskerville', 'Oswald'
  ];

  const layouts = [
    { name: 'Centered Title', value: 'centered' as const },
    { name: 'Title at Bottom', value: 'bottom' as const },
    { name: 'Minimalist Frame', value: 'minimal' as const },
  ];

  const artStyles = [
    'Minimalist Educational', 'Oil Painting', 'Digital Blueprint', 'Surrealist', 'Modern Vector', 'Isometric 3D', 'Watercolour', 'Futuristic Neon'
  ];

  const aspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];

  const handleUpdateCover = (updates: Partial<CoverStyle>) => {
    onUpdateProject({
      ...project,
      coverStyle: { ...project.coverStyle, ...updates }
    });
  };

  const handleUpdateMetadata = (updates: Partial<EbookMetadata>) => {
    onUpdateProject({
      ...project,
      metadata: { ...project.metadata, ...updates }
    });
  };

  const handleSaveManualSnapshot = () => {
    if (!snapshotName) return;
    const snapshot: ProjectSnapshot = {
      timestamp: Date.now(),
      name: snapshotName,
      config: JSON.parse(JSON.stringify(project.config)),
      outline: JSON.parse(JSON.stringify(project.outline)),
      coverStyle: JSON.parse(JSON.stringify(project.coverStyle)),
    };
    onUpdateProject({
      ...project,
      history: [snapshot, ...(project.history || [])].slice(0, 15)
    });
    setSnapshotName('');
    alert('Version snapshot saved!');
  };

  const handleGenerateCover = async () => {
    setIsGeneratingCover(true);
    try {
      const imageUrl = await generateCoverImage(project);
      handleUpdateCover({ aiGeneratedImage: imageUrl, customCoverImage: undefined });
    } catch (error) {
      alert("AI cover generation failed. Please check your API key.");
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleExport = (format: 'PDF' | 'EPUB' | 'DOCX') => {
    exportEbook(project, format);
  };

  const coverImage = project.coverStyle.customCoverImage || project.coverStyle.aiGeneratedImage;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Left: Cover Design & History */}
        <div className="lg:col-span-5 space-y-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold border-l-4 border-indigo-600 pl-4 text-slate-900">Cover Artisan</h3>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {showHistory ? 'Hide History' : 'Version History'}
            </button>
          </div>

          {showHistory && (
            <div className="glass-panel p-8 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 mb-6 animate-in slide-in-from-top duration-300">
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Snapshot Name..." 
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-indigo-400"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                />
                <button 
                  onClick={handleSaveManualSnapshot}
                  disabled={!snapshotName}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold disabled:opacity-50"
                >
                  Save
                </button>
              </div>
              <h4 className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest mb-4">Past Versions</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                {project.history?.length ? project.history.map((snapshot, i) => (
                  <div
                    key={i}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:border-indigo-300 border border-transparent transition-all shadow-sm group"
                  >
                    <div onClick={() => onRestoreHistory(snapshot)} className="flex-1 cursor-pointer">
                      <p className="text-xs font-bold text-slate-700">{snapshot.name}</p>
                      <p className="text-[10px] text-slate-400">{new Date(snapshot.timestamp).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => onRestoreHistory(snapshot)}
                      className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-indigo-50 rounded-lg"
                      title="Restore this version"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    </button>
                  </div>
                )) : <p className="text-xs text-slate-400 italic text-center py-4">No snapshots available yet.</p>}
              </div>
            </div>
          )}
          
          {/* Cover Preview Container */}
          <div className={`aspect-[2/3] w-full max-w-sm mx-auto shadow-2xl rounded-sm overflow-hidden flex flex-col transition-all duration-700 relative bg-white ring-1 ring-slate-200`}>
            {/* Background Color Layer */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${project.coverStyle.bgColor}`}></div>
            
            {/* AI/Custom Image Layer */}
            {coverImage && (
              <img src={coverImage} className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-multiply transition-opacity duration-1000" alt="Cover" />
            )}
            
            {/* Overlay Gradient for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none"></div>
            
            <div className={`flex-1 flex flex-col relative z-10 p-12 ${project.coverStyle.textColor} ${project.coverStyle.layout === 'bottom' ? 'justify-end text-left' : 'justify-center text-center'} space-y-10`}>
              <div className="space-y-4">
                {project.coverStyle.layout !== 'minimal' && (
                  <p className="text-[12px] uppercase tracking-[0.4em] opacity-80 font-black drop-shadow-sm">EDUCATIONAL SYNTHESIS</p>
                )}
                <h2 className={`text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg`} style={{ fontFamily: `'${project.coverStyle.fontFamily}', serif` }}>
                  {project.config.title || 'Untitled Masterpiece'}
                </h2>
              </div>
              <div className={`w-20 h-[3px] bg-current opacity-60 ${project.coverStyle.layout === 'bottom' ? 'mr-auto' : 'mx-auto'}`}></div>
              <p className="text-2xl font-serif font-bold drop-shadow-md opacity-90">{project.config.author || 'Anonymous Author'}</p>
            </div>
            
            {project.coverStyle.layout !== 'minimal' && (
              <div className={`relative z-10 text-[11px] uppercase tracking-[0.6em] text-center opacity-70 mb-12 font-black ${project.coverStyle.textColor}`}>
                SJ AI LITERARY FORGE
              </div>
            )}
          </div>

          <div className="glass-panel p-10 rounded-[3rem] space-y-10 bg-white border border-slate-100 shadow-2xl">
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Visualization</p>
                  <button 
                    onClick={handleGenerateCover}
                    disabled={isGeneratingCover}
                    className="text-[10px] bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    {isGeneratingCover ? 'Synthesizing...' : 'Regenerate Cover Illustration'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-300 uppercase mb-3 tracking-widest">Art Style</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs focus:outline-none focus:border-indigo-500 font-bold text-slate-600 shadow-inner"
                      value={project.coverStyle.artStyle}
                      onChange={(e) => handleUpdateCover({ artStyle: e.target.value })}
                    >
                      {artStyles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-300 uppercase mb-3 tracking-widest">Aspect Ratio</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs focus:outline-none focus:border-indigo-500 font-bold text-slate-600 shadow-inner"
                      value={project.coverStyle.aspectRatio}
                      onChange={(e) => handleUpdateCover({ aspectRatio: e.target.value as any })}
                    >
                      {aspectRatios.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
             </div>

            <div className="space-y-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chromatic Identity</p>
              <div className="flex flex-wrap gap-4">
                {colors.map(c => (
                  <button
                    key={c.name}
                    onClick={() => handleUpdateCover({ bgColor: c.bg, textColor: c.text, dominantColor: c.hex })}
                    className={`w-14 h-14 rounded-2xl border-4 ${project.coverStyle.bgColor === c.bg ? 'border-indigo-500 scale-110 shadow-xl' : 'border-transparent'} ${c.bg} transition-all hover:scale-105 group relative overflow-hidden`}
                    title={c.name}
                  >
                    <div className={`absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Typography</p>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm focus:outline-none focus:border-indigo-500 font-bold text-slate-700 shadow-inner appearance-none cursor-pointer"
                  value={project.coverStyle.fontFamily}
                  onChange={(e) => handleUpdateCover({ fontFamily: e.target.value })}
                >
                  {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Composition</p>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm focus:outline-none focus:border-indigo-500 font-bold text-slate-700 shadow-inner appearance-none cursor-pointer"
                  value={project.coverStyle.layout}
                  onChange={(e) => handleUpdateCover({ layout: e.target.value as any })}
                >
                  {layouts.map(l => <option key={l.value} value={l.value}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Book Details & Global Export */}
        <div className="lg:col-span-7 space-y-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-l-4 border-indigo-600 pl-4 text-slate-900">Final Manuscript Description</h3>
            <div className="glass-panel p-10 rounded-[3rem] bg-white border border-slate-100 shadow-2xl">
              <textarea
                className="w-full min-h-[220px] bg-transparent text-slate-700 leading-relaxed font-serif italic focus:outline-none resize-none text-xl selection:bg-indigo-100"
                value={project.blurb}
                onChange={(e) => onUpdateProject({ ...project, blurb: e.target.value })}
                placeholder="The AI-generated blurb will appear here for you to polish..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold border-l-4 border-indigo-600 pl-4 text-slate-900">Cataloguing Metadata</h3>
            <div className="glass-panel p-10 rounded-[3rem] bg-white border border-slate-100 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Universal Registration (ISBN)</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-base focus:border-indigo-500 outline-none font-bold text-slate-700 shadow-inner"
                  placeholder="e.g. 978-X-XXXX-XXXX-X"
                  value={project.metadata.isbn}
                  onChange={(e) => handleUpdateMetadata({ isbn: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Publishing Imprint</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-base focus:border-indigo-500 outline-none font-bold text-slate-700 shadow-inner"
                  placeholder="SJ AI Literary Forge"
                  value={project.metadata.publisher}
                  onChange={(e) => handleUpdateMetadata({ publisher: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Semantic Keywords</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-base focus:border-indigo-500 outline-none font-bold text-slate-700 shadow-inner"
                  placeholder="Education, Mastery, Artificial Intelligence, Synthesis..."
                  value={project.metadata.keywords}
                  onChange={(e) => handleUpdateMetadata({ keywords: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex justify-between items-center px-4">
               <h3 className="text-2xl font-bold text-slate-900">Publication Formats</h3>
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[11px] text-emerald-600 uppercase tracking-[0.2em] font-black">Optimization Complete</span>
               </div>
            </div>
            <div className="grid grid-cols-3 gap-8">
              {[
                { label: 'PDF DOCUMENT', format: 'PDF' as const, bg: 'bg-red-50', icon: 'M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z', color: 'text-red-600' },
                { label: 'EPUB READER', format: 'EPUB' as const, bg: 'bg-indigo-50', icon: 'M9 4.804A7.903 7.903 0 0111.5 4c.46 0 .905.039 1.334.114a2.994 2.994 0 012.232 3.621L14.584 15.1a2 2 0 01-3.136 1.126 5.99 5.99 0 00-2.448-1.423V4.804z', color: 'text-indigo-600' },
                { label: 'WORD FILE', format: 'DOCX' as const, bg: 'bg-blue-50', icon: 'M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z', color: 'text-blue-600' },
              ].map((item) => (
                <button 
                  key={item.format}
                  onClick={() => handleExport(item.format)}
                  className="bg-white border border-slate-100 p-10 rounded-[3rem] flex flex-col items-center gap-6 transition-all hover:border-indigo-500 hover:shadow-2xl group active:scale-95 shadow-sm"
                >
                  <div className={`p-5 ${item.bg} rounded-[1.5rem] group-hover:scale-110 transition-transform`}>
                    <svg className={`w-10 h-10 ${item.color}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-xs font-black text-slate-900 tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-8 pt-6">
            <button 
              onClick={onBack}
              className="flex-1 border-2 border-slate-100 text-slate-500 hover:text-slate-900 py-6 rounded-[2rem] transition-all hover:bg-slate-50 font-black text-base shadow-sm active:scale-95"
            >
              RETURN TO STUDIO
            </button>
            <button 
              onClick={() => { if(confirm("This will discard the current project state. Proceed?")) window.location.reload(); }}
              className="flex-1 bg-slate-900 text-white py-6 rounded-[2rem] transition-all hover:bg-black font-black text-base shadow-2xl active:scale-95"
            >
              FORGE NEW WORK
            </button>
          </div>
        </div>
      </div>

      {/* Reader Experience Preview */}
      <div className="mt-32 glass-panel p-20 rounded-[5rem] bg-white border border-slate-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto space-y-32">
           <div className="text-center space-y-6">
              <h3 className="text-6xl font-serif font-bold text-slate-900 tracking-tight">Manuscript Preview</h3>
              <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">A DIGITAL TRANSCRIPTION OF YOUR CREATION</p>
           </div>
          
          <div className="space-y-40">
            {project.outline.map((ch, idx) => (
              <article key={ch.id} className="group animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="mb-16 space-y-8">
                  <div className="flex items-center gap-8">
                    <span className="w-16 h-[2px] bg-indigo-500"></span>
                    <span className="text-xs uppercase tracking-[0.6em] font-black text-indigo-600">MODULE {idx + 1}</span>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-300">[{ch.type}]</span>
                  </div>
                  <h4 className="text-6xl font-serif text-slate-900 leading-tight font-bold tracking-tight">{ch.title}</h4>
                </div>
                <div 
                  className="prose prose-slate prose-2xl text-slate-800 leading-[2] font-serif whitespace-pre-wrap selection:bg-indigo-100 first-letter:text-8xl first-letter:font-black first-letter:text-indigo-600 first-letter:mr-4 first-letter:float-left first-letter:leading-none"
                  dangerouslySetInnerHTML={{ __html: ch.content }}
                />
                <div className="mt-24 flex justify-center opacity-5">
                   <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
