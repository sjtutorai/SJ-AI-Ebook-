
import React, { useState } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [name, setName] = useState(user.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await updateProfile(user, { displayName: name });
      setMessage('Profile identity synchronized successfully.');
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">Author Profile</h2>
        <p className="text-slate-500">Manage your public persona within the SJ AI Studio.</p>
      </div>

      <div className="glass-panel rounded-[3rem] p-12 bg-white border border-slate-100 shadow-2xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-indigo-50 shadow-xl bg-slate-100">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`} 
                className="w-full h-full object-cover" 
                alt="Profile"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-slate-100">
               <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="flex-1 space-y-8 w-full">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Pen Name / Display Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-lg font-bold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-inner"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your pen name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Registered Email</label>
                <input
                  type="text"
                  disabled
                  className="w-full bg-slate-100 border border-slate-100 rounded-2xl px-6 py-4 text-slate-400 font-medium cursor-not-allowed"
                  value={user.email || ''}
                />
                <p className="text-[10px] text-slate-400 mt-2 italic ml-1">Email cannot be changed once the author identity is forged.</p>
              </div>
            </div>

            {message && (
              <p className={`text-sm font-bold ${message.includes('success') ? 'text-emerald-500' : 'text-red-500'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || name === user.displayName}
              className="bg-indigo-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl hover:bg-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95"
            >
              {loading ? 'Synchronizing...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
