
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { EbookConfig, EbookProject, Step, Chapter, CoverStyle } from './types';
import Header from './components/Header';
import SetupForm from './components/SetupForm';
import OutlineEditor from './components/OutlineEditor';
import WritingPanel from './components/WritingPanel';
import PreviewPanel from './components/PreviewPanel';
import Auth from './components/Auth';
import { generateOutline, generateBlurb } from './services/geminiService';

const STORAGE_KEY = 'sj-ai-ebook-project-v4';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('setup');
  const [isLoading, setIsLoading] = useState(false);
  
  const [project, setProject] = useState<EbookProject>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id && parsed.config) return parsed;
      } catch (e) {
        console.error("Failed to load saved project", e);
      }
    }
    return {
      id: Math.random().toString(36).substr(2, 9),
      config: {
        title: '',
        author: '',
        genre: 'Educational',
        tone: 'Simple, clear, and easy to understand',
        language: 'English',
        chapterCount: 5,
        classLevel: 'High School',
        length: 'Medium',
      },
      outline: [],
      coverStyle: {
        bgColor: 'bg-indigo-900',
        textColor: 'text-white',
        layout: 'centered',
        fontFamily: 'font-serif'
      },
      blurb: '',
      metadata: {
        isbn: '',
        publisher: '',
        keywords: ''
      }
    };
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser && currentUser.displayName) {
        setShowAuthModal(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }, [project]);

  const handleAuthComplete = () => {
    if (auth.currentUser) {
      setUser({ ...auth.currentUser });
      setTimeout(() => {
        setShowAuthModal(false);
      }, 1000);
    }
  };

  const handleStartGeneration = async (config: EbookConfig) => {
    setProject(prev => ({ ...prev, config }));
    
    if (!user || !user.displayName) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const outline = await generateOutline(config);
      setProject(prev => ({ ...prev, outline }));
      setCurrentStep('outline');
    } catch (error) {
      console.error("Outline generation error:", error);
      alert("Failed to generate outline. Please check your API connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishWriting = async () => {
    setIsLoading(true);
    try {
      const blurb = await generateBlurb(project.config, project.outline);
      setProject(prev => ({ ...prev, blurb }));
      setCurrentStep('preview');
    } catch (error) {
      setCurrentStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset current project?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header 
        step={currentStep} 
        onReset={handleReset} 
        user={user} 
        onShowAuth={() => setShowAuthModal(true)} 
      />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {showAuthModal ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Auth onComplete={handleAuthComplete} />
            <button 
              onClick={() => setShowAuthModal(false)}
              className="mt-6 text-slate-400 hover:text-indigo-600 text-sm font-medium transition-colors"
            >
              ← Cancel and Return
            </button>
          </div>
        ) : (
          <>
            {currentStep === 'setup' && (
              <SetupForm onSubmit={handleStartGeneration} isLoading={isLoading} />
            )}
            
            {currentStep === 'outline' && (
              <OutlineEditor 
                project={project} 
                onUpdate={(outline) => setProject(p => ({ ...p, outline }))} 
                onNext={() => setCurrentStep('writing')}
                onBack={() => setCurrentStep('setup')}
              />
            )}

            {currentStep === 'writing' && (
              <WritingPanel 
                project={project} 
                onUpdateProject={setProject}
                onNext={handleFinishWriting}
                onBack={() => setCurrentStep('outline')}
              />
            )}

            {currentStep === 'preview' && (
              <PreviewPanel 
                project={project} 
                onUpdateProject={setProject}
                onBack={() => setCurrentStep('writing')}
              />
            )}
          </>
        )}
      </main>

      <footer className="py-10 border-t border-slate-100 text-center text-slate-400 text-xs tracking-widest uppercase font-bold">
        &copy; 2025 SJ AI Ebook Generation &bull; Powered by Gemini
      </footer>
    </div>
  );
};

export default App;
