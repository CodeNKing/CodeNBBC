import React from 'react';
import { Player, Rarity } from '../types';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  mini?: boolean;
  isCaptain?: boolean;
  selected?: boolean;
  className?: string;
}

const RARITY_THEMES: Record<Rarity, {
  border: string;
  badge: string;
  badgeText: string;
  bgGradient: string;
  glow: string;
  headerAccent: string;
}> = {
  goat: {
    border: 'from-amber-300 via-yellow-400 to-amber-600',
    badge: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black',
    badgeText: 'GOAT',
    bgGradient: 'from-amber-950/80 via-slate-950 to-amber-950/60',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    headerAccent: 'text-amber-300'
  },
  master: {
    border: 'from-purple-400 via-fuchsia-500 to-indigo-600',
    badge: 'bg-gradient-to-r from-purple-500 to-fuchsia-400 text-white font-black',
    badgeText: 'MASTER',
    bgGradient: 'from-purple-950/80 via-slate-950 to-indigo-950/60',
    glow: 'shadow-[0_0_18px_rgba(168,85,247,0.45)]',
    headerAccent: 'text-purple-300'
  },
  diamond: {
    border: 'from-cyan-300 via-blue-400 to-indigo-500',
    badge: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black',
    badgeText: 'DIAMOND',
    bgGradient: 'from-cyan-950/80 via-slate-950 to-blue-950/60',
    glow: 'shadow-[0_0_16px_rgba(6,182,212,0.4)]',
    headerAccent: 'text-cyan-300'
  },
  emerald: {
    border: 'from-emerald-400 via-teal-500 to-emerald-700',
    badge: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black',
    badgeText: 'EMERALD',
    bgGradient: 'from-emerald-950/80 via-slate-950 to-teal-950/60',
    glow: 'shadow-[0_0_14px_rgba(16,185,129,0.35)]',
    headerAccent: 'text-emerald-300'
  },
  gold: {
    border: 'from-yellow-400 via-amber-500 to-yellow-600',
    badge: 'bg-gradient-to-r from-yellow-400 to-amber-400 text-slate-950 font-black',
    badgeText: 'GOLD',
    bgGradient: 'from-amber-950/70 via-slate-950 to-stone-900',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    headerAccent: 'text-yellow-400'
  },
  silver: {
    border: 'from-slate-300 via-slate-400 to-slate-500',
    badge: 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950 font-bold',
    badgeText: 'SILVER',
    bgGradient: 'from-slate-800/80 via-slate-950 to-slate-900',
    glow: 'shadow-[0_0_10px_rgba(148,163,184,0.2)]',
    headerAccent: 'text-slate-300'
  },
  bronze: {
    border: 'from-amber-700 via-amber-800 to-amber-950',
    badge: 'bg-amber-800 text-amber-100 font-bold',
    badgeText: 'BRONZE',
    bgGradient: 'from-amber-950/60 via-slate-950 to-stone-950',
    glow: 'shadow-none',
    headerAccent: 'text-amber-500'
  },
  special: {
    border: 'from-rose-400 via-pink-500 to-amber-400',
    badge: 'bg-gradient-to-r from-rose-500 to-amber-400 text-white font-black',
    badgeText: 'SPECIAL',
    bgGradient: 'from-rose-950/80 via-slate-950 to-amber-950/60',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.45)]',
    headerAccent: 'text-rose-300'
  }
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onClick,
  mini = false,
  isCaptain = false,
  selected = false,
  className = ''
}) => {
  const levelBoost = (player.level || 1) - 1;
  const currentOvr = Math.min(99, player.ovr + levelBoost);

  // Dynamic rarity evolution as players level up towards 99!
  const getEffectiveRarity = (ovr: number, baseRarity: Rarity): Rarity => {
    if (ovr >= 99) return 'goat';
    if (ovr >= 95) return 'master';
    if (ovr >= 92) return 'diamond';
    if (ovr >= 88) return 'emerald';
    if (ovr >= 80) return 'gold';
    if (ovr >= 70) return 'silver';
    return baseRarity === 'special' ? 'special' : 'bronze';
  };

  const effectiveRarity = getEffectiveRarity(currentOvr, player.rarity);
  const theme = RARITY_THEMES[effectiveRarity] || RARITY_THEMES.bronze;

  if (mini) {
    return (
      <div
        onClick={onClick}
        className={`relative cursor-pointer transition-all duration-200 select-none ${
          selected ? 'scale-105 ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950' : 'hover:scale-105'
        } ${className}`}
      >
        <div className={`p-[1.5px] rounded-lg bg-gradient-to-b ${theme.border} ${theme.glow}`}>
          <div className={`w-20 h-28 rounded-md bg-gradient-to-b ${theme.bgGradient} p-1 flex flex-col justify-between overflow-hidden relative`}>
            {/* Top row */}
            <div className="flex items-start justify-between leading-none z-10">
              <div className="text-left">
                <span className="font-rajdhani font-black text-lg text-white tracking-tighter block leading-none">
                  {currentOvr}
                </span>
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                  {player.position}
                </span>
              </div>
              <span className="text-xs">{player.flagEmoji}</span>
            </div>

            {/* Avatar representation */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
              <span className="font-rajdhani font-black text-3xl text-white tracking-widest">
                #{player.jerseyNumber}
              </span>
            </div>

            {/* Center player initials badge */}
            <div className="my-auto self-center z-10 flex flex-col items-center">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center font-rajdhani font-black text-sm text-white border border-white/20 shadow-inner"
                style={{ backgroundColor: player.avatarColor }}
              >
                {player.avatarInitial}
              </div>
            </div>

            {/* Bottom: Player Name */}
            <div className="z-10 text-center">
              <p className="font-rajdhani font-bold text-[11px] text-white truncate leading-tight">
                {player.shortName}
              </p>
              <div className="flex justify-between items-center text-[8px] text-slate-400 font-mono">
                <span>{player.stats.pts} PTS</span>
                <span>{player.stats.ply} AST</span>
              </div>
            </div>

            {isCaptain && (
              <div className="absolute top-0.5 right-0.5 bg-amber-400 text-slate-950 font-black text-[8px] px-1 rounded-sm">
                C
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full-sized card
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-300 group select-none ${
        selected ? 'scale-[1.03] ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950' : 'hover:-translate-y-1 hover:shadow-2xl'
      } ${className}`}
    >
      {/* Outer Border with Card Shape */}
      <div className={`p-[2.5px] rounded-xl bg-gradient-to-b ${theme.border} ${theme.glow} transition-shadow duration-300`}>
        <div className={`w-52 h-[310px] rounded-[10px] bg-gradient-to-b ${theme.bgGradient} p-3 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm border border-white/10`}>
          
          {/* Subtle Basketball Court & Shimmer Accent */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full border border-white/5 pointer-events-none" />

          {/* Top Banner: OVR, Position, Nation Flag */}
          <div className="flex items-start justify-between z-10">
            <div className="flex flex-col text-left">
              <div className="flex items-baseline gap-1">
                <span className="font-rajdhani font-black text-3xl sm:text-4xl text-white tracking-tighter leading-none drop-shadow-md">
                  {currentOvr}
                </span>
                {levelBoost > 0 && (
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    +{levelBoost}
                  </span>
                )}
              </div>
              <span className="text-xs font-black tracking-widest text-amber-400 uppercase mt-0.5">
                {player.position}
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[80px]">
                {player.team}
              </span>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="text-lg filter drop-shadow">{player.flagEmoji}</span>
              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wider ${theme.badge}`}>
                {theme.badgeText}
              </span>
              {isCaptain && (
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 shadow">
                  CAPTAIN
                </span>
              )}
            </div>
          </div>

          {/* Player Portrait & Silhouette Graphics */}
          <div className="relative my-auto flex flex-col items-center justify-center py-2 z-10">
            {/* Glow backing */}
            <div 
              className="absolute w-24 h-24 rounded-full blur-xl opacity-30 pointer-events-none transition-all group-hover:opacity-50"
              style={{ backgroundColor: player.avatarColor }}
            />
            
            {/* Jersey circle avatar */}
            <div 
              className="w-18 h-18 rounded-full border-2 border-white/30 flex flex-col items-center justify-center shadow-2xl relative z-10 transition-transform group-hover:scale-105"
              style={{ 
                background: `radial-gradient(circle at 35% 35%, ${player.avatarColor}, #0f172a)` 
              }}
            >
              <span className="font-rajdhani font-black text-xl text-white tracking-wider drop-shadow">
                {player.avatarInitial}
              </span>
              <span className="text-[10px] font-mono text-white/80 font-bold -mt-1">
                #{player.jerseyNumber}
              </span>
            </div>

            {/* Special Edition Tag */}
            {player.specialEdition ? (
              <div className="mt-2 text-center px-2 py-0.5 rounded-full bg-black/40 border border-white/10 max-w-[190px]">
                <p className="text-[9px] font-semibold text-amber-300 truncate">
                  ★ {player.specialEdition}
                </p>
              </div>
            ) : (
              <div className="mt-1 text-center">
                <p className="text-[10px] text-slate-400 font-medium">
                  {player.height} • {player.conference} Conf.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Info: Name & Stats Grid */}
          <div className="z-10 bg-slate-950/70 -mx-3 -mb-3 p-2.5 pt-2 border-t border-white/10 rounded-b-[10px]">
            <div className="text-center mb-1.5">
              <h3 className="font-rajdhani font-black text-base text-white truncate tracking-wide leading-tight group-hover:text-amber-400 transition-colors">
                {player.name}
              </h3>
            </div>

            {/* 6 Basketball Core Stats */}
            <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-center font-mono">
              <div className="flex items-center justify-between text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded">
                <span className="text-slate-400 text-[9px]">PTS</span>
                <span className="font-bold text-white font-rajdhani text-xs">{Math.min(99, player.stats.pts + levelBoost)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded">
                <span className="text-slate-400 text-[9px]">DNK</span>
                <span className="font-bold text-white font-rajdhani text-xs">{Math.min(99, player.stats.dnk + levelBoost)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded">
                <span className="text-slate-400 text-[9px]">PLY</span>
                <span className="font-bold text-white font-rajdhani text-xs">{Math.min(99, player.stats.ply + levelBoost)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded">
                <span className="text-slate-400 text-[9px]">DEF</span>
                <span className="font-bold text-white font-rajdhani text-xs">{Math.min(99, player.stats.def + levelBoost)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded">
                <span className="text-slate-400 text-[9px]">REB</span>
                <span className="font-bold text-white font-rajdhani text-xs">{Math.min(99, player.stats.reb + levelBoost)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded">
                <span className="text-slate-400 text-[9px]">ATH</span>
                <span className="font-bold text-white font-rajdhani text-xs">{Math.min(99, player.stats.ath + levelBoost)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
