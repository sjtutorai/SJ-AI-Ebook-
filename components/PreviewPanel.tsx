
import React, { useState, useRef } from 'react';
import { EbookProject, CoverStyle, EbookMetadata } from '../types';
import { exportEbook } from '../services/exportService';
import { generateCoverImage } from '../services/geminiService';

interface PreviewPanelProps {
  project: EbookProject;
  onUpdateProject: (p: EbookProject) => void;
  onBack: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ project, onUpdateProject, onBack }) => {
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = [
    { name: 'Midnight', bg: 'bg-indigo-950', text: 'text-white' },
    { name: 'Ruby', bg: 'bg-red-950', text: 'text-white' },
    { name: 'Emerald', bg: 'bg-emerald-950', text: 'text-white' },
    { name: 'Obsidian', bg: 'bg-black', text: 'text-white' },
    { name: 'Cream', bg: 'bg-stone-100', text: 'text-stone-900' },
  ];

  const fonts = [
    { name: 'Serif', value: 'font-serif' as const },
    { name: 'Sans', value: 'font-sans' as const },
    { name: 'Mono', value: 'font-mono' as const },
  ];

  const layouts = [
    { name: 'Centered', value: 'centered' as const },
    { name: 'Bottom', value: 'bottom' as const },
    { name: 'Minimal', value: 'minimal' as const },
  ];

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

  const handleGenerateCover = async () => {
    setIsGeneratingCover(true);
    try {
      const imageUrl = await generateCoverImage(project.config);
      handleUpdateCover({ aiGeneratedImage: imageUrl, customCoverImage: undefined });
    } catch (error) {
      alert("Failed to generate AI cover.");
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateCover({ customCoverImage: reader.result as string, aiGeneratedImage: undefined });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = (format: 'PDF' | 'EPUB' | 'DOCX') => {
    exportEbook(project, format);
  };

  const coverImage = project.coverStyle.customCoverImage || project.coverStyle.aiGeneratedImage;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Cover Preview & Customization */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold border-l-4 border-indigo-600 pl-4 text-slate-900">Cover Designer</h3>
            <div className="flex gap-2">
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] uppercase font-bold text-slate-500 hover:text-indigo-600 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Upload Image
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              
              <button 
                onClick={handleGenerateCover}
                disabled={isGeneratingCover}
                className="text-[10px] uppercase font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {isGeneratingCover ? 'Generating...' : 'AI Cover'}
              </button>
            </div>
          </div>
          
          <div className={`aspect-[2/3] w-full max-w-sm mx-auto shadow-2xl rounded-sm overflow-hidden flex flex-col transition-all duration-500 relative ${project.coverStyle.bgColor} ${project.coverStyle.textColor} ${project.coverStyle.fontFamily}`}>
            {coverImage && (
              <img src={coverImage} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply" alt="Cover" />
            )}
            
            <div className={`flex-1 flex flex-col relative z-10 p-8 ${project.coverStyle.layout === 'bottom' ? 'justify-end text-left' : 'justify-center text-center'} space-y-8`}>
              <div className="space-y-2">
                {project.coverStyle.layout !== 'minimal' && (
                  <p className="text-[10px] uppercase tracking-[0.3em] opacity-80 font-bold">A {project.config.genre} Perspective</p>
                )}
                <h2 className={`text-3xl md:text-4xl font-bold leading-tight drop-shadow-sm`}>
                  {project.config.title}
                </h2>
              </div>
              <div className={`w-12 h-[2px] bg-current opacity-40 ${project.coverStyle.layout === 'bottom' ? 'mr-auto' : 'mx-auto'}`}></div>
              <p className="text-lg font-bold opacity-100 drop-shadow-sm">{project.config.author}</p>
            </div>
            {project.coverStyle.layout !== 'minimal' && (
              <div className="relative z-10 text-[10px] uppercase tracking-widest text-center opacity-60 mb-8 font-bold">
                SJ AI Ebook Series
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-6 bg-white border border-slate-100 shadow-lg">
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Theme Color</p>
              <div className="flex gap-3">
                {colors.map(c => (
                  <button
                    key={c.name}
                    onClick={() => handleUpdateCover({ bgColor: c.bg, textColor: c.text })}
                    className={`w-10 h-10 rounded-full border-2 ${project.coverStyle.bgColor === c.bg ? 'border-indigo-500' : 'border-transparent'} ${c.bg} transition-all shadow-md`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Typography</p>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 font-bold text-slate-700"
                  value={project.coverStyle.fontFamily}
                  onChange={(e) => handleUpdateCover({ fontFamily: e.target.value as any })}
                >
                  {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Layout</p>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 font-bold text-slate-700"
                  value={project.coverStyle.layout}
                  onChange={(e) => handleUpdateCover({ layout: e.target.value as any })}
                >
                  {layouts.map(l => <option key={l.value} value={l.value}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Book Details, Editable Blurb & Exports */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-l-4 border-indigo-600 pl-4 text-slate-900">Book Blurb (Editable)</h3>
            <div className="glass-panel p-6 rounded-3xl bg-white border border-slate-100 shadow-md">
              <textarea
                className="w-full min-h-[150px] bg-transparent text-slate-600 leading-relaxed font-serif italic focus:outline-none resize-none"
                value={project.blurb}
                onChange={(e) => onUpdateProject({ ...project, blurb: e.target.value })}
                placeholder="Write or refine your book description..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold border-l-4 border-indigo-600 pl-4 text-slate-900">Publication Metadata</h3>
            <div className="glass-panel p-6 rounded-3xl bg-white border border-slate-100 shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ISBN</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 outline-none"
                  placeholder="e.g. 978-3-16-148410-0"
                  value={project.metadata.isbn}
                  onChange={(e) => handleUpdateMetadata({ isbn: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Publisher</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 outline-none"
                  placeholder="SJ AI Publishing"
                  value={project.metadata.publisher}
                  onChange={(e) => handleUpdateMetadata({ publisher: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Keywords</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 outline-none"
                  placeholder="AI, Ebook, Future, Technology..."
                  value={project.metadata.keywords}
                  onChange={(e) => handleUpdateMetadata({ keywords: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-bold border-l-4 border-indigo-600 pl-4 text-slate-900">Export Options</h3>
               <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Ready to publish</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => handleExport('PDF')}
                className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:border-indigo-200 hover:shadow-md group"
              >
                <div className="p-2 bg-red-50 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-700">PDF</span>
              </button>

              <button 
                onClick={() => handleExport('EPUB')}
                className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:border-indigo-200 hover:shadow-md group"
              >
                <div className="p-2 bg-indigo-50 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.903 7.903 0 0111.5 4c.46 0 .905.039 1.334.114a2.994 2.994 0 012.232 3.621L14.584 15.1a2 2 0 01-3.136 1.126 5.99 5.99 0 00-2.448-1.423V4.804zM3 4.804A7.903 7.903 0 015.5 4c.46 0 .905.039 1.334.114a2.994 2.994 0 00-2.232 3.621L5.416 15.1a2 2 0 003.136 1.126 5.99 5.99 0 012.448-1.423V4.804z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-700">EPUB</span>
              </button>

              <button 
                onClick={() => handleExport('DOCX')}
                className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:border-indigo-200 hover:shadow-md group"
              >
                <div className="p-2 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-700">Word</span>
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onBack}
              className="flex-1 border border-slate-200 text-slate-400 hover:text-slate-600 py-3 rounded-xl transition-all hover:bg-slate-50 font-bold text-sm"
            >
              Back to Writing
            </button>
            <button 
              onClick={() => { if(confirm("Start a new book? Progress will be lost.")) window.location.reload(); }}
              className="flex-1 bg-slate-900 text-white py-3 rounded-xl transition-all hover:bg-black font-bold text-sm shadow-md"
            >
              New Project
            </button>
          </div>
        </div>
      </div>

      <div className="mt-20 glass-panel p-10 rounded-3xl bg-white border border-slate-100 shadow-xl">
        <h3 className="text-3xl font-serif mb-12 text-center text-slate-900 relative">
          <span className="relative z-10">Full Reader View</span>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24 h-1 bg-indigo-500 rounded-full"></div>
        </h3>
        <div className="space-y-16 max-w-2xl mx-auto">
          {project.outline.map((ch, idx) => (
            <section key={ch.id} className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-indigo-500">Chapter {idx + 1}</span>
                <h4 className="text-4xl font-serif text-slate-900 leading-tight">{ch.title}</h4>
              </div>
              <div 
                className="prose prose-slate prose-lg text-slate-700 leading-relaxed font-serif whitespace-pre-wrap selection:bg-indigo-100"
                dangerouslySetInnerHTML={{ __html: ch.content }}
              />
              <div className="w-16 h-[1px] bg-slate-100 mx-auto mt-12"></div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
