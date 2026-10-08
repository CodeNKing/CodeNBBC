import React, { useState } from 'react';
import { CloudAccount, UserProfile, Squad } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Cloud, 
  CloudCheck, 
  Shield, 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  Check, 
  ArrowRight, 
  RefreshCw,
  LogOut,
  X
} from 'lucide-react';

interface CloudAccountModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isMandatory?: boolean;
  currentAccount: CloudAccount | null;
  onSaveAccount: (account: CloudAccount, clubName?: string, clubLogo?: string) => void;
  onSwitchAccount: (emailOrId: string, password?: string) => boolean;
  onForceSync: () => void;
  onSignOut?: () => void;
}

export const CloudAccountModal: React.FC<CloudAccountModalProps> = ({
  isOpen,
  onClose,
  isMandatory = false,
  currentAccount,
  onSaveAccount,
  onSwitchAccount,
  onForceSync,
  onSignOut
}) => {
  const [mode, setMode] = useState<'register' | 'login' | 'manage'>(
    currentAccount ? 'manage' : 'register'
  );

  // Form states
  const [managerName, setManagerName] = useState(currentAccount?.managerName || 'Nathan');
  const [email, setEmail] = useState(currentAccount?.email || '');
  const [password, setPassword] = useState('');
  const [clubName, setClubName] = useState('Chicago Street Ballers');
  const [clubLogo, setClubLogo] = useState('🏀');
  const [conference, setConference] = useState<'East' | 'West'>('East');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState(false);

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerName.trim() || !email.trim()) {
      setErrorMsg('Please provide a manager name and email/cloud ID.');
      return;
    }

    const cloudSyncId = 'BBC-CLD-' + Math.floor(100000 + Math.random() * 900000);
    const newAccount: CloudAccount = {
      id: 'acc_' + Date.now(),
      managerName: managerName.trim(),
      email: email.trim().toLowerCase(),
      cloudSyncId,
      lastSyncedAt: Date.now(),
      conferencePreference: conference,
      avatarEmoji: clubLogo,
      passwordHash: password.trim()
    };

    sound.playWalkout();
    try {
      confetti({ particleCount: 70, spread: 70 });
    } catch {}

    onSaveAccount(newAccount, clubName, clubLogo);
    setErrorMsg(null);
    if (onClose) onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your Cloud ID or Email.');
      return;
    }

    const success = onSwitchAccount(email.trim().toLowerCase(), password.trim());
    if (success) {
      sound.playPackTear();
      setErrorMsg(null);
      if (onClose) onClose();
    } else {
      sound.playDribble();
      setErrorMsg('Cloud account not found or invalid credentials.');
    }
  };

  const handleManualSync = () => {
    sound.playPackTear();
    onForceSync();
    setSyncToast(true);
    setTimeout(() => setSyncToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xl shadow">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-rajdhani font-black text-2xl text-white tracking-wide">
                CODEN BBC CLOUD ACCOUNT
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {currentAccount ? 'Connected to Global Cloud Server' : 'Mandatory Cloud Save Registration'}
              </p>
            </div>
          </div>

          {!isMandatory && onClose && (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sync alert banner */}
        {syncToast && (
          <div className="bg-cyan-500 text-slate-950 font-rajdhani font-black px-4 py-2 text-center text-xs tracking-wider flex items-center justify-center gap-2 shadow-inner">
            <Check className="w-4 h-4" />
            <span>Franchise data successfully backed up to Cloud Server!</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* VIEW: ACCOUNT ALREADY CONNECTED */}
          {mode === 'manage' && currentAccount && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl shadow">
                      {currentAccount.avatarEmoji || '🏀'}
                    </div>
                    <div>
                      <h4 className="font-rajdhani font-black text-xl text-white">
                        {currentAccount.managerName}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">{currentAccount.email}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Cloud Active</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Cloud Save ID:</span>
                    <strong className="text-cyan-400 font-bold">{currentAccount.cloudSyncId}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Last Synced:</span>
                    <span className="text-slate-300">
                      {new Date(currentAccount.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleManualSync}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>SYNC FRANCHISE TO CLOUD NOW</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setMode('login');
                    }}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Load Other Cloud Save
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setMode('register');
                    }}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs"
                  >
                    New Cloud Account
                  </button>
                </div>

                {onSignOut && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onSignOut();
                      setMode('login');
                    }}
                    className="w-full py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out (Unlink Local Items)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW: REGISTER NEW ACCOUNT */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-center space-y-1 mb-4">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  Save Items to Cloud
                </span>
                <h4 className="font-rajdhani font-black text-2xl text-white">
                  Create Cloud Account to Save Items
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Only when your franchise is linked to this cloud account are your items, cards, coins, and Level 99 upgrades permanently saved and retrieved across sessions!
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs text-center font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Manager Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nathan"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Email / Cloud Manager ID
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="manager@hoops.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Cloud Password / Pin Code
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Club Name
                    </label>
                    <input
                      type="text"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Logo Emoji
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={clubLogo}
                      onChange={(e) => setClubLogo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-center text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>SAVE & LAUNCH CLOUD FRANCHISE</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMode('login');
                  }}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Already have a cloud save? <span className="text-cyan-400 font-bold">Sign In here</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW: SIGN IN TO EXISTING ACCOUNT */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center space-y-1 mb-4">
                <h4 className="font-rajdhani font-black text-2xl text-white">
                  Load Existing Cloud Franchise
                </h4>
                <p className="text-xs text-slate-400">
                  Enter your registered cloud credentials to sync and restore your progress.
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs text-center font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Email or Cloud Save ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="manager@hoops.com or BBC-CLD-XXXXXX"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Password / Pin
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>LOAD CLOUD SAVE</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMode('register');
                  }}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Need a new cloud account? <span className="text-cyan-400 font-bold">Register here</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
