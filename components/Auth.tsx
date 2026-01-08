import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../services/firebase';

type AuthMode = 'signin' | 'signup' | 'profile-setup' | 'success';

interface AuthProps {
  onComplete?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');

  const avatars = [
    'Felix', 'Aneka', 'Casper', 'Midnight', 'Spooky', 'Ginger', 'Sassy'
  ].map(seed => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);

  const generateUsername = () => {
    const prefixes = ['Pen', 'Ink', 'Story', 'Plot', 'Word', 'Page', 'Book'];
    const suffixes = ['Smith', 'Weaver', 'Master', 'Knight', 'Seeker', 'Crafter', 'Sage'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const randomNum = Math.floor(Math.random() * 100);
    setUsername(`${prefix}${suffix}${randomNum}`);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      if (onComplete) onComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
        setMode('profile-setup');
      } else {
        let loginEmail = email;
        if (!email.includes('@')) {
          const storedEmail = localStorage.getItem(`user_map_${email}`);
          if (storedEmail) {
            loginEmail = storedEmail;
          } else {
            throw new Error("Username not found. Please use your email.");
          }
        }
        await signInWithEmailAndPassword(auth, loginEmail, password);
        if (onComplete) onComplete();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSetup = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: username || name,
          photoURL: avatar
        });
        
        if (username) {
          localStorage.setItem(`user_map_${username}`, email);
        }

        await auth.currentUser.reload();
        setMode('success');
        
        // Notify the parent that authentication and profile setup are complete
        if (onComplete) {
          onComplete();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'success') {
    return (
      <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">You're all set!</h2>
        <p className="text-slate-500 text-sm mb-8">Redirecting you to the studio...</p>
        <div className="w-12 h-1 bg-indigo-600 rounded-full mx-auto animate-pulse"></div>
      </div>
    );
  }

  if (mode === 'profile-setup') {
    return (
      <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Complete Profile</h2>
          <p className="text-slate-500 text-sm">Personalize your creative identity</p>
        </div>

        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-50 overflow-hidden bg-slate-50 shadow-inner">
              <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto w-full py-2 scrollbar-hide">
            {avatars.map((url, i) => (
              <button 
                key={i} 
                onClick={() => setAvatar(url)}
                className={`w-12 h-12 rounded-full border-2 transition-all shrink-0 ${avatar === url ? 'border-indigo-600 scale-110' : 'border-transparent opacity-60'}`}
              >
                <img src={url} className="w-full h-full" alt="avatar option" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Your Creative Username</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                placeholder="e.g. MasterScribe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button 
                onClick={generateUsername}
                className="bg-indigo-50 text-indigo-600 p-3 rounded-xl hover:bg-indigo-100 transition-colors"
                title="Generate Username"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              </button>
            </div>
          </div>

          <button
            onClick={handleProfileSetup}
            disabled={loading || !username}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-50"
          >
            {loading ? 'Finalizing...' : 'Start Creating'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-500 text-sm">
          {mode === 'signin' ? 'Sign in to access your creative projects' : 'Start your journey as an AI-powered author'}
        </p>
      </div>

      <div className="flex bg-slate-50 p-1 rounded-2xl mb-8">
        <button 
          onClick={() => setMode('signin')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode === 'signin' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
        >
          Sign In
        </button>
        <button 
          onClick={() => setMode('signup')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4 mb-8">
        {mode === 'signup' && (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
            {mode === 'signin' ? 'Email or Username' : 'Email Address'}
          </label>
          <input
            type={mode === 'signin' ? 'text' : 'email'}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
            placeholder={mode === 'signin' ? "Email or Username" : "Email Address"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
          <input
            type="password"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tighter">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In' : 'Continue'}
        </button>
      </form>

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-300"><span className="bg-white px-4">Or continue with</span></div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"></path>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        </svg>
        Google
      </button>
    </div>
  );
};

export default Auth;