import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  Squad, 
  Player, 
  PackItem, 
  Position,
  CloudAccount 
} from './types';
import { 
  PLAYERS, 
  PLAYER_MAP, 
  INITIAL_USER_PROFILE, 
  INITIAL_SQUAD 
} from './data/players';
import { HomeDashboard } from './components/HomeDashboard';
import { SquadCourt } from './components/SquadCourt';
import { DrillsTraining } from './components/DrillsTraining';
import { StorePacks } from './components/StorePacks';
import { LiveMatch } from './components/LiveMatch';
import { ClubProfile } from './components/ClubProfile';
import { MobileHub } from './components/MobileHub';
import { PackOpeningModal } from './components/PackOpeningModal';
import { PlayerModal } from './components/PlayerModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { CloudAccountModal } from './components/CloudAccountModal';
import { sound } from './utils/audio';
import confetti from 'canvas-confetti';
import { 
  Home, 
  Users, 
  Target, 
  ShoppingBag, 
  Swords, 
  Shield, 
  Volume2, 
  VolumeX, 
  Sparkles,
  ShieldAlert,
  Cloud,
  CloudOff,
  CheckCircle2,
  Lock,
  Smartphone
} from 'lucide-react';

// Helper to detect if user client is on a mobile device
const isMobileClient = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isNarrow = window.innerWidth < 768;
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || ''
  );
  const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  return isNarrow || Boolean(mobileUA) || Boolean(hasTouch && window.innerWidth <= 1024);
};

// Helper to retrieve cloud save data for an account
const getStoredCloudSave = (account: CloudAccount | null) => {
  if (!account) return null;
  try {
    const raw = localStorage.getItem(`coden_cld_save_${account.email}`) ||
                localStorage.getItem(`coden_cld_save_${account.cloudSyncId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

export default function App() {
  // Mobile detection state
  const [isMobile, setIsMobile] = useState<boolean>(isMobileClient);

  // Navigation active tab: AUTO-SPAWN on mobile hub if on mobile!
  const [activeTab, setActiveTab] = useState<
    'home' | 'squad' | 'drills' | 'store' | 'match' | 'profile' | 'mobile_hub'
  >(() => {
    return isMobileClient() ? 'mobile_hub' : 'home';
  });

  // Track window resize for responsive mode changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileClient());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cloud Account State
  const [cloudAccount, setCloudAccount] = useState<CloudAccount | null>(() => {
    try {
      const saved = localStorage.getItem('coden_bbc_cloud_account');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(() => {
    // If user has not created a cloud account yet, open modal so they can connect and save items!
    try {
      const saved = localStorage.getItem('coden_bbc_cloud_account');
      return !saved;
    } catch {
      return true;
    }
  });

  // Notification for cloud actions
  const [cloudNotice, setCloudNotice] = useState<string | null>(null);

  // Initial cloud data (ONLY retrieve saved items if user is connected to cloud account!)
  const initialCloudData = cloudAccount ? getStoredCloudSave(cloudAccount) : null;

  // Stored state: restored from cloud save if account exists, otherwise fresh unlinked starter
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (initialCloudData?.profile) return initialCloudData.profile;
    return INITIAL_USER_PROFILE;
  });

  const [squad, setSquad] = useState<Squad>(() => {
    if (initialCloudData?.squad) return initialCloudData.squad;
    return INITIAL_SQUAD;
  });

  const [allOwnedCards, setAllOwnedCards] = useState<string[]>(() => {
    if (initialCloudData?.allOwnedCards) return initialCloudData.allOwnedCards;
    // Base starter cards: 5 starters + 5 bench rookies
    return [
      ...Object.values(INITIAL_SQUAD.startingFive),
      ...INITIAL_SQUAD.bench
    ];
  });

  const [claimedQuests, setClaimedQuests] = useState<string[]>(() => {
    if (initialCloudData?.claimedQuests) return initialCloudData.claimedQuests;
    return [];
  });

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('coden_bbc_sound');
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true;
  });

  // Active Modals
  const [openedPack, setOpenedPack] = useState<PackItem | null>(null);
  const [pulledPlayers, setPulledPlayers] = useState<Player[]>([]);
  const [inspectedPlayer, setInspectedPlayer] = useState<Player | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Restore player levels from cloud on mount if cloud account is present
  useEffect(() => {
    if (initialCloudData?.playerLevels) {
      Object.entries(initialCloudData.playerLevels).forEach(([id, lvl]) => {
        if (PLAYER_MAP[id]) PLAYER_MAP[id].level = lvl as number;
      });
    }
  }, []);

  // Sync sound setting
  useEffect(() => {
    sound.enabled = soundEnabled;
    try {
      localStorage.setItem('coden_bbc_sound', JSON.stringify(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  // Cloud backup function
  const backupSaveToCloud = (
    account: CloudAccount, 
    p = profile, 
    s = squad, 
    cards = allOwnedCards, 
    quests = claimedQuests
  ) => {
    try {
      const backupData = {
        profile: p,
        squad: s,
        allOwnedCards: cards,
        claimedQuests: quests,
        account: { ...account, lastSyncedAt: Date.now() },
        playerLevels: PLAYERS.reduce((acc, pl) => {
          if (pl.level && pl.level > 1) acc[pl.id] = pl.level;
          return acc;
        }, {} as Record<string, number>)
      };
      localStorage.setItem(`coden_cld_save_${account.email}`, JSON.stringify(backupData));
      localStorage.setItem(`coden_cld_save_${account.cloudSyncId}`, JSON.stringify(backupData));
    } catch {}
  };

  // Auto-backup to cloud whenever state changes IF cloud account is linked
  useEffect(() => {
    if (cloudAccount) {
      backupSaveToCloud(cloudAccount);
    }
  }, [profile, squad, allOwnedCards, claimedQuests, cloudAccount]);

  // Calculate Starting Five OVR
  const starters = [
    PLAYER_MAP[squad.startingFive.pg],
    PLAYER_MAP[squad.startingFive.sg],
    PLAYER_MAP[squad.startingFive.sf],
    PLAYER_MAP[squad.startingFive.pf],
    PLAYER_MAP[squad.startingFive.c],
  ].filter(Boolean);

  const teamOVR = Math.round(
    starters.reduce((acc, p) => acc + Math.min(99, p.ovr + ((p.level || 1) - 1)), 0) / (starters.length || 1)
  );

  // Calculate Chemistry (synergy based on matching conferences, primary positions, and balance)
  const chemistry = Math.min(100, Math.round(
    65 +
    starters.filter(p => p.conference === 'West').length * 4 +
    starters.filter(p => p.conference === 'East').length * 3 +
    (squad.captainId ? 5 : 0)
  ));

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) sound.playClick();
  };

  // Cloud Account Creation & Retrieval:
  // "Make it so that if you make an account saved to the cloud that is only when you get your saved items"
  const handleSaveCloudAccount = (account: CloudAccount, newClubName?: string, newClubLogo?: string) => {
    setCloudAccount(account);
    try {
      localStorage.setItem('coden_bbc_cloud_account', JSON.stringify(account));
    } catch {}

    // Check if this account already has saved items in the cloud
    const existingSave = getStoredCloudSave(account);

    if (existingSave) {
      // RETRIEVE SAVED ITEMS FROM CLOUD!
      if (existingSave.profile) setProfile(existingSave.profile);
      if (existingSave.squad) setSquad(existingSave.squad);
      if (existingSave.allOwnedCards) setAllOwnedCards(existingSave.allOwnedCards);
      if (existingSave.claimedQuests) setClaimedQuests(existingSave.claimedQuests);
      if (existingSave.playerLevels) {
        Object.entries(existingSave.playerLevels).forEach(([id, lvl]) => {
          if (PLAYER_MAP[id]) PLAYER_MAP[id].level = lvl as number;
        });
      }

      sound.playWalkout();
      try {
        confetti({ particleCount: 90, spread: 75 });
      } catch {}

      setCloudNotice('☁️ Cloud Account Connected: All your saved cards, player upgrades, and coins have been retrieved!');
      setTimeout(() => setCloudNotice(null), 5000);
    } else {
      // First time creating cloud account: save current franchise and grant cloud founder items!
      const updatedProfile: UserProfile = {
        ...profile,
        cloudAccount: account,
        coins: profile.coins + 1000,
        gems: profile.gems + 50,
        clubName: newClubName || profile.clubName,
        clubLogo: newClubLogo || profile.clubLogo,
        managerTitle: `${account.managerName}'s Franchise`
      };
      setProfile(updatedProfile);
      backupSaveToCloud(account, updatedProfile, squad, allOwnedCards, claimedQuests);

      sound.playWalkout();
      try {
        confetti({ particleCount: 80, spread: 70 });
      } catch {}

      setCloudNotice('🎉 Cloud Account Created! +1,000 Coins & +50 Gems bonus! Your items are now permanently saved in the cloud.');
      setTimeout(() => setCloudNotice(null), 5000);
    }
  };

  const handleSwitchCloudAccount = (emailOrId: string, password?: string): boolean => {
    try {
      const raw = localStorage.getItem(`coden_cld_save_${emailOrId}`);
      if (!raw) return false;
      const data = JSON.parse(raw);

      if (data.account) {
        setCloudAccount(data.account);
        localStorage.setItem('coden_bbc_cloud_account', JSON.stringify(data.account));
      }

      // RETRIEVE ALL SAVED ITEMS FROM CLOUD!
      if (data.profile) setProfile(data.profile);
      if (data.squad) setSquad(data.squad);
      if (data.allOwnedCards) setAllOwnedCards(data.allOwnedCards);
      if (data.claimedQuests) setClaimedQuests(data.claimedQuests);

      // Restore player levels
      if (data.playerLevels) {
        Object.entries(data.playerLevels).forEach(([id, lvl]) => {
          if (PLAYER_MAP[id]) PLAYER_MAP[id].level = lvl as number;
        });
      }

      sound.playWalkout();
      try {
        confetti({ particleCount: 80, spread: 70 });
      } catch {}

      setCloudNotice(`☁️ Cloud Save Retrieved: Loaded ${data.account?.managerName || 'Manager'}'s saved cards and roster!`);
      setTimeout(() => setCloudNotice(null), 5000);
      return true;
    } catch {
      return false;
    }
  };

  const handleSignOutCloudAccount = () => {
    sound.playWhistle();
    setCloudAccount(null);
    try {
      localStorage.removeItem('coden_bbc_cloud_account');
    } catch {}

    // Reset levels in memory
    PLAYERS.forEach(p => { p.level = 1; });

    // Reset active session back to default unlinked rookie state
    setProfile(INITIAL_USER_PROFILE);
    setSquad(INITIAL_SQUAD);
    setAllOwnedCards([
      ...Object.values(INITIAL_SQUAD.startingFive),
      ...INITIAL_SQUAD.bench
    ]);
    setClaimedQuests([]);

    setCloudNotice('🔒 Signed Out. Your saved items remain securely in the cloud. Sign in anytime to retrieve them!');
    setTimeout(() => setCloudNotice(null), 4000);
  };

  // Open Booster Pack Logic
  const handleOpenPack = (pack: PackItem) => {
    // Deduct cost
    if (!pack.isDailyFree) {
      setProfile(prev => ({
        ...prev,
        coins: pack.currency === 'coins' ? prev.coins - pack.cost : prev.coins,
        gems: pack.currency === 'gems' ? prev.gems - pack.cost : prev.gems,
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        lastFreeScoutClaimTime: Date.now()
      }));
    }

    // Determine random pulls based on pack minOvr
    const eligiblePool = PLAYERS.filter(p => p.ovr >= pack.minOvr - 2);
    const pulled: Player[] = [];
    const usedIds = new Set<string>();

    for (let i = 0; i < pack.cardCount; i++) {
      let candidate: Player;
      if (i === 0) {
        // Guaranteed minOvr
        const guaranteedPool = PLAYERS.filter(p => p.ovr >= pack.minOvr && !usedIds.has(p.id));
        candidate = guaranteedPool.length > 0 
          ? guaranteedPool[Math.floor(Math.random() * guaranteedPool.length)]
          : PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
      } else {
        const pool = eligiblePool.filter(p => !usedIds.has(p.id));
        candidate = pool.length > 0
          ? pool[Math.floor(Math.random() * pool.length)]
          : PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
      }
      usedIds.add(candidate.id);
      pulled.push(candidate);
    }

    setPulledPlayers(pulled);
    setOpenedPack(pack);
  };

  // Close Pack Opening Modal
  const handleClosePackOpening = (quickSellCoins?: number) => {
    if (quickSellCoins) {
      setProfile(prev => ({ ...prev, coins: prev.coins + quickSellCoins }));
    } else {
      // Add pulled cards to club collection
      const newCardIds = pulledPlayers.map(p => p.id);
      setAllOwnedCards(prev => Array.from(new Set([...prev, ...newCardIds])));
    }
    setOpenedPack(null);
    setPulledPlayers([]);
  };

  // Equip player from pack directly
  const handleEquipPlayerFromPack = (player: Player) => {
    sound.playClick();
    const posKey = player.position.toLowerCase() as keyof typeof squad.startingFive;
    setSquad(prev => ({
      ...prev,
      startingFive: {
        ...prev.startingFive,
        [posKey]: player.id
      }
    }));
    setAllOwnedCards(prev => Array.from(new Set([...prev, player.id])));
  };

  // Add Rewards from Drills or Matches
  const handleAddRewards = (coins: number, gems: number, xp: number) => {
    setProfile(prev => {
      const newXp = prev.xp + xp;
      const newLevel = newXp >= 200 ? prev.level + 1 : prev.level;
      return {
        ...prev,
        coins: prev.coins + coins,
        gems: prev.gems + gems,
        xp: newXp % 200,
        level: newLevel,
        drillsCompletedToday: prev.drillsCompletedToday + 1
      };
    });
  };

  // Handle Match Completed
  const handleMatchComplete = (result: 'win' | 'loss' | 'tie', coinsEarned: number, pointsEarned: number) => {
    setProfile(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      divisionPoints: prev.divisionPoints + (result === 'win' ? pointsEarned : result === 'tie' ? 10 : -10),
      matchesWon: result === 'win' ? prev.matchesWon + 1 : prev.matchesWon,
      matchesLost: result === 'loss' ? prev.matchesLost + 1 : prev.matchesLost,
      matchesTied: result === 'tie' ? prev.matchesTied + 1 : prev.matchesTied,
      winStreak: result === 'win' ? prev.winStreak + 1 : 0,
      rings: result === 'win' && Math.random() > 0.75 ? prev.rings + 1 : prev.rings,
      trophies: result === 'win' ? prev.trophies + 1 : prev.trophies
    }));
  };

  // Handle Currency Exchange
  const handleExchangeGemsForCoins = (gems: number, coins: number) => {
    setProfile(prev => ({
      ...prev,
      gems: prev.gems - gems,
      coins: prev.coins + coins
    }));
  };

  // Upgrade Player up to Level 99
  const handleUpgradePlayer = (playerId: string, cost: number, levelsToAdd: number = 1) => {
    const p = PLAYER_MAP[playerId];
    if (!p) return;
    p.level = Math.min(99, (p.level || 1) + levelsToAdd);
    setProfile(prev => ({ ...prev, coins: prev.coins - cost }));
    setInspectedPlayer({ ...p });
    setSquad(prev => ({ ...prev }));
  };

  // Admin directly sets player level (e.g. max to 99)
  const handleUpgradePlayerToLvl = (playerId: string, targetLvl: number) => {
    const p = PLAYER_MAP[playerId];
    if (!p) return;
    p.level = Math.min(99, targetLvl);
    if (inspectedPlayer && inspectedPlayer.id === playerId) {
      setInspectedPlayer({ ...p });
    }
    setSquad(prev => ({ ...prev }));
  };

  // Set Captain
  const handleSetCaptain = (playerId: string) => {
    setSquad(prev => ({ ...prev, captainId: playerId }));
  };

  // Claim Daily Quest
  const handleClaimDailyQuest = (questId: string, coins: number, gems: number) => {
    setClaimedQuests(prev => [...prev, questId]);
    handleAddRewards(coins, gems, 30);
  };

  // Reset Club to Bad Starter Squad - 100% reliable reset!
  const handleResetClub = () => {
    sound.playWhistle();

    // 1. Reset all player levels across entire game to 1
    PLAYERS.forEach(p => {
      p.level = 1;
    });
    Object.values(PLAYER_MAP).forEach(p => {
      p.level = 1;
    });

    // 2. Set new profile state (preserving cloud account metadata)
    const freshProfile: UserProfile = {
      ...INITIAL_USER_PROFILE,
      cloudAccount: cloudAccount,
      clubName: cloudAccount?.managerName ? `${cloudAccount.managerName}'s Ballers` : INITIAL_USER_PROFILE.clubName
    };
    setProfile(freshProfile);

    // 3. Reset squad to starting 5 bad rookies
    const freshSquad: Squad = JSON.parse(JSON.stringify(INITIAL_SQUAD));
    setSquad(freshSquad);

    // 4. Reset owned cards to only starting 5 + bench rookies
    const starterCards = [
      ...Object.values(freshSquad.startingFive),
      ...freshSquad.bench
    ];
    setAllOwnedCards(starterCards);
    setClaimedQuests([]);
    setInspectedPlayer(null);

    // 5. Update localStorage & cloud save synchronously
    if (cloudAccount) {
      backupSaveToCloud(cloudAccount, freshProfile, freshSquad, starterCards, []);
    } else {
      try {
        localStorage.removeItem('coden_bbc_profile');
        localStorage.removeItem('codee_bbc_profile');
      } catch {}
    }

    setCloudNotice('🔄 Franchise reset to rookie team (60-65 OVR). Ready to grind back to Level 99!');
    setTimeout(() => setCloudNotice(null), 4000);
    setActiveTab(isMobileClient() ? 'mobile_hub' : 'home');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-white">
      {/* CLOUD BANNER NOTIFICATION (if active) */}
      {cloudNotice && (
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 text-white font-rajdhani font-black px-4 py-2 text-center text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg z-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{cloudNotice}</span>
        </div>
      )}

      {/* TOP HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3 transition-colors shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => {
              sound.playClick();
              setActiveTab(isMobileClient() ? 'mobile_hub' : 'home');
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-[2px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-xl">
                🏀
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-rajdhani font-black text-2xl tracking-wider text-white">CODEN</span>
                <span className="font-rajdhani font-black text-2xl tracking-wider text-amber-400">BBC</span>
              </div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block -mt-1">
                Basketball Club
              </span>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/5">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'mobile_hub', label: 'Mobile Hub', icon: Smartphone },
              { id: 'squad', label: 'Squad', icon: Users },
              { id: 'drills', label: 'Drills', icon: Target },
              { id: 'store', label: 'Store', icon: ShoppingBag },
              { id: 'match', label: 'Match', icon: Swords },
              { id: 'profile', label: 'Club', icon: Shield },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-black tracking-wider uppercase flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header: Cloud Sync, Coins, Gems, OVR, Sound, Admin */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud Sync Status Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsCloudModalOpen(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-mono text-xs transition-all shadow-sm active:scale-95 ${
                cloudAccount
                  ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40 animate-pulse'
              }`}
              title={cloudAccount ? 'Cloud Account Linked' : 'Connect Cloud Account to Save Items'}
            >
              {cloudAccount ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline font-rajdhani font-black text-xs">
                    {cloudAccount.managerName}
                  </span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline font-rajdhani font-black text-xs">
                    Link Cloud
                  </span>
                </>
              )}
            </button>

            {/* Coins */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 font-mono text-xs">
              <span className="text-sm">🪙</span>
              <span className="font-rajdhani font-black text-amber-400 text-sm">
                {profile.coins.toLocaleString()}
              </span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 font-mono text-xs">
              <span className="text-sm">💎</span>
              <span className="font-rajdhani font-black text-cyan-400 text-sm">
                {profile.gems.toLocaleString()}
              </span>
            </div>

            {/* Team OVR Badge */}
            <div 
              onClick={() => {
                sound.playClick();
                setActiveTab('squad');
              }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer hover:bg-amber-500/20 transition-colors"
            >
              <span className="text-[10px] uppercase font-bold text-slate-400">OVR</span>
              <span className="font-rajdhani font-black text-amber-400 text-sm">{teamOVR}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
              title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Admin Console Button (Secret Password Protected) */}
            <button
              onClick={() => {
                sound.playClick();
                setIsAdminOpen(true);
              }}
              className="p-2 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 transition-all flex items-center gap-1 shadow-sm active:scale-95"
              title="Admin Terminal"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline text-[10px] font-rajdhani font-black uppercase tracking-wider">
                Admin
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* UNLINKED WARNING NOTICE BAR IF NO CLOUD ACCOUNT */}
      {!cloudAccount && (
        <div 
          onClick={() => {
            sound.playClick();
            setIsCloudModalOpen(true);
          }}
          className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 cursor-pointer hover:bg-amber-500/20 transition-colors"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-medium text-amber-300">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Unsaved Guest Session:</strong> Making an account saved to the cloud is required to retrieve and permanently keep your cards, coins, and Level 99 upgrades!
              </span>
            </div>
            <span className="font-rajdhani font-black text-amber-400 underline uppercase tracking-wider ml-2 flex-shrink-0">
              Save Items to Cloud →
            </span>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {activeTab === 'home' && (
          <HomeDashboard
            profile={profile}
            squad={squad}
            playerMap={PLAYER_MAP}
            teamOVR={teamOVR}
            chemistry={chemistry}
            onNavigateTab={setActiveTab}
            onInspectPlayer={setInspectedPlayer}
            onClaimDailyQuest={handleClaimDailyQuest}
            claimedQuests={claimedQuests}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
        )}

        {activeTab === 'squad' && (
          <SquadCourt
            squad={squad}
            allOwnedCards={allOwnedCards}
            playerMap={PLAYER_MAP}
            teamOVR={teamOVR}
            chemistry={chemistry}
            onUpdateSquad={setSquad}
            onInspectPlayer={setInspectedPlayer}
          />
        )}

        {activeTab === 'drills' && (
          <DrillsTraining
            profile={profile}
            squadPlayers={starters}
            onAddRewards={handleAddRewards}
          />
        )}

        {activeTab === 'store' && (
          <StorePacks
            profile={profile}
            featuredPlayers={PLAYERS}
            onOpenPack={handleOpenPack}
            onExchangeGemsForCoins={handleExchangeGemsForCoins}
          />
        )}

        {activeTab === 'match' && (
          <LiveMatch
            userSquad={squad}
            playerMap={PLAYER_MAP}
            profile={profile}
            teamOVR={teamOVR}
            chemistry={chemistry}
            onMatchComplete={handleMatchComplete}
          />
        )}

        {activeTab === 'profile' && (
          <ClubProfile
            profile={profile}
            allOwnedCards={allOwnedCards}
            playerMap={PLAYER_MAP}
            squad={squad}
            onUpdateProfile={setProfile}
            onInspectPlayer={setInspectedPlayer}
            onResetClub={handleResetClub}
            onOpenCloudModal={() => setIsCloudModalOpen(true)}
          />
        )}

        {activeTab === 'mobile_hub' && (
          <MobileHub
            profile={profile}
            squad={squad}
            playerMap={PLAYER_MAP}
            teamOVR={teamOVR}
            chemistry={chemistry}
            onNavigateTab={setActiveTab}
            onInspectPlayer={setInspectedPlayer}
            onOpenPack={handleOpenPack}
            onUpgradePlayer={handleUpgradePlayer}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenCloudModal={() => setIsCloudModalOpen(true)}
            onResetClub={handleResetClub}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-2">
        <div className="grid grid-cols-6 gap-1">
          {[
            { id: 'mobile_hub', label: 'Hub', icon: Smartphone },
            { id: 'squad', label: 'Squad', icon: Users },
            { id: 'match', label: 'Match', icon: Swords },
            { id: 'drills', label: 'Drills', icon: Target },
            { id: 'store', label: 'Store', icon: ShoppingBag },
            { id: 'profile', label: 'Club', icon: Shield },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-rajdhani font-black mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PACK OPENING MODAL */}
      {openedPack && (
        <PackOpeningModal
          pack={openedPack}
          pulledPlayers={pulledPlayers}
          onClose={handleClosePackOpening}
          onEquipPlayer={handleEquipPlayerFromPack}
        />
      )}

      {/* PLAYER INSPECTION MODAL */}
      {inspectedPlayer && (
        <PlayerModal
          player={inspectedPlayer}
          coins={profile.coins}
          isCaptain={squad.captainId === inspectedPlayer.id}
          onClose={() => setInspectedPlayer(null)}
          onUpgradePlayer={handleUpgradePlayer}
          onSetCaptain={handleSetCaptain}
        />
      )}

      {/* ADMIN PANEL MODAL (Secret Password: nathan10) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        profile={profile}
        squad={squad}
        allOwnedCards={allOwnedCards}
        onUpdateProfile={setProfile}
        onUpdateSquad={setSquad}
        onUpdateOwnedCards={setAllOwnedCards}
        onUpgradePlayerToLvl={handleUpgradePlayerToLvl}
      />

      {/* CLOUD ACCOUNT ONBOARDING & SYNC MODAL */}
      <CloudAccountModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        isMandatory={!cloudAccount}
        currentAccount={cloudAccount}
        onSaveAccount={handleSaveCloudAccount}
        onSwitchAccount={handleSwitchCloudAccount}
        onForceSync={() => cloudAccount && backupSaveToCloud(cloudAccount)}
        onSignOut={handleSignOutCloudAccount}
      />
    </div>
  );
}
