import React, { useState } from 'react';
import { Player, Squad, FormationId, Position } from '../types';
import { FORMATIONS } from '../data/players';
import { PlayerCard } from './PlayerCard';
import { sound } from '../utils/audio';
import { 
  Zap, 
  Shield, 
  Flame, 
  Sparkles, 
  Users, 
  ChevronRight, 
  Sliders, 
  Trophy,
  ArrowRightLeft,
  X
} from 'lucide-react';

interface SquadCourtProps {
  squad: Squad;
  allOwnedCards: string[];
  playerMap: Record<string, Player>;
  teamOVR: number;
  chemistry: number;
  onUpdateSquad: (updater: (prev: Squad) => Squad) => void;
  onInspectPlayer: (player: Player) => void;
}

export const SquadCourt: React.FC<SquadCourtProps> = ({
  squad,
  allOwnedCards,
  playerMap,
  teamOVR,
  chemistry,
  onUpdateSquad,
  onInspectPlayer
}) => {
  const [selectedSlot, setSelectedSlot] = useState<Position | null>(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [showTacticsModal, setShowTacticsModal] = useState(false);

  const currentFormation = FORMATIONS[squad.formation] || FORMATIONS.five_out;

  const startingPlayers: Record<Position, Player> = {
    PG: playerMap[squad.startingFive.pg],
    SG: playerMap[squad.startingFive.sg],
    SF: playerMap[squad.startingFive.sf],
    PF: playerMap[squad.startingFive.pf],
    C: playerMap[squad.startingFive.c]
  };

  const benchPlayers = squad.bench.map(id => playerMap[id]).filter(Boolean);

  const handleSlotClick = (pos: Position) => {
    sound.playClick();
    setSelectedSlot(pos);
    setSwapModalOpen(true);
  };

  const handleSwapPlayer = (incomingPlayerId: string) => {
    if (!selectedSlot) return;
    sound.playClick();
    const slotKey = selectedSlot.toLowerCase() as keyof typeof squad.startingFive;
    const previousPlayerId = squad.startingFive[slotKey];

    onUpdateSquad(prev => {
      // Check if incoming is on bench
      const isFromBench = prev.bench.includes(incomingPlayerId);
      let newBench = isFromBench 
        ? prev.bench.filter(id => id !== incomingPlayerId)
        : [...prev.bench];
      
      if (!newBench.includes(previousPlayerId)) {
        newBench = [previousPlayerId, ...newBench];
      }

      return {
        ...prev,
        startingFive: {
          ...prev.startingFive,
          [slotKey]: incomingPlayerId
        },
        bench: newBench
      };
    });

    setSwapModalOpen(false);
    setSelectedSlot(null);
  };

  const getEffectiveOvr = (p: Player) => Math.min(99, p.ovr + ((p.level || 1) - 1));

  const handleAutoOptimize = () => {
    sound.playWhistle();
    // Rank all available owned cards by effective OVR including level
    const allPlayers = allOwnedCards.map(id => playerMap[id]).filter(Boolean);
    const sorted = [...allPlayers].sort((a, b) => getEffectiveOvr(b) - getEffectiveOvr(a));

    const positions: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];
    const newStarting: Record<string, string> = {};
    const usedIds = new Set<string>();

    // 1st pass: exact position matches
    positions.forEach(pos => {
      const match = sorted.find(p => !usedIds.has(p.id) && (p.position === pos || p.secondaryPositions?.includes(pos)));
      if (match) {
        newStarting[pos.toLowerCase()] = match.id;
        usedIds.add(match.id);
      }
    });

    // 2nd pass: fill any gaps with best available
    positions.forEach(pos => {
      const key = pos.toLowerCase();
      if (!newStarting[key]) {
        const best = sorted.find(p => !usedIds.has(p.id));
        if (best) {
          newStarting[key] = best.id;
          usedIds.add(best.id);
        }
      }
    });

    const newBench = sorted.filter(p => !usedIds.has(p.id)).slice(0, 5).map(p => p.id);

    onUpdateSquad(prev => ({
      ...prev,
      startingFive: {
        pg: newStarting.pg || prev.startingFive.pg,
        sg: newStarting.sg || prev.startingFive.sg,
        sf: newStarting.sf || prev.startingFive.sf,
        pf: newStarting.pf || prev.startingFive.pf,
        c: newStarting.c || prev.startingFive.c,
      },
      bench: newBench.length > 0 ? newBench : prev.bench
    }));
  };

  // Get eligible replacements for currently selected slot
  const eligibleReplacements = allOwnedCards
    .map(id => playerMap[id])
    .filter(p => {
      if (!p) return false;
      if (!selectedSlot) return true;
      const isCurrent = squad.startingFive[selectedSlot.toLowerCase() as keyof typeof squad.startingFive] === p.id;
      return !isCurrent;
    })
    .sort((a, b) => {
      // Prioritize same position then highest effective OVR
      const aMatch = a.position === selectedSlot || a.secondaryPositions?.includes(selectedSlot!);
      const bMatch = b.position === selectedSlot || b.secondaryPositions?.includes(selectedSlot!);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return getEffectiveOvr(b) - getEffectiveOvr(a);
    });

  return (
    <div className="space-y-6">
      {/* Squad Header Stats Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* OVR Circle Badge */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 p-[2px] shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">OVR</span>
                  <span className="font-rajdhani font-black text-3xl text-white leading-none">{teamOVR}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-rajdhani font-black text-2xl text-white">Starting Five & Rotation</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active Lineup
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Formation: <span className="text-amber-400 font-bold">{currentFormation.name}</span>
              </p>
            </div>
          </div>

          {/* Chemistry & Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/70 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Chemistry</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, chemistry)}%` }}
                    />
                  </div>
                  <span className="font-rajdhani font-black text-sm text-white">{chemistry}%</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowTacticsModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 border border-slate-700"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Tactics & Scheme</span>
            </button>

            <button
              onClick={handleAutoOptimize}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Auto-Optimize</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Basketball Court Area */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/20 shadow-2xl hardwood-texture p-4 sm:p-8 min-h-[580px] flex flex-col justify-between">
        
        {/* Basketball Court Line Graphic Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {/* Half-Court Line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
          {/* Center Circle Arc */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-t-2 border-l-2 border-r-2 border-white rounded-t-full" />
          {/* Key / Paint */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 border-2 border-white/60 bg-white/5" />
          {/* Free Throw Circle */}
          <div className="absolute top-64 left-1/2 -translate-x-1/2 w-40 h-40 border-2 border-white rounded-full -translate-y-1/2" />
          {/* 3-Point Arc */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-[620px] h-96 border-b-2 border-l-2 border-r-2 border-white/70 rounded-b-[260px]" />
          {/* Basket & Backboard */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-2 bg-white/80" />
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-amber-500" />
        </div>

        {/* Formation Bonus Pill Top */}
        <div className="relative z-10 flex justify-center mb-4">
          <div className="px-4 py-1.5 rounded-full bg-slate-950/80 border border-amber-500/30 backdrop-blur-md flex items-center gap-2 text-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-medium">Scheme Boost:</span>
            <span className="text-amber-400 font-bold">{currentFormation.bonus}</span>
          </div>
        </div>

        {/* Starting Five Players Positioned on Court */}
        <div className="relative z-10 w-full max-w-4xl mx-auto h-[440px]">
          {(['PG', 'SG', 'SF', 'PF', 'C'] as Position[]).map(pos => {
            const player = startingPlayers[pos];
            const slotData = currentFormation.slots[pos.toLowerCase() as keyof typeof currentFormation.slots];

            return (
              <div
                key={pos}
                style={{
                  position: 'absolute',
                  left: `${slotData.x}%`,
                  top: `${slotData.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="flex flex-col items-center group cursor-pointer"
              >
                {/* Slot Label Badge */}
                <div className="mb-1 px-2 py-0.5 rounded-full bg-slate-950/90 border border-white/20 text-[10px] font-mono font-bold text-amber-300 tracking-wider shadow">
                  {slotData.label}
                </div>

                {player ? (
                  <div className="relative">
                    <PlayerCard
                      player={player}
                      mini
                      isCaptain={squad.captainId === player.id}
                      onClick={() => handleSlotClick(pos)}
                    />
                    {/* Hover Quick Swap Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSlotClick(pos);
                      }}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Swap Player"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                    </button>
                    {/* Inspect Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        onInspectPlayer(player);
                      }}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-800 text-cyan-400 border border-cyan-400/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="Inspect Details"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSlotClick(pos)}
                    className="w-20 h-28 rounded-lg border-2 border-dashed border-white/30 bg-black/40 flex flex-col items-center justify-center hover:border-amber-400 transition-colors"
                  >
                    <Users className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-300">Add {pos}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Legend at bottom of court */}
        <div className="relative z-10 flex justify-between items-center text-[11px] text-slate-400 font-medium">
          <span>Tap any player to swap or inspect card</span>
          <span>Tactics: <strong className="text-slate-200 capitalize">{squad.offenseTactic.replace('_', ' ')}</strong></span>
        </div>
      </div>

      {/* Bench & Second Unit Rotation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="font-rajdhani font-black text-lg text-white">Bench Rotation (6th Man & Reserves)</h3>
          </div>
          <span className="text-xs text-slate-400">{benchPlayers.length} Active Reserves</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {benchPlayers.map((player) => (
            <div key={player.id} className="flex-none">
              <PlayerCard
                player={player}
                mini
                onClick={() => onInspectPlayer(player)}
              />
            </div>
          ))}
          {benchPlayers.length === 0 && (
            <div className="p-4 text-center text-slate-500 text-xs w-full">
              No bench players assigned. Open packs in the store to build roster depth!
            </div>
          )}
        </div>
      </div>

      {/* SWAP PLAYER MODAL */}
      {swapModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-rajdhani font-black text-xl text-white">
                  Replace {selectedSlot} Position
                </h3>
                <p className="text-xs text-slate-400">
                  Select a replacement player from your club roster.
                </p>
              </div>
              <button
                onClick={() => setSwapModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {eligibleReplacements.map(player => {
                const isExactPos = player.position === selectedSlot;
                const isSecondary = player.secondaryPositions?.includes(selectedSlot);

                return (
                  <div
                    key={player.id}
                    onClick={() => handleSwapPlayer(player.id)}
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-400/50 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-rajdhani font-black text-sm text-white"
                        style={{ backgroundColor: player.avatarColor }}
                      >
                        {player.avatarInitial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-rajdhani font-black text-base text-white group-hover:text-amber-400">
                            {player.name}
                          </span>
                          <span className="text-xs">{player.flagEmoji}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                          <span>{player.team}</span>
                          <span>•</span>
                          <span>{player.position}</span>
                          {isExactPos && (
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">Primary Position</span>
                          )}
                          {isSecondary && (
                            <span className="text-cyan-400 font-bold bg-cyan-500/10 px-1 rounded">Secondary</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono">
                        <span className="font-rajdhani font-black text-2xl text-white block leading-none">
                          {getEffectiveOvr(player)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {(player.level || 1) > 1 ? `Lvl ${player.level} OVR` : 'OVR'}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TACTICS & FORMATIONS MODAL */}
      {showTacticsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-rajdhani font-black text-xl text-white">Tactics & Offensive Scheme</h3>
                <p className="text-xs text-slate-400">Customize spacing, pacing, and defensive principles.</p>
              </div>
              <button
                onClick={() => setShowTacticsModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* Formations list */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Court Spacing Formation
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.values(FORMATIONS).map(fmt => (
                    <button
                      key={fmt.id}
                      onClick={() => {
                        sound.playClick();
                        onUpdateSquad(prev => ({ ...prev, formation: fmt.id }));
                      }}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        squad.formation === fmt.id
                          ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <h4 className="font-rajdhani font-black text-sm text-white mb-0.5">{fmt.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-1.5">{fmt.description}</p>
                      <span className="text-[10px] font-bold text-amber-400 block font-mono">
                        {fmt.bonus}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Offensive Tactics */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Offensive Focus
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'balanced', label: 'Balanced Pace' },
                    { id: 'fast_break', label: 'Fast Break Blitz' },
                    { id: 'three_point', label: '3-Point Barrage' },
                    { id: 'pick_and_roll', label: 'PnR Heavy' },
                    { id: 'paint_attack', label: 'Paint Attack' }
                  ].map(tac => (
                    <button
                      key={tac.id}
                      onClick={() => {
                        sound.playClick();
                        onUpdateSquad(prev => ({ ...prev, offenseTactic: tac.id as any }));
                      }}
                      className={`p-2.5 rounded-lg text-xs font-bold transition-all border ${
                        squad.offenseTactic === tac.id
                          ? 'bg-amber-400 text-slate-950 border-amber-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {tac.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Defensive Tactics */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Defensive Strategy
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'man_to_man', label: 'Man-to-Man Clamps' },
                    { id: 'zone_2_3', label: '2-3 Zone Wall' },
                    { id: 'full_court_press', label: 'Full Court Press' },
                    { id: 'switch_all', label: 'Switch All Screens' }
                  ].map(def => (
                    <button
                      key={def.id}
                      onClick={() => {
                        sound.playClick();
                        onUpdateSquad(prev => ({ ...prev, defenseTactic: def.id as any }));
                      }}
                      className={`p-2.5 rounded-lg text-xs font-bold transition-all border ${
                        squad.defenseTactic === def.id
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {def.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowTacticsModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
