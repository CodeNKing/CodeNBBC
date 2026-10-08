import React from 'react';
import { UserProfile, Squad, Player, PackItem } from '../types';
import { PlayerCard } from './PlayerCard';
import { sound } from '../utils/audio';
import { 
  Flame, 
  Trophy, 
  Play, 
  Sparkles, 
  ShoppingBag, 
  Target, 
  ShieldCheck, 
  ArrowRight, 
  Coins, 
  Gem,
  CheckCircle2
} from 'lucide-react';

interface HomeDashboardProps {
  profile: UserProfile;
  squad: Squad;
  playerMap: Record<string, Player>;
  teamOVR: number;
  chemistry: number;
  onNavigateTab: (tab: 'home' | 'squad' | 'drills' | 'store' | 'match' | 'profile' | 'mobile_hub') => void;
  onInspectPlayer: (player: Player) => void;
  onClaimDailyQuest: (questId: string, coins: number, gems: number) => void;
  claimedQuests: string[];
  onOpenAdmin?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  squad,
  playerMap,
  teamOVR,
  chemistry,
  onNavigateTab,
  onInspectPlayer,
  onClaimDailyQuest,
  claimedQuests,
  onOpenAdmin
}) => {
  const captain = playerMap[squad.captainId] || playerMap[squad.startingFive.pg];
  const featuredSuperstar = playerMap['goat_jordan'] || captain;

  const DAILY_QUESTS = [
    { id: 'quest_match', title: 'Dominate the Arena', desc: 'Compete in 1 Ranked or Exhibition match', rewardCoins: 1500, rewardGems: 15 },
    { id: 'quest_drill', title: 'Sharpshooter Rhythm', desc: 'Score in any 3-Point or Free Throw drill', rewardCoins: 1000, rewardGems: 10 },
    { id: 'quest_pack', title: 'Scout Talent', desc: 'Open any booster pack or daily free scout', rewardCoins: 800, rewardGems: 20 },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/50 to-slate-950 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Text & Call to Actions */}
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>Season 1: Legends of the Hardwood</span>
            </div>

            <h1 className="font-rajdhani font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none">
              BUILD YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">ULTIMATE FIVE</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Unbox legendary Hall of Fame icons, design game-winning tactical schemes, and dominate the AI PvP Arena in real-time tactical simulations.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playWhistle();
                  onNavigateTab('match');
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Live Match</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateTab('store');
                }}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Open Packs</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateTab('drills');
                }}
                className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-2 border border-white/10 transition-all"
              >
                <Target className="w-4 h-4 text-emerald-400" />
                <span>3PT Drills</span>
              </button>
            </div>
          </div>

          {/* Right: Featured Card Showcase */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-mono font-bold text-amber-400 tracking-widest mb-2">
              Featured GOAT Card
            </span>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <PlayerCard
                player={featuredSuperstar}
                onClick={() => onInspectPlayer(featuredSuperstar)}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Team OVR */}
        <div 
          onClick={() => onNavigateTab('squad')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all hover:-translate-y-1 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Team Rating</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-rajdhani font-black text-3xl text-white group-hover:text-amber-400 transition-colors">
              {teamOVR}
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono">OVR</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Starting 5 Average</span>
        </div>

        {/* Chemistry */}
        <div 
          onClick={() => onNavigateTab('squad')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all hover:-translate-y-1 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Lineup Chemistry</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-rajdhani font-black text-3xl text-white group-hover:text-emerald-400 transition-colors">
              {chemistry}%
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 block mt-1">High Synergy Bonus</span>
        </div>

        {/* Division Rank */}
        <div 
          onClick={() => onNavigateTab('match')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:-translate-y-1 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Arena Division</span>
            <Trophy className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-rajdhani font-black text-xl text-white truncate block group-hover:text-cyan-400 transition-colors">
            {profile.division}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            {profile.divisionPoints} Pts
          </span>
        </div>

        {/* Win Streak */}
        <div 
          onClick={() => onNavigateTab('profile')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-all hover:-translate-y-1 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Arena Streak</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-rajdhani font-black text-3xl text-white group-hover:text-rose-400 transition-colors">
              {profile.winStreak}
            </span>
            <span className="text-xs font-bold text-rose-400">Wins 🔥</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            {profile.matchesWon} Total Ws
          </span>
        </div>
      </div>

      {/* Daily Challenges & Quests */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-rajdhani font-black text-xl text-white">Daily Franchise Quests</h3>
          </div>
          <span className="text-xs text-slate-400">Resets daily at 00:00 UTC</span>
        </div>

        <div className="space-y-3">
          {DAILY_QUESTS.map(quest => {
            const isClaimed = claimedQuests.includes(quest.id);

            return (
              <div
                key={quest.id}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-rajdhani font-black text-base text-white">{quest.title}</h4>
                  <p className="text-xs text-slate-400">{quest.desc}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-amber-400 font-bold">+{quest.rewardCoins} 🪙</span>
                    <span className="text-cyan-400 font-bold">+{quest.rewardGems} 💎</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!isClaimed) {
                        sound.playClick();
                        onClaimDailyQuest(quest.id, quest.rewardCoins, quest.rewardGems);
                      }
                    }}
                    disabled={isClaimed}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black font-rajdhani uppercase tracking-wider transition-all ${
                      isClaimed
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed flex items-center gap-1'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md active:scale-95'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Claimed</span>
                      </>
                    ) : (
                      <span>Claim Quest</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Hub Quick Access Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
            📱
          </div>
          <div>
            <h4 className="font-rajdhani font-black text-base text-white">Mobile Command Hub</h4>
            <p className="text-[11px] text-slate-400">
              Compact mobile touch layout with quick starting 5 controls, direct Level 99 training, and matchday arena.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            onNavigateTab('mobile_hub');
          }}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-rajdhani font-black text-xs uppercase tracking-wider border border-amber-500/30 shadow-md active:scale-95 transition-all flex-shrink-0"
        >
          Open Mobile Hub →
        </button>
      </div>

      {/* Admin Panel Quick Access Banner */}
      {onOpenAdmin && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h4 className="font-rajdhani font-black text-base text-white">Admin Console Access</h4>
              <p className="text-[11px] text-slate-400">
                Developer tools: level players up to 99, manage coins & gems, or spawn cards. Restricted to authorized administrators.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onOpenAdmin();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-rajdhani font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex-shrink-0"
          >
            Launch Admin Panel
          </button>
        </div>
      )}
    </div>
  );
};
