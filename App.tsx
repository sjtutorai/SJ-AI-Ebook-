
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { 
  EbookConfig, EbookProject, Step, Chapter, ViewState, 
  StudioSettings
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
  const [syncing, setSyncing] = useState(false);
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [currentStep, setCurrentStep] = useState<Step>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<EbookConfig | null>(null);
  
  const [settings, setSettings] = useState<StudioSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [projects, setProjects] = useState<EbookProject[]>([]);

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  // Handle Auth & Cloud Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser) {
        setSyncing(true);
        try {
          const q = query(collection(db, "projects"), where("userId", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);
          const cloudProjects: EbookProject[] = [];
          querySnapshot.forEach((doc) => {
            cloudProjects.push(doc.data() as EbookProject);
          });

          const savedLocal = localStorage.getItem(PROJECTS_KEY);
          const localProjects: EbookProject[] = savedLocal ? JSON.parse(savedLocal) : [];

          const merged = [...cloudProjects];
          localProjects.forEach(local => {
            if (!merged.find(m => m.id === local.id)) {
              merged.push(local);
              setDoc(doc(db, "projects", local.id), { ...local, userId: currentUser.uid });
            }
          });
          
          setProjects(merged.sort((a, b) => b.updatedAt - a.updatedAt));
        } catch (error) {
          console.error("Cloud sync error:", error);
        } finally {
          setSyncing(false);
        }

        if (pendingConfig) {
          handleStartGeneration(pendingConfig);
          setPendingConfig(null);
          setShowAuthOverlay(false);
        }
      } else {
        setProjects([]);
        localStorage.removeItem(PROJECTS_KEY);
      }
    });
    return () => unsubscribe();
  }, [pendingConfig]);

  useEffect(() => {
    if (user && projects.length > 0) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    }
  }, [projects, user]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applyAppearance(settings);
  }, [settings]);

  const applyAppearance = (s: StudioSettings) => {
    const root = document.documentElement;
    if (s.appearance.theme === 'dark' || (s.appearance.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const colors = { indigo: '#4f46e5', emerald: '#10b981', rose: '#f43f5e', amber: '#f59e0b', slate: '#475569' };
    root.style.setProperty('--accent-color', colors[s.appearance.accentColor]);
  };

  const updateActiveProject = async (updates: Partial<EbookProject>) => {
    if (!activeProjectId) return;
    
    const updatedProjects = projects.map(p => {
      if (p.id === activeProjectId) {
        const updated = { ...p, ...updates, updatedAt: Date.now() };
        if (user) {
          setDoc(doc(db, "projects", p.id), { ...updated, userId: user.uid }, { merge: true });
        }
        return updated;
      }
      return p;
    });
    
    setProjects(updatedProjects);
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Permanently delete this manuscript?")) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (user) {
        try {
          await deleteDoc(doc(db, "projects", id));
        } catch (error) {
          console.error("Error deleting from cloud:", error);
        }
      }
    }
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
    
    if (user) {
      setDoc(doc(db, "projects", newId), { ...newProject, userId: user.uid });
    }
    
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
    } catch (error: any) {
      console.error("Outline Generation Detailed Error:", error);
      if (settings.notifications.errorAlerts) {
        alert("AI Generation Error: " + (error?.message || "Internal Context Rejection. Please check your API key and connection."));
      }
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
      setCurrentStep('preview');
    } catch (error: any) {
      console.error("Finalization Error:", error);
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
          {(activeView === 'dashboard' || activeView === 'my-books') && (
            <div className="space-y-6">
              {syncing && (
                <div className="flex items-center gap-3 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold py-3 px-6 rounded-2xl animate-pulse">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Synchronizing Manuscript History...
                </div>
              )}
              <Dashboard 
                projects={projects} 
                onSelect={(id) => { setActiveProjectId(id); setActiveView('create'); setCurrentStep('preview'); }} 
                onNew={handleCreateNew}
                onDelete={handleDeleteProject}
                user={user}
              />
            </div>
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
