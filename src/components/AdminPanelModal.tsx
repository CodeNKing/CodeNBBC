import React, { useState } from 'react';
import { Player, Squad, UserProfile } from '../types';
import { PLAYERS, PLAYER_MAP, INITIAL_SQUAD, INITIAL_USER_PROFILE } from '../data/players';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  KeyRound, 
  Lock, 
  Unlock, 
  Coins, 
  Gem, 
  Zap, 
  Sparkles, 
  Crown, 
  RotateCcw, 
  X, 
  Check, 
  Flame,
  Award
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  squad: Squad;
  allOwnedCards: string[];
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onUpdateSquad: (updater: (prev: Squad) => Squad) => void;
  onUpdateOwnedCards: (updater: (prev: string[]) => string[]) => void;
  onUpgradePlayerToLvl: (playerId: string, targetLvl: number) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  profile,
  squad,
  allOwnedCards,
  onUpdateProfile,
  onUpdateSquad,
  onUpdateOwnedCards,
  onUpgradePlayerToLvl
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('coden_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim().toLowerCase() === 'nathan10') {
      sound.playWalkout();
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {}
      setIsAuthenticated(true);
      setErrorMsg(null);
      try {
        sessionStorage.setItem('coden_admin_auth', 'true');
      } catch {}
      showNotification('🔓 Admin Clearance Granted! Welcome Nathan.');
    } else {
      sound.playDribble();
      setErrorMsg('Incorrect admin password. Access denied.');
    }
  };

  // CHEAT ACTIONS:
  const handleAddCoins = (amount: number) => {
    sound.playPackTear();
    onUpdateProfile(prev => ({ ...prev, coins: prev.coins + amount }));
    showNotification(`+${amount.toLocaleString()} 🪙 Coins injected!`);
  };

  const handleAddGems = (amount: number) => {
    sound.playPackTear();
    onUpdateProfile(prev => ({ ...prev, gems: prev.gems + amount }));
    showNotification(`+${amount.toLocaleString()} 💎 Gems injected!`);
  };

  const handleMaxStartingFiveTo99 = () => {
    sound.playWalkout();
    try {
      confetti({ particleCount: 120, spread: 90 });
    } catch {}

    const starters = Object.values(squad.startingFive);
    starters.forEach(id => {
      onUpgradePlayerToLvl(id, 99);
    });

    showNotification('👑 All Starting 5 maxed to LEVEL 99 (99 GOAT Rating)!');
  };

  const handleBoostEntireClubTenLevels = () => {
    sound.playPackTear();
    allOwnedCards.forEach(id => {
      const p = PLAYER_MAP[id];
      if (p) {
        onUpgradePlayerToLvl(id, Math.min(99, (p.level || 1) + 10));
      }
    });
    showNotification('⚡ +10 Levels added to every card in club!');
  };

  const handleSpawnPlayer = (playerId: string) => {
    sound.playCardFlip();
    const p = PLAYER_MAP[playerId];
    if (!p) return;
    onUpdateOwnedCards(prev => Array.from(new Set([...prev, playerId])));
    showNotification(`🎴 Unlocked ${p.name} (${p.ovr} OVR) into your club!`);
  };

  const handleUnlockAllPlayers = () => {
    sound.playWalkout();
    try {
      confetti({ particleCount: 100, spread: 80 });
    } catch {}
    const allIds = PLAYERS.map(p => p.id);
    onUpdateOwnedCards(() => allIds);
    showNotification('🌟 ALL 60+ PLAYERS IN THE GAME UNLOCKED!');
  };

  const handleGrantChampionshipRings = () => {
    sound.playWalkout();
    onUpdateProfile(prev => ({
      ...prev,
      rings: prev.rings + 5,
      trophies: prev.trophies + 10,
      divisionPoints: prev.divisionPoints + 2500,
      division: 'Hall of Fame Apex'
    }));
    showNotification('💍 +5 Championship Rings & HOF Apex Division granted!');
  };

  const handleResetToBadTeam = () => {
    sound.playWhistle();
    onUpdateProfile(() => INITIAL_USER_PROFILE);
    onUpdateSquad(() => INITIAL_SQUAD);
    onUpdateOwnedCards(() => [
      ...Object.values(INITIAL_SQUAD.startingFive),
      ...INITIAL_SQUAD.bench
    ]);
    // Reset player levels for rookies
    [
      ...Object.values(INITIAL_SQUAD.startingFive),
      ...INITIAL_SQUAD.bench
    ].forEach(id => {
      const p = PLAYER_MAP[id];
      if (p) p.level = 1;
    });

    showNotification('🔄 Reset to Bad Starter Team (60-65 OVR). Ready to grind!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.25)]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-rajdhani font-black text-2xl text-white tracking-wide flex items-center gap-2">
                <span>CODEN BBC ADMIN CONSOLE</span>
                {isAuthenticated && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    AUTHORIZED ACCESS
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Developer tools, currency spawner, and Level 99 cheats.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast alert if triggered */}
        {toastMsg && (
          <div className="bg-amber-500 text-slate-950 font-rajdhani font-black px-4 py-2 text-center text-xs tracking-wider flex items-center justify-center gap-2 shadow-inner">
            <Sparkles className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!isAuthenticated ? (
            /* PASSWORD LOGIN PROMPT */
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md mx-auto text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-rajdhani font-black text-2xl text-white">Enter Admin Password</h4>
                <p className="text-xs text-slate-400 mt-1">
                  This console is restricted to administrators. Enter key code to proceed.
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="Enter administrator key..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-center font-mono text-sm tracking-wider outline-none"
                  autoFocus
                />
                {errorMsg && (
                  <p className="text-xs text-rose-400 font-semibold">{errorMsg}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
              >
                UNLOCK ADMIN CONSOLE
              </button>
            </form>
          ) : (
            /* FULL ADMIN CONTROLS */
            <div className="space-y-6">
              
              {/* SECTION 1: LEVEL 99 INSTANT UPGRADERS */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h4 className="font-rajdhani font-black text-lg text-white">Level 99 Player Upgrades</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleMaxStartingFiveTo99}
                    className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black font-rajdhani text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Crown className="w-4 h-4" />
                    <span>MAX STARTING 5 TO LEVEL 99!</span>
                  </button>

                  <button
                    onClick={handleBoostEntireClubTenLevels}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-black font-rajdhani text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>+10 LEVELS TO ALL CARDS</span>
                  </button>
                </div>
              </div>

              {/* SECTION 2: CURRENCY SPAWNER */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <h4 className="font-rajdhani font-black text-lg text-white">Currency Injector</h4>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Current: {profile.coins.toLocaleString()} 🪙 | {profile.gems.toLocaleString()} 💎
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleAddCoins(10000)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-mono font-bold text-xs"
                  >
                    +10,000 🪙
                  </button>
                  <button
                    onClick={() => handleAddCoins(100000)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-mono font-bold text-xs"
                  >
                    +100,000 🪙
                  </button>
                  <button
                    onClick={() => handleAddCoins(1000000)}
                    className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs"
                  >
                    +1,000,000 🪙
                  </button>
                  <button
                    onClick={() => handleAddGems(5000)}
                    className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs"
                  >
                    +5,000 💎
                  </button>
                </div>
              </div>

              {/* SECTION 3: SUPERSTAR SPAWNER */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <h4 className="font-rajdhani font-black text-lg text-white">Instant Card Unlocker</h4>
                  </div>
                  <button
                    onClick={handleUnlockAllPlayers}
                    className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-black text-[11px] font-rajdhani uppercase tracking-wider"
                  >
                    Unlock All 60+ Players
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'goat_jordan', name: 'Michael Jordan (99)', color: '#ce1141' },
                    { id: 'goat_kobe', name: 'Kobe Bryant (98)', color: '#552583' },
                    { id: 'goat_lebron', name: 'LeBron James (98)', color: '#98002e' },
                    { id: 'curry_prime', name: 'Stephen Curry (97)', color: '#1d428a' },
                    { id: 'jokic_master', name: 'Nikola Jokić (98)', color: '#0e2240' },
                    { id: 'wemby_diamond', name: 'Victor Wembanyama (93)', color: '#000000' },
                  ].map(star => (
                    <button
                      key={star.id}
                      onClick={() => handleSpawnPlayer(star.id)}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 text-left transition-all flex items-center justify-between"
                    >
                      <span className="font-rajdhani font-black text-xs text-white truncate">{star.name}</span>
                      <span className="text-[10px] text-amber-400 font-bold ml-1">+</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 4: PROGRESSION & RESET */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={handleGrantChampionshipRings}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-300 font-rajdhani font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Grant 5 Championship Rings & HOF</span>
                </button>

                <button
                  onClick={handleResetToBadTeam}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-rajdhani font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Bad Starter Team</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-500 font-mono">
          <span>Restricted Administrator Terminal</span>
          {isAuthenticated && (
            <button
              onClick={() => {
                setIsAuthenticated(false);
                sessionStorage.removeItem('coden_admin_auth');
              }}
              className="text-rose-400 hover:underline"
            >
              Lock Console
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
