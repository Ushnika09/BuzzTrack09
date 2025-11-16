// client/src/components/Dashboard/SpikeAlert.jsx
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, X, ExternalLink, AlertCircle } from 'lucide-react';
import { useRealtime } from '../../hooks/useRealtime';
import { useToast } from '../../context/ToastContext';
import CountUp from 'react-countup';
import confetti from 'canvas-confetti';

export default function SpikeAlert({ brand }) {
  const { spike, clearSpike } = useRealtime(brand);
  const { toast } = useToast();
  const [displayedSpikes, setDisplayedSpikes] = useState([]);
  const spikeIdRef = useRef(new Set());

  // Confetti + sound on huge spike
  const triggerCelebration = (increase) => {
    // Sound
    new Audio('/sounds/spike-chime.mp3').play().catch(() => {});

    // Confetti only on big spikes
    if (increase >= 100) {
      confetti({
        particleCount: increase >= 300 ? 300 : increase >= 200 ? 200 : 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#86efac', '#a7f3d0'],
        scalar: increase >= 300 ? 1.5 : 1.2,
      });
    }
  };

  useEffect(() => {
    if (spike && spike.detected) {
      const spikeId = `${spike.brand}-${spike.timestamp}`;
      if (spikeIdRef.current.has(spikeId)) return;

      const newSpike = { ...spike, id: spikeId };
      setDisplayedSpikes(prev => [...prev, newSpike]);
      spikeIdRef.current.add(spikeId);

      // Celebration
      triggerCelebration(spike.increase);

      // Toast
      toast.success(`Spike for ${spike.brand}! +${spike.increase}%`, {
        duration: 10000,
        icon: <TrendingUp className="w-5 h-5" />,
      });

      // Auto-scroll to spike card
      setTimeout(() => {
        document.querySelector('[data-tour="spike"]')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  }, [spike, toast]);

  const removeSpike = (id) => {
    setDisplayedSpikes(prev => prev.filter(s => s.id !== id));
    spikeIdRef.current.delete(id);
    if (displayedSpikes.length === 1) clearSpike();
  };

  // Dynamic intensity colors
  const getIntensity = (pct) => {
    if (pct >= 300) return { bg: 'from-red-500/20 to-rose-600/20', border: 'border-red-500/50', ring: 'ring-red-500/30', accent: 'from-red-500 to-rose-600', text: 'text-red-600 dark:text-red-400' };
    if (pct >= 200) return { bg: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/50', ring: 'ring-orange-500/30', accent: 'from-orange-500 to-red-500', text: 'text-orange-600 dark:text-orange-400' };
    if (pct >= 100) return { bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/50', ring: 'ring-amber-500/30', accent: 'from-amber-500 to-orange-500', text: 'text-amber-600 dark:text-amber-400' };
    return { bg: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/50', ring: 'ring-emerald-500/30', accent: 'from-emerald-500 to-teal-500', text: 'text-emerald-600 dark:text-emerald-400' };
  };

  if (displayedSpikes.length === 0) return null;

  return (
    <div className="space-y-6">
      {displayedSpikes.map((s, idx) => {
        const intensity = getIntensity(s.increase);
        const isNew = Date.now() - s.timestamp < 8000;

        return (
          <div
            key={s.id}
            className={`relative overflow-hidden rounded-2xl shadow-2xl border-2 ${intensity.border} 
                       bg-gradient-to-br ${intensity.bg} backdrop-blur-xl
                       animate-in slide-in-from-top-8 fade-in duration-700
                       ${isNew ? `animate-pulse ${intensity.ring} ring-8` : ''}
                       transition-all hover:scale-[1.02] hover:shadow-3xl`}
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            {/* Pulsing glow background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${intensity.accent} opacity-10 ${isNew ? 'animate-pulse' : ''}`} />

            <div className="relative p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-5 flex-1">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl bg-gradient-to-br ${intensity.accent} shadow-${intensity.accent.split(' ')[1]}/50`}>
                    <TrendingUp className={`w-9 h-9 text-white ${isNew ? 'animate-bounce' : ''}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertCircle className={`w-6 h-6 ${intensity.text}`} />
                      <h3 className={`text-2xl font-black ${intensity.text}`}>
                        Conversation Spike!
                      </h3>
                    </div>

                    <p className="text-lg font-bold mb-5">
                      <span className="text-slate-900 dark:text-white">{s.brand}</span> mentions just surged by{' '}
                      <CountUp
                        start={0}
                        end={s.increase}
                        duration={2.8}
                        suffix="%"
                        className={`text-4xl font-black ${intensity.text}`}
                      />
                      <span className="text-2xl"> in the last hour!</span>
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                      {[
                        { label: 'Current', value: s.currentCount.toLocaleString() },
                        { label: 'Previous', value: s.previousCount.toLocaleString() },
                        { label: 'Ratio', value: `${s.spikeRatio}x` },
                        { label: 'Tone', value: s.sentiment?.dominant || 'Mixed' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-white/80 dark:bg-slate-800/70 rounded-xl p-4 backdrop-blur">
                          <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Top mentions preview */}
                    {s.topMentions?.length > 0 && (
                      <div className="space-y-3">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Top drivers:</p>
                        {s.topMentions.slice(0, 2).map(m => (
                          <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-white/90 dark:bg-slate-800/80 rounded-xl hover:scale-105 transition-all group">
                            <div className="flex-1 pr-4">
                              <p className="font-medium line-clamp-2 text-slate-900 dark:text-white">{m.content}</p>
                              <div className="text-xs text-slate-500 mt-1">{m.source} • {m.sentiment}</div>
                            </div>
                            <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeSpike(s.id)}
                  className="p-3 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-all hover:scale-110"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className={`h-2 bg-gradient-to-r ${intensity.accent}`} />
          </div>
        );
      })}
    </div>
  );
}