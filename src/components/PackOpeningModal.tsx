import React, { useState, useEffect } from 'react';
import { Player, PackItem } from '../types';
import { PlayerCard } from './PlayerCard';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Flame, Check, Coins, Eye, RotateCw } from 'lucide-react';

interface PackOpeningModalProps {
  pack: PackItem;
  pulledPlayers: Player[];
  onClose: (quickSellCoins?: number) => void;
  onEquipPlayer?: (player: Player) => void;
}

type Stage = 'sealed' | 'tearing' | 'walkout' | 'reveal';

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({
  pack,
  pulledPlayers,
  onClose,
  onEquipPlayer
}) => {
  const [stage, setStage] = useState<Stage>('sealed');
  const [activeWalkoutIndex, setActiveWalkoutIndex] = useState(0);

  // Highest rated player determines walkout
  const bestPlayer = [...pulledPlayers].sort((a, b) => b.ovr - a.ovr)[0] || pulledPlayers[0];
  const isWalkout = bestPlayer && bestPlayer.ovr >= 91;

  const handleRipPack = () => {
    sound.playPackTear();
    setStage('tearing');

    setTimeout(() => {
      if (isWalkout) {
        sound.playWalkout();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
        setStage('walkout');
      } else {
        sound.playCardFlip();
        setStage('reveal');
      }
    }, 1200);
  };

  const handleProceedFromWalkout = () => {
    sound.playCardFlip();
    setStage('reveal');
  };

  const calculateQuickSellValue = () => {
    return pulledPlayers.reduce((sum, p) => sum + Math.round(p.ovr * 18), 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-2xl flex flex-col items-center">
        
        {/* STAGE 1: SEALED PACK */}
        {stage === 'sealed' && (
          <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                {pack.badge}
              </span>
              <h2 className="font-rajdhani font-black text-3xl sm:text-4xl text-white">
                {pack.name}
              </h2>
              <p className="text-xs text-slate-400 max-w-sm">
                Contains {pack.cardCount} player cards. Guaranteed {pack.minOvr}+ OVR!
              </p>
            </div>

            {/* Glowing 3D Foil Pack Artwork */}
            <div 
              onClick={handleRipPack}
              className="relative cursor-pointer group transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              {/* Outer Glow */}
              <div 
                className="absolute -inset-4 rounded-3xl blur-2xl opacity-60 animate-pulse"
                style={{ backgroundColor: pack.accentColor }}
              />

              {/* Physical Pack Box */}
              <div 
                className="relative w-56 h-80 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-2xl border-2 border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${pack.accentColor} 0%, #0f172a 75%, #020617 100%)`
                }}
              >
                {/* Metallic shine reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                <div className="flex justify-between items-start z-10">
                  <span className="font-rajdhani font-black text-2xl text-white tracking-wider">CODEN <span className="text-amber-400">BBC</span></span>
                  <span className="text-xs font-bold text-black bg-white/90 px-2 py-0.5 rounded-full uppercase">
                    {pack.guaranteedRarity}
                  </span>
                </div>

                <div className="my-auto text-center z-10 space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-inner">
                    🏀
                  </div>
                  <h3 className="font-rajdhani font-black text-xl text-white tracking-wide">
                    {pack.name}
                  </h3>
                  <div className="inline-block px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-mono text-amber-300">
                    Min OVR: {pack.minOvr}
                  </div>
                </div>

                <div className="text-center z-10">
                  <span className="text-[10px] text-white/70 font-mono tracking-widest">
                    TAP TO RIP
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRipPack}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>OPEN PACK NOW</span>
            </button>
          </div>
        )}

        {/* STAGE 2: TEARING ANIMATION */}
        {stage === 'tearing' && (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative w-56 h-80 rounded-2xl flex items-center justify-center">
              <div 
                className="absolute inset-0 rounded-2xl blur-3xl opacity-80 animate-ping"
                style={{ backgroundColor: pack.accentColor }}
              />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <RotateCw className="w-12 h-12 text-amber-400 animate-spin" />
                <span className="font-rajdhani font-black text-2xl text-white tracking-wider animate-pulse">
                  UNSEALING PACK...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: WALKOUT DRAMA REVEAL */}
        {stage === 'walkout' && bestPlayer && (
          <div className="flex flex-col items-center text-center space-y-5 animate-scale-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-black tracking-widest uppercase animate-bounce">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>★ WALKOUT SUPERSTAR DETECTED ★</span>
            </div>

            <div className="flex items-center gap-4 text-slate-300 font-mono text-sm">
              <span>{bestPlayer.flagEmoji} {bestPlayer.team}</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{bestPlayer.position}</span>
            </div>

            {/* Huge Card Reveal */}
            <div className="my-2 transform scale-110">
              <PlayerCard player={bestPlayer} />
            </div>

            <button
              onClick={handleProceedFromWalkout}
              className="px-8 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs tracking-wider transition-all shadow-lg active:scale-95"
            >
              CONTINUE TO ROSTER
            </button>
          </div>
        )}

        {/* STAGE 4: ALL PULLED PLAYERS REVEAL */}
        {stage === 'reveal' && (
          <div className="flex flex-col items-center w-full space-y-6 animate-fade-in">
            <div className="text-center">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                Pack Opening Results
              </span>
              <h3 className="font-rajdhani font-black text-2xl sm:text-3xl text-white">
                {pulledPlayers.length} New Player Cards Added
              </h3>
            </div>

            {/* Pulled Cards Display */}
            <div className="flex flex-wrap justify-center items-center gap-4 max-h-[55vh] overflow-y-auto p-2 scrollbar-thin">
              {pulledPlayers.map(player => (
                <div key={player.id} className="flex flex-col items-center gap-2">
                  <PlayerCard player={player} />
                  {onEquipPlayer && (
                    <button
                      onClick={() => onEquipPlayer(player)}
                      className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-all"
                    >
                      Slot into Starting 5
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onClose(calculateQuickSellValue())}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Quick Sell All for {calculateQuickSellValue()} 🪙</span>
              </button>

              <button
                onClick={() => onClose()}
                className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Keep All Cards in Club</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
