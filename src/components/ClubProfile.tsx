import React, { useState } from 'react';
import { UserProfile, Player, Squad } from '../types';
import { PlayerCard } from './PlayerCard';
import { sound } from '../utils/audio';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Flame, 
  Users, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Edit3 
} from 'lucide-react';

interface ClubProfileProps {
  profile: UserProfile;
  allOwnedCards: string[];
  playerMap: Record<string, Player>;
  squad: Squad;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onInspectPlayer: (player: Player) => void;
  onResetClub: () => void;
  onOpenCloudModal?: () => void;
}

export const ClubProfile: React.FC<ClubProfileProps> = ({
  profile,
  allOwnedCards,
  playerMap,
  squad,
  onUpdateProfile,
  onInspectPlayer,
  onResetClub,
  onOpenCloudModal
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile.clubName);
  const [editedLogo, setEditedLogo] = useState(profile.clubLogo);
  const [filterPosition, setFilterPosition] = useState<string>('ALL');
  const [saveCodeCopied, setSaveCodeCopied] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const ownedPlayers = allOwnedCards.map(id => playerMap[id]).filter(Boolean);

  const filteredPlayers = ownedPlayers.filter(p => {
    if (filterPosition === 'ALL') return true;
    return p.position === filterPosition || p.secondaryPositions?.includes(filterPosition as any);
  });

  const totalMatches = profile.matchesWon + profile.matchesLost + profile.matchesTied;
  const winRate = totalMatches > 0 ? Math.round((profile.matchesWon / totalMatches) * 100) : 0;

  const handleSaveProfileName = () => {
    sound.playClick();
    onUpdateProfile(prev => ({
      ...prev,
      clubName: editedName || 'Chicago Vipers',
      clubLogo: editedLogo || '🐍'
    }));
    setIsEditingName(false);
  };

  const handleExportSave = () => {
    sound.playClick();
    const exportData = {
      profile,
      squad,
      allOwnedCards
    };
    navigator.clipboard.writeText(JSON.stringify(exportData));
    setSaveCodeCopied(true);
    setTimeout(() => setSaveCodeCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Club Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Club Logo Avatar */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-4xl shadow-2xl border-2 border-white/20">
              {profile.clubLogo}
            </div>

            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="px-3 py-1 bg-slate-950 border border-amber-400 rounded-lg text-white font-rajdhani font-black text-xl"
                  />
                  <input
                    type="text"
                    value={editedLogo}
                    onChange={(e) => setEditedLogo(e.target.value)}
                    maxLength={2}
                    className="w-12 px-2 py-1 bg-slate-950 border border-amber-400 rounded-lg text-white text-center text-xl"
                  />
                  <button
                    onClick={handleSaveProfileName}
                    className="px-3 py-1 bg-amber-400 text-slate-950 rounded-lg font-bold text-xs"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-rajdhani font-black text-3xl sm:text-4xl text-white">
                    {profile.clubName}
                  </h2>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsEditingName(true);
                    }}
                    className="text-slate-400 hover:text-amber-400 p-1"
                    title="Edit Name"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-xs text-amber-400 font-mono font-bold">
                {profile.managerTitle} • Level {profile.level} (Club XP: {profile.xp}/200)
              </p>

              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-white/10 text-xs font-mono font-bold text-slate-300">
                  {profile.division}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {profile.divisionPoints} Division Points
                </span>
              </div>
            </div>
          </div>

          {/* Quick Record Stats */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Record</span>
              <span className="font-rajdhani font-black text-2xl text-white font-mono">
                {profile.matchesWon}-{profile.matchesLost}
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">{winRate}% Win Rate</span>
            </div>

            <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Streak</span>
              <span className="font-rajdhani font-black text-2xl text-amber-400 font-mono">
                {profile.winStreak} 🔥
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Current Run</span>
            </div>

            <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Rings</span>
              <span className="font-rajdhani font-black text-2xl text-purple-400 font-mono">
                {profile.rings} 💍
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Championships</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trophy & Championship Cabinet */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="font-rajdhani font-black text-xl text-white">
            Franchise Trophy Cabinet & Accolades
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex flex-col items-center text-center">
            <div className="text-3xl mb-2">💍</div>
            <h4 className="font-rajdhani font-black text-base text-white">Larry O'Brien Ring</h4>
            <span className="text-xs text-amber-400 font-bold font-mono">{profile.rings} Rings Earned</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h4 className="font-rajdhani font-black text-base text-white">Division Cups</h4>
            <span className="text-xs text-slate-400 font-mono">{profile.trophies} Titles</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center">
            <div className="text-3xl mb-2">⭐</div>
            <h4 className="font-rajdhani font-black text-base text-white">All-Star Honors</h4>
            <span className="text-xs text-slate-400 font-mono">Conference Elite</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h4 className="font-rajdhani font-black text-base text-white">Sharpshooter Crest</h4>
            <span className="text-xs text-slate-400 font-mono">Drills Master</span>
          </div>
        </div>
      </div>

      {/* Full Roster Collection Binder */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="font-rajdhani font-black text-xl text-white">
                Club Roster Binder ({ownedPlayers.length} Cards)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Every basketball player card collected in your franchise vault.
            </p>
          </div>

          {/* Position Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'PG', 'SG', 'SF', 'PF', 'C'].map(pos => (
              <button
                key={pos}
                onClick={() => {
                  sound.playClick();
                  setFilterPosition(pos);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterPosition === pos
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Players Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredPlayers.map(player => (
            <div key={player.id} className="flex justify-center">
              <PlayerCard
                player={player}
                mini
                isCaptain={squad.captainId === player.id}
                onClick={() => onInspectPlayer(player)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save & Data Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-rajdhani font-black text-base text-white">
            Franchise Save & Cloud Backup
          </h4>
          <p className="text-xs text-slate-400">
            Export your squad roster and coins as a portable JSON code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenCloudModal && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenCloudModal();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2 border border-cyan-500/40 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Cloud Account</span>
            </button>
          )}

          <button
            onClick={handleExportSave}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all"
          >
            {saveCodeCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-amber-400" />}
            <span>{saveCodeCopied ? 'Save Copied!' : 'Export Save Code'}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setShowResetModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold flex items-center gap-2 border border-rose-800/60 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Franchise</span>
          </button>
        </div>
      </div>

      {/* IN-APP RESET FRANCHISE CONFIRMATION MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto text-2xl">
              <RotateCcw className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-rajdhani font-black text-2xl text-white">Reset Franchise?</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                This will wipe your current progress and restore the starting <strong className="text-amber-400">Bad Rookie Squad (60-65 OVR)</strong> with 650 coins. All cards will be reset to Level 1 so you can replay the Level 1 ➔ 99 grind!
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
                Yes, Reset Club
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
