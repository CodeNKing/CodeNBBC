import React, { useState, useEffect } from 'react';
import { PackItem, UserProfile, Player } from '../types';
import { PACKS } from '../data/players';
import { sound } from '../utils/audio';
import { 
  ShoppingBag, 
  Sparkles, 
  Clock, 
  Coins, 
  Gem, 
  Check, 
  ShieldCheck, 
  Flame,
  ArrowRight
} from 'lucide-react';

interface StorePacksProps {
  profile: UserProfile;
  featuredPlayers: Player[];
  onOpenPack: (pack: PackItem) => void;
  onExchangeGemsForCoins: (gems: number, coins: number) => void;
}

export const StorePacks: React.FC<StorePacksProps> = ({
  profile,
  featuredPlayers,
  onOpenPack,
  onExchangeGemsForCoins
}) => {
  const [timeUntilFreeScout, setTimeUntilFreeScout] = useState<string>('READY');
  const [isFreeScoutReady, setIsFreeScoutReady] = useState<boolean>(true);

  // 12-hour cooldown timer for daily free scout
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const twelveHours = 12 * 60 * 60 * 1000;
      const elapsed = now - (profile.lastFreeScoutClaimTime || 0);

      if (elapsed >= twelveHours) {
        setIsFreeScoutReady(true);
        setTimeUntilFreeScout('READY TO OPEN');
      } else {
        setIsFreeScoutReady(false);
        const remaining = twelveHours - elapsed;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilFreeScout(`${hours}h ${mins}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [profile.lastFreeScoutClaimTime]);

  const handleBuyPack = (pack: PackItem) => {
    sound.playClick();
    if (pack.isDailyFree) {
      if (!isFreeScoutReady) return;
      onOpenPack(pack);
      return;
    }

    if (pack.currency === 'coins' && profile.coins < pack.cost) {
      alert(`Insufficient Coins! You need ${pack.cost.toLocaleString()} 🪙 Coins.`);
      return;
    }

    if (pack.currency === 'gems' && profile.gems < pack.cost) {
      alert(`Insufficient Gems! You need ${pack.cost.toLocaleString()} 💎 Gems.`);
      return;
    }

    onOpenPack(pack);
  };

  return (
    <div className="space-y-6">
      {/* Store Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Player Card Market</span>
            </div>
            <h2 className="font-rajdhani font-black text-3xl sm:text-4xl text-white">
              Player Store & Superstar Packs
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Unbox All-Stars, Hall of Fame Icons, and GOAT legends. Rip packs to elevate your starting five and climb the leaderboards.
            </p>
          </div>

          {/* Quick Balance Display */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 font-mono">
              <span className="text-base">🪙</span>
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Coins</span>
                <span className="font-rajdhani font-black text-base text-amber-400 leading-none">
                  {profile.coins.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 font-mono">
              <span className="text-base">💎</span>
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Gems</span>
                <span className="font-rajdhani font-black text-base text-cyan-400 leading-none">
                  {profile.gems.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Free Scout Banner */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shadow">
            🎁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-rajdhani font-black text-xl text-white">Daily Scouting Assignment</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                Free Every 12H
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Claim a complimentary draft scout. Boost your bench rotation without spending coins!
            </p>
          </div>
        </div>

        <button
          onClick={() => handleBuyPack(PACKS[0])}
          disabled={!isFreeScoutReady}
          className={`px-6 py-2.5 rounded-xl font-rajdhani font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${
            isFreeScoutReady
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          {isFreeScoutReady ? (
            <>
              <Sparkles className="w-4 h-4" />
              <span>CLAIM FREE SCOUT</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              <span>NEXT IN {timeUntilFreeScout}</span>
            </>
          )}
        </button>
      </div>

      {/* Packs Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-rajdhani font-black text-xl text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Featured Booster Packs</span>
          </h3>
          <span className="text-xs text-slate-400">Guaranteed Minimum OVR Included</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PACKS.filter(p => !p.isDailyFree).map(pack => {
            const canAfford = pack.currency === 'coins' ? profile.coins >= pack.cost : profile.gems >= pack.cost;

            return (
              <div
                key={pack.id}
                className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                {/* Glow accent */}
                <div 
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                  style={{ backgroundColor: pack.accentColor }}
                />

                <div>
                  {/* Top Badge & Card count */}
                  <div className="flex items-center justify-between mb-3">
                    <span 
                      className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded shadow"
                      style={{ 
                        backgroundColor: `${pack.accentColor}25`,
                        color: pack.accentColor,
                        border: `1px solid ${pack.accentColor}40`
                      }}
                    >
                      {pack.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {pack.cardCount} Players
                    </span>
                  </div>

                  {/* Pack Graphic Icon & Title */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/10"
                      style={{ 
                        background: `linear-gradient(135deg, ${pack.accentColor}40, #090d16)` 
                      }}
                    >
                      🏀
                    </div>
                    <div>
                      <h4 className="font-rajdhani font-black text-xl text-white group-hover:text-amber-400 transition-colors">
                        {pack.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Min OVR: {pack.minOvr}+</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {pack.description}
                  </p>
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => handleBuyPack(pack)}
                  className={`w-full py-3 rounded-xl font-rajdhani font-black text-sm tracking-wider flex items-center justify-center gap-2 transition-all ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span>OPEN FOR</span>
                  <span className="font-mono">
                    {pack.cost.toLocaleString()} {pack.currency === 'coins' ? '🪙' : '💎'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gem to Coin Exchange Counter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-rajdhani font-black text-lg text-white">Gem to Coin Currency Exchange</h3>
            <p className="text-xs text-slate-400">Convert surplus gems into coins to purchase multiple booster packs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { gems: 50, coins: 5000, label: 'Handful of Coins' },
            { gems: 150, coins: 18000, label: 'Vault Bag (+20% Bonus)' },
            { gems: 350, coins: 45000, label: 'Franchise Chest (+30% Bonus)' }
          ].map(deal => (
            <button
              key={deal.gems}
              onClick={() => {
                sound.playClick();
                if (profile.gems < deal.gems) {
                  alert(`You need ${deal.gems} Gems for this exchange.`);
                  return;
                }
                onExchangeGemsForCoins(deal.gems, deal.coins);
              }}
              className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400/50 flex items-center justify-between transition-all group"
            >
              <div className="text-left">
                <span className="text-[11px] text-slate-400 block font-medium">{deal.label}</span>
                <span className="font-rajdhani font-black text-lg text-amber-400 block font-mono">
                  +{deal.coins.toLocaleString()} 🪙
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 font-rajdhani font-black text-xs text-cyan-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                {deal.gems} 💎
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
