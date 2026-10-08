import React, { useState, useEffect, useRef } from 'react';
import { Squad, Player, UserProfile, PlayByPlayEvent } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Flame, 
  Shield, 
  Zap, 
  RotateCcw, 
  Volume2, 
  Play, 
  Pause, 
  FastForward, 
  Award,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';

interface LiveMatchProps {
  userSquad: Squad;
  playerMap: Record<string, Player>;
  profile: UserProfile;
  teamOVR: number;
  chemistry: number;
  onMatchComplete: (result: 'win' | 'loss' | 'tie', coinsEarned: number, pointsEarned: number) => void;
}

type MatchMode = 'ranked' | 'exhibition' | 'playoffs';
type MatchStatus = 'prematch' | 'playing' | 'paused' | 'halftime' | 'finished';

const OPPONENT_CLUBS = [
  { name: 'Boston Shamrocks', ovr: 88, logo: '☘️', color: '#007a33', stars: ['Jayson Tatum', 'Jaylen Brown'] },
  { name: 'Golden State Dynamos', ovr: 91, logo: '⚡', color: '#1d428a', stars: ['Stephen Curry', 'Draymond Green'] },
  { name: 'Denver Peak Legends', ovr: 93, logo: '🏔️', color: '#0e2240', stars: ['Nikola Jokić', 'Jamal Murray'] },
  { name: 'LA Dynasty Gold', ovr: 95, logo: '👑', color: '#552583', stars: ['LeBron James', 'Anthony Davis'] },
  { name: 'Chicago Bulls Legends', ovr: 97, logo: '🐂', color: '#ce1141', stars: ['Michael Jordan', 'Scottie Pippen'] },
];

export const LiveMatch: React.FC<LiveMatchProps> = ({
  userSquad,
  playerMap,
  profile,
  teamOVR,
  chemistry,
  onMatchComplete
}) => {
  const [matchMode, setMatchMode] = useState<MatchMode>('ranked');
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('prematch');
  const [opponent, setOpponent] = useState(OPPONENT_CLUBS[0]);

  // Match State
  const [quarter, setQuarter] = useState<number>(1);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120); // 2 mins per quarter sim
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [possession, setPossession] = useState<'home' | 'away'>('home');
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [timeoutsRemaining, setTimeoutsRemaining] = useState<number>(2);
  const [events, setEvents] = useState<PlayByPlayEvent[]>([]);
  
  // Tactical overrides
  const [activeOffense, setActiveOffense] = useState(userSquad.offenseTactic);
  const [activeDefense, setActiveDefense] = useState(userSquad.defenseTactic);

  // Ball position on 2D court (percentage x, y)
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({ x: 50, y: 75 });
  const [isShootingAnimation, setIsShootingAnimation] = useState(false);

  // Active home players
  const homeStarters = [
    playerMap[userSquad.startingFive.pg],
    playerMap[userSquad.startingFive.sg],
    playerMap[userSquad.startingFive.sf],
    playerMap[userSquad.startingFive.pf],
    playerMap[userSquad.startingFive.c],
  ].filter(Boolean);

  const startMatch = (mode: MatchMode) => {
    sound.playWhistle();
    setMatchMode(mode);
    // Pick appropriate opponent
    const oppIdx = mode === 'playoffs' ? 4 : mode === 'ranked' ? Math.floor(Math.random() * 4) : 0;
    setOpponent(OPPONENT_CLUBS[oppIdx]);

    setQuarter(1);
    setSecondsRemaining(120);
    setHomeScore(0);
    setAwayScore(0);
    setPossession('home');
    setTimeoutsRemaining(2);
    setEvents([
      {
        id: 'start',
        quarter: 1,
        timeRemaining: '12:00',
        homeScore: 0,
        awayScore: 0,
        text: `🏀 Tip-off won by ${profile.clubName}! The arena is roaring!`,
        type: 'normal',
        team: 'home'
      }
    ]);
    setMatchStatus('playing');
  };

  // Main Simulation Tick Loop
  useEffect(() => {
    if (matchStatus !== 'playing') return;

    const delay = Math.max(300, 1500 / simSpeed);
    const timer = setTimeout(() => {
      simulatePossession();
    }, delay);

    return () => clearTimeout(timer);
  }, [matchStatus, secondsRemaining, quarter, possession, simSpeed]);

  const simulatePossession = () => {
    // Decrement clock
    const timeDec = Math.floor(Math.random() * 8) + 6;
    const newSeconds = Math.max(0, secondsRemaining - timeDec);
    setSecondsRemaining(newSeconds);

    const isHome = possession === 'home';
    const attackingTeamName = isHome ? profile.clubName : opponent.name;
    const attackingPlayer = isHome 
      ? homeStarters[Math.floor(Math.random() * homeStarters.length)]
      : { name: opponent.stars[Math.floor(Math.random() * opponent.stars.length)], stats: { pts: 88, dnk: 85 } };

    // Determine shot success odds based on OVR + chemistry difference
    const ovrDiff = isHome ? (teamOVR + chemistry * 0.1) - opponent.ovr : opponent.ovr - (teamOVR + chemistry * 0.1);
    const baseSuccessChance = 0.50 + (ovrDiff * 0.02);

    const roll = Math.random();
    const actionType = Math.random();

    setIsShootingAnimation(true);
    setTimeout(() => setIsShootingAnimation(false), 400);

    if (roll < baseSuccessChance) {
      // SCORE!
      if (actionType > 0.65) {
        // 3-Pointer
        sound.playSwish();
        const pts = 3;
        const newHome = isHome ? homeScore + pts : homeScore;
        const newAway = !isHome ? awayScore + pts : awayScore;
        if (isHome) setHomeScore(newHome);
        else setAwayScore(newAway);

        setBallPosition({ x: isHome ? 25 : 75, y: 30 });
        addEvent({
          quarter,
          timeRemaining: formatTime(newSeconds),
          homeScore: newHome,
          awayScore: newAway,
          text: `🔥 BANG! ${attackingPlayer.name} steps back behind the arc and sinks the deep 3-POINTER!`,
          type: 'three_pointer',
          team: possession,
          scorer: attackingPlayer.name
        });
      } else if (actionType > 0.35) {
        // Slam Dunk
        sound.playDunk();
        const pts = 2;
        const newHome = isHome ? homeScore + pts : homeScore;
        const newAway = !isHome ? awayScore + pts : awayScore;
        if (isHome) setHomeScore(newHome);
        else setAwayScore(newAway);

        setBallPosition({ x: 50, y: isHome ? 15 : 85 });
        addEvent({
          quarter,
          timeRemaining: formatTime(newSeconds),
          homeScore: newHome,
          awayScore: newAway,
          text: `⚡ POSTER ALERT! ${attackingPlayer.name} rises up with authority for a vicious TWO-HANDED SLAM!`,
          type: 'dunk',
          team: possession,
          scorer: attackingPlayer.name
        });
      } else {
        // Midrange / Layup
        sound.playSwish();
        const pts = 2;
        const newHome = isHome ? homeScore + pts : homeScore;
        const newAway = !isHome ? awayScore + pts : awayScore;
        if (isHome) setHomeScore(newHome);
        else setAwayScore(newAway);

        setBallPosition({ x: 50, y: isHome ? 25 : 75 });
        addEvent({
          quarter,
          timeRemaining: formatTime(newSeconds),
          homeScore: newHome,
          awayScore: newAway,
          text: `👌 Smooth bucket! ${attackingPlayer.name} hits the pull-up mid-range jumper.`,
          type: 'score',
          team: possession,
          scorer: attackingPlayer.name
        });
      }
    } else {
      // Miss or Turnover
      if (actionType < 0.25) {
        sound.playWhistle();
        addEvent({
          quarter,
          timeRemaining: formatTime(newSeconds),
          homeScore,
          awayScore,
          text: `🛑 Great defensive clamps! ${isHome ? opponent.name : profile.clubName} forces a shot-clock violation.`,
          type: 'steal',
          team: isHome ? 'away' : 'home'
        });
      } else {
        sound.playDribble();
        addEvent({
          quarter,
          timeRemaining: formatTime(newSeconds),
          homeScore,
          awayScore,
          text: `❌ ${attackingPlayer.name}'s contested shot rims out. Rebound secured!`,
          type: 'normal',
          team: isHome ? 'away' : 'home'
        });
      }
    }

    // Switch possession
    setPossession(isHome ? 'away' : 'home');

    // Check Quarter End
    if (newSeconds <= 0) {
      if (quarter < 4) {
        sound.playBuzzer();
        setQuarter(q => q + 1);
        setSecondsRemaining(120);
        addEvent({
          quarter: quarter + 1,
          timeRemaining: '12:00',
          homeScore,
          awayScore,
          text: `🔔 End of Quarter ${quarter}. Beginning Quarter ${quarter + 1}!`,
          type: 'normal',
          team: 'home'
        });
      } else {
        // Match Finished!
        finishMatch();
      }
    }
  };

  const addEvent = (event: Omit<PlayByPlayEvent, 'id'>) => {
    setEvents(prev => [
      {
        id: Math.random().toString(),
        ...event
      },
      ...prev.slice(0, 25)
    ]);
  };

  const finishMatch = () => {
    sound.playBuzzer();
    setMatchStatus('finished');

    const result = homeScore > awayScore ? 'win' : homeScore < awayScore ? 'loss' : 'tie';
    if (result === 'win') {
      sound.playCrowdCheer();
      try {
        confetti({ particleCount: 100, spread: 80 });
      } catch {}
      onMatchComplete('win', 2200, 45);
    } else if (result === 'tie') {
      onMatchComplete('tie', 800, 15);
    } else {
      onMatchComplete('loss', 400, 5);
    }
  };

  const handleCallTimeout = () => {
    if (timeoutsRemaining <= 0 || matchStatus !== 'playing') return;
    sound.playWhistle();
    setTimeoutsRemaining(t => t - 1);
    addEvent({
      quarter,
      timeRemaining: formatTime(secondsRemaining),
      homeScore,
      awayScore,
      text: `⏸️ TIMEOUT called by Coach ${profile.clubName}! Team stamina refreshed.`,
      type: 'normal',
      team: 'home'
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* PRE-MATCH SELECTION VIEW */}
      {matchStatus === 'prematch' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                NBA Arena Live Simulation
              </span>
              <h2 className="font-rajdhani font-black text-3xl sm:text-5xl text-white">
                Compete in Live Matches
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Put your starting five to the ultimate tactical test. Execute plays, make real-time tactical adjustments, and earn massive Coins & Division Trophies!
              </p>
            </div>

            {/* Match Mode Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {/* Ranked Arena */}
              <div 
                onClick={() => startMatch('ranked')}
                className="group p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-400/60 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 shadow-lg"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    🏆
                  </div>
                  <h3 className="font-rajdhani font-black text-xl text-white group-hover:text-amber-400 transition-colors">
                    Ranked PvP Arena
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Climb through {profile.division}. Earn Division Points, Fan Prestige, and Championship Ring eligibility.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Win Reward: 2,200 🪙</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Playoffs Championship */}
              <div 
                onClick={() => startMatch('playoffs')}
                className="group p-5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-950/80 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 shadow-lg"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    💍
                  </div>
                  <h3 className="font-rajdhani font-black text-xl text-white group-hover:text-purple-300 transition-colors">
                    Playoffs Championship
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Face legendary dynasty teams (Michael Jordan Bulls, Kobe Lakers) for the ultimate Larry O'Brien Trophy!
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-purple-300">
                  <span>Win Reward: 3,500 🪙 + 50 💎</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Exhibition Friendly */}
              <div 
                onClick={() => startMatch('exhibition')}
                className="group p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 shadow-lg"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                  <h3 className="font-rajdhani font-black text-xl text-white group-hover:text-cyan-400 transition-colors">
                    Exhibition Scrimmage
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Casual tune-up match to test tactical formations, rotations, and player chemistry.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-cyan-400">
                  <span>Win Reward: 1,000 🪙</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE MATCH ARENA SIMULATION VIEW */}
      {(matchStatus === 'playing' || matchStatus === 'paused' || matchStatus === 'finished') && (
        <div className="space-y-6">
          {/* Top Scoreboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Home Team (User) */}
              <div className="flex items-center gap-4 flex-1 justify-start">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-3xl shadow-lg border border-white/20">
                  {profile.clubLogo}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-rajdhani font-black text-2xl text-white">{profile.clubName}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                      {teamOVR} OVR
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Tactics: {activeOffense.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Big Center Score & Quarter Clock */}
              <div className="flex flex-col items-center px-6 py-2 bg-slate-950/80 rounded-2xl border border-white/10 shadow-inner">
                <div className="flex items-center gap-6">
                  <span className="font-rajdhani font-black text-5xl sm:text-6xl text-white font-mono tracking-tight">
                    {homeScore}
                  </span>
                  <span className="text-slate-600 font-bold text-2xl">-</span>
                  <span className="font-rajdhani font-black text-5xl sm:text-6xl text-white font-mono tracking-tight">
                    {awayScore}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs font-mono">
                  <span className="text-amber-400 font-bold">Q{quarter}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-200 font-bold">{formatTime(secondsRemaining)}</span>
                  <span className="text-slate-500">•</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    possession === 'home' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {possession === 'home' ? 'HOME BALL' : 'AWAY BALL'}
                  </span>
                </div>
              </div>

              {/* Away Team (Opponent) */}
              <div className="flex items-center gap-4 flex-1 justify-end">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {opponent.ovr} OVR
                    </span>
                    <span className="font-rajdhani font-black text-2xl text-white">{opponent.name}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Stars: {opponent.stars[0]}
                  </span>
                </div>
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20"
                  style={{ backgroundColor: opponent.color }}
                >
                  {opponent.logo}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 2D Basketball Court Simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Live 2D Court (Left 8 Cols) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 hardwood-texture relative overflow-hidden min-h-[380px] flex flex-col justify-between shadow-2xl">
              
              {/* Full court markings */}
              <div className="absolute inset-0 pointer-events-none opacity-25">
                <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white -translate-x-1/2" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white" />
                {/* Left key */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-40 h-44 border-2 border-white bg-white/5" />
                <div className="absolute left-40 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white -translate-x-1/2" />
                {/* Right key */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-44 border-2 border-white bg-white/5" />
                <div className="absolute right-40 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white translate-x-1/2" />
              </div>

              {/* Status Header Overlay */}
              <div className="relative z-10 flex justify-between items-center bg-slate-950/80 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    {matchStatus === 'finished' ? 'FINAL BUZZER' : 'SIMULATION RUNNING'}
                  </span>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">Speed:</span>
                  {[1, 2, 4].map(spd => (
                    <button
                      key={spd}
                      onClick={() => {
                        sound.playClick();
                        setSimSpeed(spd);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                        simSpeed === spd
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Animated Basketball */}
              <div 
                className={`absolute w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-sm shadow-[0_0_20px_#f59e0b] transition-all duration-500 z-20 ${
                  isShootingAnimation ? 'scale-150 -translate-y-8 animate-bounce' : ''
                }`}
                style={{
                  left: `${ballPosition.x}%`,
                  top: `${ballPosition.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                🏀
              </div>

              {/* Coach Quick Actions Bar Bottom */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCallTimeout}
                    disabled={timeoutsRemaining <= 0 || matchStatus === 'finished'}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 disabled:opacity-50"
                  >
                    Call Timeout ({timeoutsRemaining} Left)
                  </button>
                </div>

                {/* Offense adjustment */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Focus:</span>
                  {['balanced', 'fast_break', 'three_point'].map(tac => (
                    <button
                      key={tac}
                      onClick={() => {
                        sound.playClick();
                        setActiveOffense(tac as any);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                        activeOffense === tac
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tac.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Play-by-Play Commentary Ticker (Right 4 Cols) */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <h3 className="font-rajdhani font-black text-lg text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Play-by-Play Feed</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Live Commentary</span>
                </div>

                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                  {events.map((evt, idx) => (
                    <div
                      key={evt.id}
                      className={`p-2.5 rounded-xl border text-xs leading-relaxed transition-all ${
                        idx === 0 ? 'scale-[1.01] shadow-md' : 'opacity-80'
                      } ${
                        evt.type === 'three_pointer'
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                          : evt.type === 'dunk'
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                          : evt.type === 'score'
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-slate-400">
                        <span>Q{evt.quarter} • {evt.timeRemaining}</span>
                        <span className="font-bold text-white">{evt.homeScore} - {evt.awayScore}</span>
                      </div>
                      <p>{evt.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Match Finished Post-Game Screen */}
              {matchStatus === 'finished' && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-center">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40">
                    <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <h4 className="font-rajdhani font-black text-xl text-white">
                      {homeScore > awayScore ? '🏆 VICTORY!' : homeScore < awayScore ? 'DEFEAT' : 'TIED GAME'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {homeScore > awayScore 
                        ? `Congratulations! +2,200 🪙 Coins and Division Points earned.` 
                        : `Good fight. Try tweaking your defensive scheme.`}
                    </p>
                  </div>

                  <button
                    onClick={() => setMatchStatus('prematch')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95"
                  >
                    Return to Arena Lobby
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
