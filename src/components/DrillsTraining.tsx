import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Player } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Trophy, 
  Target, 
  Zap, 
  Coins, 
  Sparkles, 
  RotateCcw,
  Timer,
  Award
} from 'lucide-react';

interface DrillsTrainingProps {
  profile: UserProfile;
  squadPlayers: Player[];
  onAddRewards: (coins: number, gems: number, xp: number) => void;
}

type DrillType = 'three_point' | 'free_throw' | 'dunk_contest';

export const DrillsTraining: React.FC<DrillsTrainingProps> = ({
  profile,
  squadPlayers,
  onAddRewards
}) => {
  const [activeDrill, setActiveDrill] = useState<DrillType>('three_point');
  
  // 3-Point Contest State
  const [threePointActive, setThreePointActive] = useState(false);
  const [threePointMeter, setThreePointMeter] = useState(0);
  const [threePointDirection, setThreePointDirection] = useState<'up' | 'down'>('up');
  const [threePointShotIndex, setThreePointShotIndex] = useState(0);
  const [threePointScore, setThreePointScore] = useState(0);
  const [threePointFeedback, setThreePointFeedback] = useState<string | null>(null);
  const [threePointCompleted, setThreePointCompleted] = useState(false);

  // Free Throw State
  const [ftActive, setFtActive] = useState(false);
  const [ftReticleX, setFtReticleX] = useState(50);
  const [ftDirection, setFtDirection] = useState<'left' | 'right'>('right');
  const [ftStreak, setFtStreak] = useState(0);
  const [ftFeedback, setFtFeedback] = useState<string | null>(null);

  // Dunk Rhythm State
  const [dunkActive, setDunkActive] = useState(false);
  const [dunkStep, setDunkStep] = useState(0);
  const [dunkTargetSequence, setDunkTargetSequence] = useState<string[]>([]);
  const [dunkPlayerSequence, setDunkPlayerSequence] = useState<string[]>([]);
  const [dunkScore, setDunkScore] = useState<number | null>(null);

  const meterAnimationRef = useRef<number | null>(null);

  // Shooter selected from squad (default best shooter)
  const bestShooter = [...squadPlayers].sort((a, b) => b.stats.pts - a.stats.pts)[0] || squadPlayers[0];
  const bestDunker = [...squadPlayers].sort((a, b) => b.stats.dnk - a.stats.dnk)[0] || squadPlayers[0];

  // 3-Point Contest Animation Loop
  useEffect(() => {
    if (!threePointActive || threePointCompleted) return;

    const interval = setInterval(() => {
      setThreePointMeter(prev => {
        if (prev >= 100) {
          setThreePointDirection('down');
          return 98;
        }
        if (prev <= 0) {
          setThreePointDirection('up');
          return 2;
        }
        return threePointDirection === 'up' ? prev + 3.8 : prev - 3.8;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [threePointActive, threePointDirection, threePointCompleted]);

  // Free Throw Reticle Oscillation
  useEffect(() => {
    if (!ftActive) return;

    const interval = setInterval(() => {
      setFtReticleX(prev => {
        if (prev >= 85) {
          setFtDirection('left');
          return 84;
        }
        if (prev <= 15) {
          setFtDirection('right');
          return 16;
        }
        return ftDirection === 'right' ? prev + 2.5 : prev - 2.5;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [ftActive, ftDirection]);

  // Handle 3PT Shoot Button Click
  const handleShoot3PT = () => {
    if (!threePointActive || threePointCompleted) return;

    // Green zone is 70 to 86
    const isMoneyBall = (threePointShotIndex + 1) % 5 === 0;
    const ptsAward = isMoneyBall ? 2 : 1;

    if (threePointMeter >= 70 && threePointMeter <= 88) {
      sound.playSwish();
      setThreePointScore(s => s + ptsAward);
      setThreePointFeedback(isMoneyBall ? '🔥 MONEY BALL GREEN! +2' : '✨ SPLASH! GREEN RELEASE!');
    } else if (threePointMeter >= 55 && threePointMeter <= 94) {
      // Slightly late/early make
      sound.playSwish();
      setThreePointScore(s => s + ptsAward);
      setThreePointFeedback('👌 Sinks it off the front rim!');
    } else {
      sound.playDribble();
      setThreePointFeedback('❌ Iron clank! Miss.');
    }

    const nextShot = threePointShotIndex + 1;
    setThreePointShotIndex(nextShot);

    if (nextShot >= 15) {
      // Finished 3PT Contest
      setThreePointCompleted(true);
      setThreePointActive(false);
      sound.playBuzzer();
      sound.playCrowdCheer();
      try {
        confetti({ particleCount: 60, spread: 60 });
      } catch {}

      // Calculate rewards
      const earnedCoins = threePointScore * 200 + 500;
      const earnedGems = Math.floor(threePointScore * 2.5);
      onAddRewards(earnedCoins, earnedGems, 50);
    }
  };

  const start3PointContest = () => {
    sound.playWhistle();
    setThreePointActive(true);
    setThreePointShotIndex(0);
    setThreePointScore(0);
    setThreePointCompleted(false);
    setThreePointFeedback(null);
  };

  // Free Throw Shoot
  const handleShootFT = () => {
    if (!ftActive) return;

    // Center zone is 43 to 57
    if (ftReticleX >= 43 && ftReticleX <= 57) {
      sound.playSwish();
      const newStreak = ftStreak + 1;
      setFtStreak(newStreak);
      setFtFeedback(`🔥 SWISH! Streak: ${newStreak} IN A ROW`);
      onAddRewards(150, 2, 10);
    } else {
      sound.playDribble();
      setFtFeedback('❌ Off the mark! Streak reset.');
      setFtStreak(0);
    }
  };

  // Dunk Rhythm Contest Start
  const startDunkContest = () => {
    sound.playWhistle();
    setDunkActive(true);
    const moves = ['WINDMILL', '360 SPIN', 'BETWEEN THE LEGS', 'TOMAHAWK'];
    const chosen = [
      moves[Math.floor(Math.random() * moves.length)],
      moves[Math.floor(Math.random() * moves.length)],
      moves[Math.floor(Math.random() * moves.length)]
    ];
    setDunkTargetSequence(chosen);
    setDunkPlayerSequence([]);
    setDunkStep(0);
    setDunkScore(null);
  };

  const handleDunkInput = (move: string) => {
    if (!dunkActive) return;
    sound.playClick();
    const newSeq = [...dunkPlayerSequence, move];
    setDunkPlayerSequence(newSeq);

    if (newSeq.length === dunkTargetSequence.length) {
      // Evaluate score
      let correct = 0;
      for (let i = 0; i < dunkTargetSequence.length; i++) {
        if (newSeq[i] === dunkTargetSequence[i]) correct++;
      }

      if (correct === dunkTargetSequence.length) {
        sound.playDunk();
        sound.playCrowdCheer();
        setDunkScore(50); // Perfect 50!
        try {
          confetti({ particleCount: 75, spread: 80 });
        } catch {}
        onAddRewards(1500, 30, 45);
      } else {
        sound.playDribble();
        const score = Math.max(35, Math.round(correct * 15 + 20));
        setDunkScore(score);
        onAddRewards(500, 10, 20);
      }
      setDunkActive(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="font-rajdhani font-black text-2xl text-white">
              Skill Drills & Training Facility
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete daily practice circuits to hone shooting rhythm, unlock Coins, Gems, and Club XP!
          </p>
        </div>

        {/* Drill Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              sound.playClick();
              setActiveDrill('three_point');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeDrill === 'three_point'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3-PT Contest
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveDrill('free_throw');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeDrill === 'free_throw'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Clutch Free Throw
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveDrill('dunk_contest');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeDrill === 'dunk_contest'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Slam Dunk Contest
          </button>
        </div>
      </div>

      {/* DRILL 1: 3-POINT CONTEST */}
      {activeDrill === 'three_point' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden hardwood-texture shadow-2xl">
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <div className="flex justify-between items-center bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Featured Shooter</span>
                <span className="font-rajdhani font-black text-base text-amber-400">
                  {bestShooter ? `${bestShooter.name} (${bestShooter.stats.pts} 3PT)` : 'Stephen Curry'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Rack Score</span>
                <span className="font-rajdhani font-black text-2xl text-white font-mono">
                  {threePointScore} <span className="text-xs text-slate-400">/ 18</span>
                </span>
              </div>
            </div>

            {/* Basketball Hoop Graphic Target */}
            <div className="relative py-6 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-amber-500/80 bg-black/60 flex items-center justify-center shadow-2xl relative">
                <div className="w-16 h-16 rounded-full border border-dashed border-white/40 flex items-center justify-center text-3xl">
                  🏀
                </div>
              </div>

              {threePointFeedback && (
                <div className="mt-3 text-sm font-black font-rajdhani text-amber-300 animate-bounce">
                  {threePointFeedback}
                </div>
              )}
            </div>

            {/* Shot Progress Dots */}
            <div className="flex justify-center gap-1.5">
              {Array.from({ length: 15 }).map((_, i) => {
                const isMoney = (i + 1) % 5 === 0;
                return (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full border text-[9px] flex items-center justify-center font-bold ${
                      i < threePointShotIndex
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : isMoney
                        ? 'bg-rose-950 border-rose-500 text-rose-400'
                        : 'bg-slate-950 border-slate-700 text-slate-500'
                    }`}
                  >
                    {isMoney ? '2' : '1'}
                  </div>
                );
              })}
            </div>

            {/* Timing Meter Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Early</span>
                <span className="text-emerald-400 font-bold">GREEN RELEASE WINDOW</span>
                <span>Late</span>
              </div>

              <div className="relative w-full h-8 bg-slate-950 rounded-xl border border-slate-700 overflow-hidden shadow-inner">
                {/* Green Sweet Spot Zone */}
                <div className="absolute top-0 bottom-0 left-[70%] w-[18%] bg-emerald-500/50 border-l-2 border-r-2 border-emerald-400 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white">PERFECT</span>
                </div>
                {/* Moving Indicator Needle */}
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-white shadow-[0_0_12px_#fff] transition-all"
                  style={{ left: `${threePointMeter}%`, transform: 'translateX(-50%)' }}
                />
              </div>
            </div>

            {/* Shoot Button / Start Button */}
            {!threePointActive && !threePointCompleted && (
              <button
                onClick={start3PointContest}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl active:scale-95 transition-all"
              >
                START 3-POINT CONTEST (15 SHOTS)
              </button>
            )}

            {threePointActive && (
              <button
                onClick={handleShoot3PT}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xl tracking-wider shadow-2xl active:scale-95 transition-all"
              >
                RELEASE SHOT!
              </button>
            )}

            {threePointCompleted && (
              <div className="space-y-4 bg-slate-950/90 p-5 rounded-2xl border border-amber-500/40">
                <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="font-rajdhani font-black text-2xl text-white">
                  Contest Finished! Score: {threePointScore}/18
                </h3>
                <p className="text-xs text-slate-400">
                  Earned {threePointScore * 200 + 500} 🪙 Coins and {Math.floor(threePointScore * 2.5)} 💎 Gems!
                </p>
                <button
                  onClick={start3PointContest}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all"
                >
                  Shoot Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRILL 2: CLUTCH FREE THROW */}
      {activeDrill === 'free_throw' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden hardwood-texture shadow-2xl">
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <div className="flex justify-between items-center bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Game-Tying Free Throw with 0.1s Left</span>
              <span className="font-rajdhani font-black text-xl text-amber-400 font-mono">
                Current Streak: {ftStreak} 🔥
              </span>
            </div>

            {/* Rim Target Canvas */}
            <div className="relative h-44 bg-slate-950/90 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
              {/* Backboard & Net */}
              <div className="w-32 h-20 border-4 border-white/60 rounded bg-white/5 flex flex-col items-center justify-end pb-1 relative">
                <div className="w-12 h-10 border-2 border-orange-500 rounded-t" />
                <div className="w-14 h-6 border-b-2 border-l-2 border-r-2 border-orange-500 rounded-b-full bg-orange-500/10" />
              </div>

              {/* Moving Reticle */}
              {ftActive && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-cyan-400 pointer-events-none flex items-center justify-center transition-all shadow-[0_0_15px_#22d3ee]"
                  style={{ left: `${ftReticleX}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                </div>
              )}
            </div>

            {ftFeedback && (
              <p className="text-sm font-rajdhani font-black text-amber-300 animate-pulse">
                {ftFeedback}
              </p>
            )}

            {!ftActive ? (
              <button
                onClick={() => {
                  sound.playWhistle();
                  setFtActive(true);
                  setFtFeedback(null);
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-base shadow-xl"
              >
                STEP UP TO THE CHARITY STRIPE
              </button>
            ) : (
              <button
                onClick={handleShootFT}
                className="w-full py-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xl shadow-xl active:scale-95 transition-all"
              >
                SWISH FREE THROW!
              </button>
            )}
          </div>
        </div>
      )}

      {/* DRILL 3: SLAM DUNK CONTEST */}
      {activeDrill === 'dunk_contest' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden hardwood-texture shadow-2xl">
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-white/10 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block text-left">Dunker</span>
                <span className="font-rajdhani font-black text-base text-amber-400">
                  {bestDunker ? `${bestDunker.name} (${bestDunker.stats.dnk} DNK)` : 'Anthony Edwards'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block text-right">Judges Score</span>
                <span className="font-rajdhani font-black text-2xl text-white font-mono">
                  {dunkScore !== null ? `${dunkScore} / 50` : '--'}
                </span>
              </div>
            </div>

            {!dunkActive && dunkScore === null ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  Memorize the judge's combo and execute high-flying aerial acrobatics for a perfect 50!
                </p>
                <button
                  onClick={startDunkContest}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-base shadow-xl active:scale-95 transition-all"
                >
                  START SLAM DUNK CONTEST
                </button>
              </div>
            ) : null}

            {dunkActive && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                    Required Combo Sequence:
                  </span>
                  <div className="flex justify-center gap-3">
                    {dunkTargetSequence.map((move, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black font-rajdhani border ${
                          dunkPlayerSequence[i] === move
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-slate-950 border-white/20 text-white'
                        }`}
                      >
                        {i + 1}. {move}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {['WINDMILL', '360 SPIN', 'BETWEEN THE LEGS', 'TOMAHAWK'].map(move => (
                    <button
                      key={move}
                      onClick={() => handleDunkInput(move)}
                      className="py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-sm font-black font-rajdhani text-white transition-all active:scale-95"
                    >
                      {move}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {dunkScore !== null && (
              <div className="space-y-4 bg-slate-950/90 p-5 rounded-2xl border border-amber-500/40">
                <Award className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="font-rajdhani font-black text-3xl text-white">
                  {dunkScore === 50 ? '👑 PERFECT 50! ALL 10s FROM THE JUDGES!' : `Score: ${dunkScore} / 50`}
                </h3>
                <button
                  onClick={startDunkContest}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all"
                >
                  Attempt Another Dunk
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
