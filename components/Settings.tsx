
import React, { useState } from 'react';
import { User, signOut, deleteUser, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { StudioSettings, ThemeMode, FontStyle, AccentColor, AITone, ExportFormat, PageSize, FontSize, LineSpacing } from '../types';

interface SettingsProps {
  user: User;
  settings: StudioSettings;
  onUpdateSettings: (settings: StudioSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, settings, onUpdateSettings }) => {
  const [loading, setLoading] = useState(false);

  const handleUpdate = (path: string, value: any) => {
    const newSettings = { ...settings };
    const keys = path.split('.');
    let current: any = newSettings;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onUpdateSettings(newSettings);
  };

  const handleClearCache = () => {
    if (confirm("This will clear all local project data. Are you sure?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handlePasswordReset = async () => {
    if (!user.email) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert('Password reset instructions sent to your email.');
    } catch (err) {
      alert('Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');

  // Fix: Made children optional to ensure TypeScript correctly identifies them when components are used with nested content
  const Section = ({ title, description, children }: { title: string, description: string, children?: React.ReactNode }) => (
    <div className="glass-panel rounded-[2.5rem] p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">{children}</div>
    </div>
  );

  // Fix: Made children optional to ensure TypeScript correctly identifies them when components are used with nested content
  const ControlGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div className="space-y-3">
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      {children}
    </div>
  );

  const Toggle = ({ checked, onChange, label }: { checked: boolean, onChange: (v: boolean) => void, label: string }) => (
    <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
      <div className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={`w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-slate-700 ${checked ? 'bg-indigo-600 dark:bg-indigo-500' : ''}`}></div>
      </div>
    </label>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32">
      <div className="mb-12">
        <h2 className="text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">Studio Forge</h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Calibrate the SJ AI engine and personalize your authorial workspace.</p>
      </div>

      {/* 1. Account Settings */}
      <Section title="1. Author Identity" description="Manage your credentials and pen name synchronization.">
        <ControlGroup label="Display Pen Name">
          <input 
            type="text" 
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500" 
            value={user.displayName || ''} 
            readOnly
          />
        </ControlGroup>
        <ControlGroup label="Account Security">
          <div className="flex gap-4">
            <button onClick={() => signOut(auth)} className="flex-1 bg-slate-900 text-white text-xs font-bold py-3.5 rounded-xl hover:bg-black transition-all">Sign Out</button>
            <button 
              onClick={handlePasswordReset} 
              disabled={isGoogleUser} 
              className="flex-1 border border-slate-200 dark:border-slate-700 text-xs font-bold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-30"
            >
              Change Password
            </button>
          </div>
        </ControlGroup>
      </Section>

      {/* 2. AI Generation Settings */}
      <Section title="2. AI Core Calibration" description="Configure the default parameters for the Gemini synthesis engine.">
        <ControlGroup label="Synthesis Language">
          <select className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-3.5 border-none font-bold text-slate-800 dark:text-white" value={settings.aiDefaults.language} onChange={e => handleUpdate('aiDefaults.language', e.target.value)}>
            {['English', 'Spanish', 'French', 'German', 'Japanese'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </ControlGroup>
        <ControlGroup label="Authorial Tone">
          <select className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-3.5 border-none font-bold text-slate-800 dark:text-white" value={settings.aiDefaults.tone} onChange={e => handleUpdate('aiDefaults.tone', e.target.value as AITone)}>
            {['Simple', 'Academic', 'Professional', 'Storytelling'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </ControlGroup>
        <div className="col-span-full">
          <Toggle label="Automated Table of Contents" checked={settings.aiDefaults.autoTOC} onChange={v => handleUpdate('aiDefaults.autoTOC', v)} />
        </div>
      </Section>

      {/* 3. Output & Download Settings */}
      <Section title="3. Manuscript Output" description="Define the typesetting and format of your exported works.">
        <ControlGroup label="Default Format">
          <div className="grid grid-cols-3 gap-2">
            {(['PDF', 'DOCX', 'EPUB'] as ExportFormat[]).map(f => (
              <button key={f} onClick={() => handleUpdate('outputDefaults.format', f)} className={`py-3 rounded-xl text-xs font-bold ${settings.outputDefaults.format === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{f}</button>
            ))}
          </div>
        </ControlGroup>
        <ControlGroup label="Page Geometry">
          <select className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-3.5 border-none font-bold text-slate-800 dark:text-white" value={settings.outputDefaults.pageSize} onChange={e => handleUpdate('outputDefaults.pageSize', e.target.value as PageSize)}>
            <option value="A4">Standard A4</option>
            <option value="Letter">US Letter</option>
          </select>
        </ControlGroup>
      </Section>

      {/* 4. Appearance Settings */}
      <Section title="4. Studio Aesthetics" description="Customize the visual atmosphere of your writing environment.">
        <ControlGroup label="Interface Theme">
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'system'] as ThemeMode[]).map(t => (
              <button key={t} onClick={() => handleUpdate('appearance.theme', t)} className={`py-3 rounded-xl text-xs font-bold capitalize ${settings.appearance.theme === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{t}</button>
            ))}
          </div>
        </ControlGroup>
        <ControlGroup label="Primary Accent">
          <div className="flex gap-3">
            {(['indigo', 'emerald', 'rose', 'amber', 'slate'] as AccentColor[]).map(c => (
              <button key={c} onClick={() => handleUpdate('appearance.accentColor', c)} className={`w-10 h-10 rounded-full border-2 transition-all ${settings.appearance.accentColor === c ? 'border-indigo-500 scale-110' : 'border-transparent'} ${c === 'indigo' ? 'bg-indigo-600' : c === 'emerald' ? 'bg-emerald-600' : c === 'rose' ? 'bg-rose-600' : c === 'amber' ? 'bg-amber-600' : 'bg-slate-600'}`} />
            ))}
          </div>
        </ControlGroup>
        <div className="col-span-full">
           <Toggle label="High-Readability Font Mode (Serif)" checked={settings.appearance.fontStyle === 'readable'} onChange={v => handleUpdate('appearance.fontStyle', v ? 'readable' : 'modern')} />
        </div>
      </Section>

      {/* 5-7. Combined Experience & Data */}
      <Section title="5-7. Experience & Data" description="Optimize workflow efficiency and data synchronization.">
        <Toggle label="Slide Navigation Animations" checked={settings.experience.enableAnimations} onChange={v => handleUpdate('experience.enableAnimations', v)} />
        <Toggle label="Remember Last Opened Page" checked={settings.experience.rememberLastPage} onChange={v => handleUpdate('experience.rememberLastPage', v)} />
        <Toggle label="Auto-Save Drafts" checked={settings.storage.autoSave} onChange={v => handleUpdate('storage.autoSave', v)} />
        <Toggle label="Cloud Sync Synchronization" checked={settings.storage.cloudSync} onChange={v => handleUpdate('storage.cloudSync', v)} />
      </Section>

      {/* 8-10. Legal & About */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-panel p-10 rounded-[2.5rem] bg-slate-900 text-white space-y-6">
          <h3 className="text-xl font-bold">About SJ AI Forge</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Version</span>
              <span className="text-sm font-bold">v1.2.0 - Synthesis</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Engine</span>
              <span className="text-sm font-bold text-indigo-400">Gemini 3 Pro</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Dev</span>
              <span className="text-sm font-bold">SJ AI Lab</span>
            </div>
          </div>
          <div className="pt-4 flex gap-4">
             <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors underline">Privacy Policy</button>
             <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors underline">Terms of Use</button>
          </div>
        </div>

        <div className="glass-panel p-10 rounded-[2.5rem] bg-red-950/20 border border-red-900/30 text-red-900 dark:text-red-400 space-y-8">
          <div>
            <h3 className="text-xl font-bold mb-2">Danger Zone</h3>
            <p className="text-xs opacity-70">Irreversible studio actions.</p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={handleClearCache}
              className="w-full py-4 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 text-red-600 font-bold text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              Clear Local Cache
            </button>
            <button 
              onClick={() => { if(confirm("Terminate account identity?")) deleteUser(user).then(() => window.location.reload()); }}
              className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
            >
              Terminate Identity
            </button>
          </div>
        </div>
      </div>

      {/* Help & Support Footer */}
      <div className="text-center space-y-4 pt-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Need Assistance?</p>
        <div className="flex justify-center gap-8">
           <button className="text-sm font-bold text-indigo-600 hover:underline">Documentation</button>
           <button className="text-sm font-bold text-indigo-600 hover:underline">Report a Bug</button>
           <button className="text-sm font-bold text-indigo-600 hover:underline">FAQ</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
