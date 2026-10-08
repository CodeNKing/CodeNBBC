export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type Rarity = 
  | 'bronze' 
  | 'silver' 
  | 'gold' 
  | 'emerald' 
  | 'diamond' 
  | 'master' 
  | 'goat' 
  | 'special';

export type Conference = 'East' | 'West' | 'Historic';

export interface PlayerStats {
  pts: number; // Shooting / 3PT / Scoring
  dnk: number; // Finishing / Driving Dunk / Inside
  ply: number; // Playmaking / Passing / Handles
  def: number; // Defense / Steals / Blocks
  reb: number; // Rebounding / Boxout
  ath: number; // Athleticism / Speed / Stamina
  clutch?: number; // 0-99
}

export interface Player {
  id: string;
  name: string;
  shortName: string;
  ovr: number;
  position: Position;
  secondaryPositions?: Position[];
  team: string;
  conference: Conference;
  flagEmoji: string;
  jerseyNumber: number;
  height: string;
  rarity: Rarity;
  avatarColor: string;
  avatarInitial: string;
  stats: PlayerStats;
  specialEdition?: string;
  skinTone?: string;
  level?: number;
}

export type FormationId = 
  | 'balanced' 
  | 'five_out' 
  | 'showtime' 
  | 'lockdown' 
  | 'pick_and_roll' 
  | 'triangle';

export interface Formation {
  id: FormationId;
  name: string;
  description: string;
  bonus: string;
  slots: {
    pg: { x: number; y: number; label: string };
    sg: { x: number; y: number; label: string };
    sf: { x: number; y: number; label: string };
    pf: { x: number; y: number; label: string };
    c: { x: number; y: number; label: string };
  };
}

export type OffenseTactic = 'balanced' | 'fast_break' | 'three_point' | 'pick_and_roll' | 'paint_attack';
export type DefenseTactic = 'man_to_man' | 'zone_2_3' | 'full_court_press' | 'switch_all';

export interface Squad {
  startingFive: {
    pg: string;
    sg: string;
    sf: string;
    pf: string;
    c: string;
  };
  bench: string[];
  formation: FormationId;
  offenseTactic: OffenseTactic;
  defenseTactic: DefenseTactic;
  captainId: string;
}

export interface CloudAccount {
  id: string;
  managerName: string;
  email: string;
  cloudSyncId: string;
  lastSyncedAt: number;
  conferencePreference?: 'East' | 'West';
  avatarEmoji?: string;
  passwordHash?: string;
}

export interface UserProfile {
  clubName: string;
  clubLogo: string;
  managerTitle: string;
  coins: number;
  gems: number;
  xp: number;
  level: number;
  division: string;
  divisionPoints: number;
  trophies: number;
  rings: number;
  matchesWon: number;
  matchesLost: number;
  matchesTied: number;
  winStreak: number;
  lastFreeScoutClaimTime: number;
  soundEnabled: boolean;
  drillsCompletedToday: number;
  unlockedTrophies: string[];
  cloudAccount?: CloudAccount | null;
}

export interface PackItem {
  id: string;
  name: string;
  cost: number;
  currency: 'coins' | 'gems';
  minOvr: number;
  guaranteedRarity: Rarity;
  description: string;
  cardCount: number;
  accentColor: string;
  badge: string;
  isDailyFree?: boolean;
}

export interface PlayByPlayEvent {
  id: string;
  quarter: number;
  timeRemaining: string;
  homeScore: number;
  awayScore: number;
  text: string;
  type: 'score' | 'three_pointer' | 'dunk' | 'steal' | 'block' | 'foul' | 'normal';
  team: 'home' | 'away';
  scorer?: string;
}
