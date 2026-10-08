import React, { useState } from 'react';
import { Player } from '../types';
import { PlayerCard } from './PlayerCard';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  ArrowUpCircle, 
  Sparkles, 
  ShieldCheck, 
  Crown, 
  Flame, 
  Coins,
  Zap
} from 'lucide-react';

interface PlayerModalProps {
  player: Player | null;
  coins: number;
  isCaptain: boolean;
  onClose: () => void;
  onUpgradePlayer: (playerId: string, cost: number, levelsToAdd?: number) => void;
  onSetCaptain: (playerId: string) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  player,
  coins,
  isCaptain,
  onClose,
  onUpgradePlayer,
  onSetCaptain
}) => {
  if (!player) return null;

  const currentLevel = player.level || 1;
  const levelBoost = currentLevel - 1;

  // Cost calculator per level
  const getCostForLevels = (startLvl: number, count: number) => {
    let total = 0;
    for (let i = 0; i < count; i++) {
      const lvl = startLvl + i;
      total += Math.round(50 + lvl * 18);
    }
    return total;
  };

  const costPlus1 = getCostForLevels(currentLevel, 1);
  const costPlus5 = getCostForLevels(currentLevel, Math.min(5, 99 - currentLevel));
  const costPlus10 = getCostForLevels(currentLevel, Math.min(10, 99 - currentLevel));

  const handleUpgrade = (levelsToAdd: number, cost: number) => {
    if (coins < cost || currentLevel >= 99) return;
    sound.playPackTear();
    if (currentLevel + levelsToAdd >= 99) {
      sound.playWalkout();
      try {
        confetti({ particleCount: 90, spread: 80 });
      } catch {}
    }
    onUpgradePlayer(player.id, cost, levelsToAdd);
  };

  const handleCaptainClick = () => {
    sound.playClick();
    onSetCaptain(player.id);
  };

  const STAT_LABELS = [
    { key: 'pts', label: 'Shooting & Scoring (PTS)', desc: '3PT Range, Mid-Range, Free Throw' },
    { key: 'dnk', label: 'Driving Dunk & Finishing (DNK)', desc: 'Rim Pressure, Alley-Oop, Posters' },
    { key: 'ply', label: 'Playmaking & Passing (PLY)', desc: 'Passing IQ, Vision, Handles' },
    { key: 'def', label: 'Perimeter & Interior Defense (DEF)', desc: 'On-Ball Clamps, Steals, Blocks' },
    { key: 'reb', label: 'Rebounding & Boxout (REB)', desc: 'Defensive Glass, Putbacks' },
    { key: 'ath', label: 'Athleticism & Speed (ATH)', desc: 'Top Speed, Lateral Agility, Vertical' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{player.flagEmoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-rajdhani font-black text-2xl text-white">
                  {player.name}
                </h2>
                {currentLevel >= 99 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md">
                    👑 99 GOAT MAX
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {player.team} • #{player.jerseyNumber} • {player.height} • Level {currentLevel}/99
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Card Display */}
            <div className="md:col-span-5 flex flex-col items-center">
              <PlayerCard player={player} isCaptain={isCaptain} />
              
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleCaptainClick}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black font-rajdhani uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    isCaptain
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{isCaptain ? 'Team Captain' : 'Make Captain'}</span>
                </button>
              </div>
            </div>

            {/* Right: Attribute Bars Breakdown & Upgrades */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-rajdhani font-black text-lg text-white">
                    Attributes & Progression to Lvl 99
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-32 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                        style={{ width: `${(currentLevel / 99) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      Lvl {currentLevel} / 99
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat Bars */}
              <div className="space-y-2.5">
                {STAT_LABELS.map(s => {
                  const baseVal = player.stats[s.key as keyof typeof player.stats] || 60;
                  const currentVal = Math.min(99, baseVal + levelBoost);

                  return (
                    <div key={s.key} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-300">{s.label}</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          {levelBoost > 0 && (
                            <span className="text-[10px] text-emerald-400">+{levelBoost}</span>
                          )}
                          <span className="font-bold text-white font-rajdhani text-sm">{currentVal}</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            currentVal >= 99
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_10px_#f59e0b]'
                              : currentVal >= 92
                              ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
                              : currentVal >= 85
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                              : currentVal >= 70
                              ? 'bg-gradient-to-r from-slate-300 to-slate-400'
                              : 'bg-amber-700'
                          }`}
                          style={{ width: `${Math.min(100, (currentVal / 99) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Upgrade Card Controls */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-rajdhani font-black text-base text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Upgrade to Level 99</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Each level grants permanent +1 OVR & stat gains. Max out at Lvl 99!
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Balance: <strong className="text-amber-400 font-bold">{coins.toLocaleString()} 🪙</strong>
                  </span>
                </div>

                {currentLevel >= 99 ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-400/40 rounded-xl text-center">
                    <span className="font-rajdhani font-black text-amber-400 text-sm tracking-wider uppercase">
                      👑 MAXIMUM LEVEL 99 ACHIEVED! THIS PLAYER IS A CERTIFIED GOAT!
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {/* +1 Level */}
                    <button
                      onClick={() => handleUpgrade(1, costPlus1)}
                      disabled={coins < costPlus1 || currentLevel >= 99}
                      className={`p-2.5 rounded-xl text-xs font-rajdhani font-black uppercase tracking-wider flex flex-col items-center justify-center transition-all ${
                        coins >= costPlus1
                          ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 active:scale-95'
                          : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      <span>+1 Level</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">{costPlus1} 🪙</span>
                    </button>

                    {/* +5 Levels */}
                    <button
                      onClick={() => handleUpgrade(Math.min(5, 99 - currentLevel), costPlus5)}
                      disabled={coins < costPlus5 || currentLevel >= 95}
                      className={`p-2.5 rounded-xl text-xs font-rajdhani font-black uppercase tracking-wider flex flex-col items-center justify-center transition-all ${
                        coins >= costPlus5 && currentLevel < 95
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 active:scale-95'
                          : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      <span>+5 Levels</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">{costPlus5} 🪙</span>
                    </button>

                    {/* +10 Levels */}
                    <button
                      onClick={() => handleUpgrade(Math.min(10, 99 - currentLevel), costPlus10)}
                      disabled={coins < costPlus10 || currentLevel >= 90}
                      className={`p-2.5 rounded-xl text-xs font-rajdhani font-black uppercase tracking-wider flex flex-col items-center justify-center transition-all ${
                        coins >= costPlus10 && currentLevel < 90
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      <span>+10 Levels</span>
                      <span className="text-[10px] text-slate-950 font-mono font-bold mt-0.5">{costPlus10} 🪙</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
