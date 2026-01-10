
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { 
  EbookConfig, EbookProject, Step, Chapter, ViewState, 
  ProjectSnapshot, StudioSettings
} from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SetupForm from './components/SetupForm';
import OutlineEditor from './components/OutlineEditor';
import WritingPanel from './components/WritingPanel';
import PreviewPanel from './components/PreviewPanel';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Settings from './components/Settings';
import { generateOutline, generateBlurb, generateCoverImage } from './services/geminiService';

const PROJECTS_KEY = 'sj-ai-ebook-projects-v8';
const SETTINGS_KEY = 'sj-ai-studio-settings-v1';

const DEFAULT_SETTINGS: StudioSettings = {
  aiDefaults: {
    language: 'English',
    tone: 'Professional',
    chapterCount: 5,
    wordLimitPerChapter: 500,
    autoTOC: true
  },
  outputDefaults: {
    format: 'PDF',
    pageSize: 'A4',
    fontSize: 'Medium',
    lineSpacing: 'Normal'
  },
  appearance: {
    theme: 'light',
    fontStyle: 'modern',
    accentColor: 'indigo'
  },
  experience: {
    enableAnimations: true,
    rememberLastPage: true,
    quickCreateShortcut: false
  },
  notifications: {
    genComplete: true,
    errorAlerts: true,
    announcements: false
  },
  storage: {
    autoSave: true,
    cloudSync: true
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<EbookConfig | null>(null);
  
  const [settings, setSettings] = useState<StudioSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [projects, setProjects] = useState<EbookProject[]>(() => {
    const saved = localStorage.getItem(PROJECTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser && pendingConfig) {
        handleStartGeneration(pendingConfig);
        setPendingConfig(null);
        setShowAuthOverlay(false);
      }
    });
    return () => unsubscribe();
  }, [pendingConfig]);

  useEffect(() => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applyAppearance(settings);
  }, [settings]);

  const applyAppearance = (s: StudioSettings) => {
    const root = document.documentElement;
    const body = document.body;

    // Theme
    if (s.appearance.theme === 'dark' || (s.appearance.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Font
    body.style.fontFamily = s.appearance.fontStyle === 'readable' 
      ? "'Playfair Display', serif" 
      : "'Inter', sans-serif";
    
    // Accent Color
    const colors = {
      indigo: '#4f46e5',
      emerald: '#10b981',
      rose: '#f43f5e',
      amber: '#f59e0b',
      slate: '#475569'
    };
    root.style.setProperty('--accent-color', colors[s.appearance.accentColor]);

    // Animations toggle (Simple implementation)
    if (!s.experience.enableAnimations) {
      root.style.setProperty('--animation-duration', '0ms');
    } else {
      root.style.setProperty('--animation-duration', '300ms');
    }
  };

  const updateActiveProject = (updates: Partial<EbookProject>) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId ? { ...p, ...updates, updatedAt: Date.now() } : p
    ));
  };

  const handleCreateNew = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newProject: EbookProject = {
      id: newId,
      config: {
        title: '',
        author: user?.displayName || '',
        genre: 'Educational',
        tone: settings.aiDefaults.tone,
        language: settings.aiDefaults.language,
        chapterCount: settings.aiDefaults.chapterCount,
        classLevel: 'High School',
        length: 'Medium',
        wordLimit: settings.aiDefaults.chapterCount * settings.aiDefaults.wordLimitPerChapter
      },
      outline: [],
      coverStyle: {
        bgColor: 'bg-slate-900',
        textColor: 'text-white',
        layout: 'centered',
        fontFamily: settings.appearance.fontStyle === 'readable' ? 'Playfair Display' : 'Inter',
        aspectRatio: '3:4',
        artStyle: 'Minimalist Educational',
        dominantColor: '#4f46e5'
      },
      blurb: '',
      metadata: { isbn: '', publisher: 'SJ AI Literary Forge', keywords: '' },
      updatedAt: Date.now(),
      history: []
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newId);
    setCurrentStep('setup');
    setActiveView('create');
  };

  const handleStartGeneration = async (config: EbookConfig) => {
    if (!auth.currentUser) {
      setPendingConfig(config);
      setShowAuthOverlay(true);
      return;
    }
    updateActiveProject({ config });
    setIsLoading(true);
    try {
      const outline = await generateOutline(config);
      updateActiveProject({ outline });
      setCurrentStep('outline');
    } catch (error) {
      if (settings.notifications.errorAlerts) alert("AI Generation Error: Studio context rejected.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishWriting = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    try {
      const blurbPromise = generateBlurb(activeProject.config, activeProject.outline);
      const coverPromise = generateCoverImage(activeProject);
      const [blurb, coverUrl] = await Promise.all([blurbPromise, coverPromise]);

      updateActiveProject({ 
        blurb,
        coverStyle: { ...activeProject.coverStyle, aiGeneratedImage: coverUrl }
      });
      if (settings.notifications.genComplete && user) {
        // Notification could be a toast in a full implementation
      }
      setCurrentStep('preview');
    } catch (error) {
      setCurrentStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 overflow-hidden`}>
      <Sidebar 
        activeView={activeView} 
        onViewChange={(view) => {
          if ((view === 'my-books' || view === 'profile' || view === 'settings') && !user) {
            setShowAuthOverlay(true);
          } else {
            setActiveView(view);
          }
        }} 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewProject={handleCreateNew}
        user={user}
        accentColor={settings.appearance.accentColor}
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header 
          step={activeView === 'create' ? currentStep : null} 
          user={user} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onShowAuth={() => setShowAuthOverlay(true)}
          accentColor={settings.appearance.accentColor}
        />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide dark:bg-slate-900/50">
          {activeView === 'dashboard' && (
            <Dashboard 
              projects={projects} 
              onSelect={(id) => { setActiveProjectId(id); setActiveView('create'); setCurrentStep('preview'); }} 
              onNew={handleCreateNew}
              onDelete={(id) => setProjects(prev => prev.filter(p => p.id !== id))}
              user={user}
            />
          )}

          {activeView === 'create' && activeProject && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
              {currentStep === 'setup' && (
                <SetupForm onSubmit={handleStartGeneration} isLoading={isLoading} initialData={activeProject.config} />
              )}
              {currentStep === 'outline' && (
                <OutlineEditor 
                  project={activeProject} 
                  onUpdate={(outline) => updateActiveProject({ outline })} 
                  onNext={() => setCurrentStep('writing')}
                  onBack={() => setCurrentStep('setup')}
                />
              )}
              {currentStep === 'writing' && (
                <WritingPanel 
                  project={activeProject} 
                  onUpdateProject={updateActiveProject}
                  onNext={handleFinishWriting}
                  onBack={() => setCurrentStep('outline')}
                />
              )}
              {currentStep === 'preview' && (
                <PreviewPanel 
                  project={activeProject} 
                  onUpdateProject={updateActiveProject}
                  onRestoreHistory={(s) => updateActiveProject({ config: s.config, outline: s.outline, coverStyle: s.coverStyle })}
                  onBack={() => setCurrentStep('writing')}
                />
              )}
            </div>
          )}

          {activeView === 'profile' && user && (
            <Profile user={user} />
          )}

          {activeView === 'settings' && user && (
            <Settings 
              user={user} 
              settings={settings} 
              onUpdateSettings={(s) => setSettings(s)} 
            />
          )}

          {activeView === 'my-books' && (
             <div className="max-w-4xl mx-auto text-center py-20">
               <h2 className="text-3xl font-bold mb-4">Personal Library</h2>
               <p className="text-slate-500">All your generated ebooks appear in the dashboard.</p>
             </div>
          )}
        </main>
      </div>

      {showAuthOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="relative w-full max-w-md">
            <Auth 
              onComplete={() => setShowAuthOverlay(false)} 
              onClose={() => { setShowAuthOverlay(false); setPendingConfig(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
