// client/src/components/Dashboard/SpikeAlert.jsx
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, X, ExternalLink, AlertCircle } from 'lucide-react';
import { useRealtime } from '../../hooks/useRealtime';
import { useToast } from '../../context/ToastContext';

export default function SpikeAlert({ brand }) {
  const { spike, isConnected, clearSpike } = useRealtime(brand);
  const { toast } = useToast();
  const [displayedSpikes, setDisplayedSpikes] = useState([]);
  const spikeIdRef = useRef(new Set());

  useEffect(() => {
    if (spike && spike.detected) {
      const spikeId = `${spike.brand}-${spike.timestamp}`;

      if (!spikeIdRef.current.has(spikeId)) {
        setDisplayedSpikes(prev => [...prev, { ...spike, id: spikeId }]);
        spikeIdRef.current.add(spikeId);

        toast.success(`Spike detected for ${spike.brand}! +${spike.increase}%`, {
          duration: 8000,
          icon: <TrendingUp className="w-5 h-5" />
        });

        // Auto-dismiss after 20 seconds
        setTimeout(() => removeSpike(spikeId), 20000);
      }
    }
  }, [spike, toast]);

  const removeSpike = (id) => {
    setDisplayedSpikes(prev => prev.filter(s => s.id !== id));
    spikeIdRef.current.delete(id);
    if (displayedSpikes.length === 1) clearSpike(); // Only clear if last one
  };

  // Show nothing if no active spikes → fully transparent
  if (displayedSpikes.length === 0) {
    return null; // ← No div, no space, no background
  }

  return (
    <div className="space-y-5">
      {displayedSpikes.map((s) => (
        <div
          key={s.id}
          className="relative overflow-hidden rounded-2xl shadow-xl border
                     bg-gradient-to-br from-emerald-50/90 via-green-50/90 to-teal-50/90
                     dark:from-emerald-950/40 dark:via-green-950/40 dark:to-teal-950/40
                     backdrop-blur-md border-emerald-200 dark:border-emerald-800
                     animate-in slide-in-from-top-4 fade-in duration-500"
        >
          {/* Floating glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 dark:from-emerald-400/20 dark:to-teal-400/20" />
          
          <div className="relative p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Left: Icon + Content */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                      Conversation Spike Detected!
                    </h3>
                  </div>

                  <p className="text-emerald-800 dark:text-emerald-200 text-lg font-semibold mb-4">
                    <span className="text-emerald-900 dark:text-emerald-50 font-bold">{s.brand}</span> mentions surged by{' '}
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      +{s.increase}%
                    </span>
                    {' '}in the last hour
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Current', value: s.currentCount },
                      { label: 'Previous', value: s.previousCount },
                      { label: 'Spike Ratio', value: `${s.spikeRatio}x` },
                      { label: 'Dominant Tone', value: s.sentiment?.dominant || 'Mixed' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white/70 dark:bg-slate-800/60 rounded-xl p-3 backdrop-blur">
                        <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{stat.label}</div>
                        <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Top Mentions Preview */}
                  {s.topMentions?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Top mentions driving the spike:</p>
                      {s.topMentions.slice(0, 2).map((m) => (
                        <a
                          key={m.id}
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-white/80 dark:bg-slate-800/70 rounded-xl hover:bg-white dark:hover:bg-slate-800/90 transition-all group"
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 line-clamp-2">
                              {m.content}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                              <span className="capitalize">{m.source}</span>
                              <span>•</span>
                              <span className="capitalize font-medium">{m.sentiment}</span>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeSpike(s.id)}
                className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur hover:bg-white dark:hover:bg-slate-700 
                         text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 
                         transition-all hover:scale-110 active:scale-95 shadow-md"
                aria-label="Dismiss spike"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />
        </div>
      ))}
    </div>
  );
}