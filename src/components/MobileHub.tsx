import React, { useState, useEffect } from 'react';
import { UserProfile, Squad, Player, PackItem } from '../types';
import { PACKS } from '../data/players';
import { PlayerCard } from './PlayerCard';
import { sound } from '../utils/audio';
import { 
  Play, 
  Users, 
  Target, 
  ShoppingBag, 
  Swords, 
  Shield, 
  Sparkles, 
  Flame, 
  Trophy, 
  Zap, 
  ArrowRight, 
  Clock, 
  Crown,
  Cloud,
  ChevronRight,
  ShieldAlert,
  Coins,
  RotateCcw,
  Smartphone,
  Gift
} from 'lucide-react';

interface MobileHubProps {
  profile: UserProfile;
  squad: Squad;
  playerMap: Record<string, Player>;
  teamOVR: number;
  chemistry: number;
  onNavigateTab: (tab: 'home' | 'squad' | 'drills' | 'store' | 'match' | 'profile' | 'mobile_hub') => void;
  onInspectPlayer: (player: Player) => void;
  onOpenPack: (pack: PackItem) => void;
  onUpgradePlayer: (playerId: string, cost: number, levelsToAdd?: number) => void;
  onOpenAdmin: () => void;
  onOpenCloudModal: () => void;
  onResetClub?: () => void;
}

export const MobileHub: React.FC<MobileHubProps> = ({
  profile,
  squad,
  playerMap,
  teamOVR,
  chemistry,
  onNavigateTab,
  onInspectPlayer,
  onOpenPack,
  onUpgradePlayer,
  onOpenAdmin,
  onOpenCloudModal,
  onResetClub
}) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [isFreeScoutReady, setIsFreeScoutReady] = useState(true);
  const [scoutTimerText, setScoutTimerText] = useState('READY');

  useEffect(() => {
    const updateScoutTimer = () => {
      const now = Date.now();
      const twelveHours = 12 * 60 * 60 * 1000;
      const elapsed = now - (profile.lastFreeScoutClaimTime || 0);
      if (elapsed >= twelveHours) {
        setIsFreeScoutReady(true);
        setScoutTimerText('READY');
      } else {
        setIsFreeScoutReady(false);
        const rem = twelveHours - elapsed;
        const h = Math.floor(rem / (1000 * 60 * 60));
        const m = Math.floor((rem % (1000 * 60 * 60)) / (1000 * 60));
        setScoutTimerText(`${h}h ${m}m`);
      }
    };
    updateScoutTimer();
    const interval = setInterval(updateScoutTimer, 30000);
    return () => clearInterval(interval);
  }, [profile.lastFreeScoutClaimTime]);

  const starters = [
    playerMap[squad.startingFive.pg],
    playerMap[squad.startingFive.sg],
    playerMap[squad.startingFive.sf],
    playerMap[squad.startingFive.pf],
    playerMap[squad.startingFive.c],
  ].filter(Boolean);

  const captain = playerMap[squad.captainId] || starters[0];
  const freeScoutPack = PACKS.find(p => p.isDailyFree) || PACKS[0];

  return (
    <div className="space-y-4 pb-4 animate-fade-in select-none">
      
      {/* MOBILE SPAWN PILL / WELCOME */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold">MOBILE SPAWN HUB</span>
        </div>
        <button 
          onClick={() => {
            sound.playClick();
            onNavigateTab('home');
          }}
          className="text-[10px] text-amber-400/80 hover:text-white underline font-sans"
        >
          View Full Home →
        </button>
      </div>

      {/* 1. TOP MOBILE HERO CARD: MATCHDAY ARENA */}
      <div 
        onClick={() => {
          sound.playWhistle();
          onNavigateTab('match');
        }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-slate-950 p-5 shadow-2xl border border-amber-400/40 cursor-pointer active:scale-[0.98] transition-all group"
      >
        {/* Glow & Basketball Court Lines */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border-4 border-white/10 pointer-events-none" />
        <div className="absolute top-0 right-0 p-4 opacity-15 text-6xl pointer-events-none">
          🏀
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-slate-950/70 border border-white/20 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>LIVE ARENA MATCH</span>
            </span>
            <span className="text-xs font-mono font-bold text-white bg-slate-950/60 px-2 py-0.5 rounded-lg border border-white/10">
              Win: 2,200 🪙
            </span>
          </div>

          <div>
            <h2 className="font-rajdhani font-black text-3xl sm:text-4xl text-white tracking-tight leading-none drop-shadow">
              TIP-OFF MATCHDAY
            </h2>
            <p className="text-xs text-amber-100/90 font-medium mt-1">
              Test your starting 5 against division rivals in real-time tactical simulation!
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs font-mono text-white/90">
              <span>{profile.clubLogo} {profile.clubName}</span>
              <span className="text-amber-300 font-bold">({teamOVR} OVR)</span>
            </div>

            <div className="px-4 py-2 rounded-xl bg-slate-950 text-amber-400 font-rajdhani font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg group-hover:bg-white group-hover:text-slate-950 transition-colors">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>PLAY NOW</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SQUAD STARTING 5 COMPACT BENCHMARK */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="font-rajdhani font-black text-base text-white">Active Starting Five</h3>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onNavigateTab('squad');
            }}
            className="text-[11px] font-rajdhani font-black text-amber-400 hover:underline flex items-center gap-0.5"
          >
            <span>Court Lineup</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Player Mini Strip */}
        <div className="grid grid-cols-5 gap-1.5">
          {starters.map((player) => {
            const levelBoost = (player.level || 1) - 1;
            const currentOvr = Math.min(99, player.ovr + levelBoost);

            return (
              <div
                key={player.id}
                onClick={() => {
                  sound.playClick();
                  onInspectPlayer(player);
                }}
                className="flex flex-col items-center bg-slate-950/80 p-2 rounded-xl border border-white/5 active:scale-95 transition-all cursor-pointer relative group"
              >
                {/* Pos tag */}
                <span className="text-[9px] font-mono font-bold text-amber-400 mb-1">
                  {player.position}
                </span>

                {/* Avatar Initial Circle */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-rajdhani font-black text-xs text-white border border-white/20 shadow-md my-0.5"
                  style={{ backgroundColor: player.avatarColor }}
                >
                  {player.avatarInitial}
                </div>

                {/* OVR Rating */}
                <span className="font-rajdhani font-black text-sm text-white leading-tight mt-0.5">
                  {currentOvr}
                </span>

                {/* Short Name */}
                <span className="text-[9px] text-slate-400 font-medium truncate w-full text-center leading-none">
                  {player.shortName}
                </span>

                {/* Level Tag if boosted */}
                {(player.level || 1) > 1 && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-mono font-bold bg-emerald-500 text-slate-950 px-1 rounded-full">
                    L{player.level}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Live OVR & Chemistry Pills */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[10px]">Team OVR:</span>
            <span className="font-rajdhani font-black text-amber-400 text-sm">{teamOVR}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[10px]">Chemistry:</span>
            <span className="font-rajdhani font-black text-emerald-400 text-sm">{chemistry}%</span>
          </div>
        </div>
      </div>

      {/* 3. QUICK UPGRADE CAROUSEL TO LEVEL 99 */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-rajdhani font-black text-base text-white">
              Level 99 Training Quick Hub
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {profile.coins.toLocaleString()} 🪙
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mb-3">
          Upgrade your rookie starters into 99 GOATs! Each level gives permanent +1 stats.
        </p>

        <div className="space-y-2">
          {starters.slice(0, 3).map(player => {
            const currentLevel = player.level || 1;
            const upgradeCost = Math.round(50 + currentLevel * 18);
            const canAfford = profile.coins >= upgradeCost && currentLevel < 99;

            return (
              <div 
                key={player.id}
                className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div 
                  onClick={() => onInspectPlayer(player)}
                  className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                >
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center font-rajdhani font-black text-xs text-white flex-shrink-0"
                    style={{ backgroundColor: player.avatarColor }}
                  >
                    {player.avatarInitial}
                  </div>
                  <div className="min-w-0">
                    <span className="font-rajdhani font-black text-xs text-white truncate block">
                      {player.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <span>Lvl {currentLevel}/99</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">{Math.min(99, player.ovr + (currentLevel - 1))} OVR</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onUpgradePlayer(player.id, upgradeCost, 1)}
                  disabled={!canAfford}
                  className={`px-3 py-1.5 rounded-xl font-rajdhani font-black text-[11px] uppercase tracking-wider flex items-center gap-1 flex-shrink-0 transition-all ${
                    canAfford
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 active:scale-95 shadow'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>+1 LVL</span>
                  <span className="font-mono text-[9px]">({upgradeCost} 🪙)</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. FAST ACTION TILES: DRILLS & STORE */}
      <div className="grid grid-cols-2 gap-3">
        {/* Skill Drills Tile */}
        <div 
          onClick={() => {
            sound.playClick();
            onNavigateTab('drills');
          }}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 cursor-pointer active:scale-95 transition-all flex flex-col justify-between shadow-lg"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="font-rajdhani font-black text-base text-white">Skill Drills</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              3PT Contest & Dunk challenges for quick coins.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-emerald-400">
            <span>Play Drills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Store & Packs Tile */}
        <div 
          onClick={() => {
            sound.playClick();
            onNavigateTab('store');
          }}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer active:scale-95 transition-all flex flex-col justify-between shadow-lg"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h4 className="font-rajdhani font-black text-base text-white">Booster Packs</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Rip player packs and unbox NBA superstars.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-amber-400">
            <span>Open Packs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 5. CLOUD ACCOUNT STATUS & ADMIN SHORTCUTS */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Cloud Account Shortcut */}
        <div 
          onClick={() => {
            sound.playClick();
            onOpenCloudModal();
          }}
          className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/30 flex items-center justify-between cursor-pointer active:scale-95 transition-all shadow"
        >
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="font-rajdhani font-black text-xs text-white block">
                {profile.cloudAccount ? profile.cloudAccount.managerName : 'Link Cloud'}
              </span>
              <span className="text-[9px] text-slate-400 block font-mono">
                {profile.cloudAccount ? 'Items Saved ☁️' : 'Unsaved Guest'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>

        {/* Admin Terminal Shortcut */}
        <div 
          onClick={() => {
            sound.playClick();
            onOpenAdmin();
          }}
          className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center justify-between cursor-pointer active:scale-95 transition-all shadow"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <div>
              <span className="font-rajdhani font-black text-xs text-white block">
                Admin Console
              </span>
              <span className="text-[9px] text-slate-400 block font-mono">
                Secret Cheats
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* 6. DAILY FREE SCOUT PACK CLAIM BANNER */}
      <div 
        onClick={() => {
          if (isFreeScoutReady) {
            sound.playPackTear();
            onOpenPack(freeScoutPack);
          } else {
            sound.playClick();
            onNavigateTab('store');
          }
        }}
        className={`p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] flex items-center justify-between shadow-lg ${
          isFreeScoutReady 
            ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-emerald-500/50 hover:border-emerald-400' 
            : 'bg-slate-950 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isFreeScoutReady ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
          }`}>
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-rajdhani font-black text-sm text-white">Daily Free Scout Pack</span>
              {isFreeScoutReady && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500 text-slate-950 animate-pulse">
                  READY
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              {isFreeScoutReady ? 'Complimentary NBA draft card ready to claim!' : `Next scout pack in ${scoutTimerText}`}
            </p>
          </div>
        </div>

        <button className={`px-3 py-1.5 rounded-xl text-xs font-rajdhani font-black uppercase tracking-wider ${
          isFreeScoutReady 
            ? 'bg-emerald-400 text-slate-950 shadow' 
            : 'bg-slate-800 text-slate-400'
        }`}>
          {isFreeScoutReady ? 'CLAIM' : 'VIEW'}
        </button>
      </div>

      {/* 7. RESTART FRANCHISE (MOBILE FAST ACCESS) */}
      {onResetClub && (
        <div className="pt-1">
          <button
            onClick={() => {
              sound.playClick();
              setShowResetModal(true);
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-800/40 text-rose-300 hover:text-rose-200 text-xs font-rajdhani font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Restart Franchise (Reset to Rookie Team)</span>
          </button>
        </div>
      )}

      {/* RESET FRANCHISE CONFIRMATION MODAL */}
      {showResetModal && onResetClub && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto text-xl">
              <RotateCcw className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-rajdhani font-black text-2xl text-white">Restart Franchise?</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                This will wipe current team roster and restore your starting <strong className="text-amber-400">Bad Rookie Team (60-65 OVR)</strong> with starter budget so you can grind from Level 1 all the way to Level 99!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  onResetClub();
                }}
                className="py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-rajdhani font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
