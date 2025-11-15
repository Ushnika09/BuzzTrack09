// client/src/components/Dashboard/SpikeAlert.jsx
import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, TrendingUp, X, ExternalLink } from 'lucide-react';
import { useRealtime } from '../../hooks/useRealtime';
import { useToast } from '../../context/ToastContext';

export default function SpikeAlert({ brand }) {
  const { spike, isConnected, clearSpike } = useRealtime(brand);
  const { toast } = useToast();
  const [displayedSpikes, setDisplayedSpikes] = useState([]);
  const spikeIdRef = useRef(new Set());

  // Debug: Log connection status
  useEffect(() => {
    console.log('🔍 SpikeAlert - Connection Status:', {
      brand,
      isConnected,
      hasSpike: !!spike,
      spikeDetected: spike?.detected,
      displayedSpikesCount: displayedSpikes.length
    });
  }, [brand, isConnected, spike, displayedSpikes.length]);

  // Handle new spike
  useEffect(() => {
    if (spike && spike.detected) {
      // Create unique ID for this spike
      const spikeId = `${spike.brand}-${spike.timestamp}`;
      
      console.log('🚨 NEW SPIKE RECEIVED:', {
        spikeId,
        brand: spike.brand,
        increase: spike.increase,
        timestamp: spike.timestamp,
        alreadyShown: spikeIdRef.current.has(spikeId)
      });

      // Check if we've already shown this spike
      if (!spikeIdRef.current.has(spikeId)) {
        console.log('✅ Adding spike to display list');
        
        // Add to displayed spikes
        setDisplayedSpikes(prev => [...prev, { ...spike, id: spikeId }]);
        spikeIdRef.current.add(spikeId);

        // Show toast notification
        toast.warning(
          `🚨 Spike detected for ${spike.brand}! ${spike.increase}% increase`,
          6000
        );

        // Auto-remove after 15 seconds
        setTimeout(() => {
          console.log('⏰ Auto-removing spike:', spikeId);
          removeSpike(spikeId);
        }, 15000);
      } else {
        console.log('⚠️ Spike already displayed, skipping');
      }
    }
  }, [spike, toast]);

  const removeSpike = (spikeId) => {
    console.log('🗑️ Removing spike:', spikeId);
    setDisplayedSpikes(prev => prev.filter(s => s.id !== spikeId));
    spikeIdRef.current.delete(spikeId);
    clearSpike();
  };

  // Show connection status in dev mode
  if (process.env.NODE_ENV === 'development' && !isConnected) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm">WebSocket disconnected - Spikes won't update</span>
        </div>
      </div>
    );
  }

  if (displayedSpikes.length === 0) {
    console.log('❌ No spikes to display');
    return null;
  }

  console.log('✅ Rendering', displayedSpikes.length, 'spike(s)');

  return (
    <div id="spike-alerts" className="space-y-4 mb-6">
      {displayedSpikes.map((currentSpike) => (
        <div
          key={currentSpike.id}
          className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 
                     border-l-4 border-amber-500 dark:border-amber-400 rounded-xl p-5 shadow-lg
                     animate-in slide-in-from-top duration-500"
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h4 className="font-bold text-lg text-amber-900 dark:text-amber-100">
                  Conversation Spike Detected!
                </h4>
              </div>
              
              {/* Main Message */}
              <p className="text-amber-800 dark:text-amber-200 mb-3 font-medium">
                <strong className="text-amber-900 dark:text-amber-50">{currentSpike.brand}</strong> mentions 
                increased by{' '}
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {currentSpike.increase}%
                </span>
                {' '}in the last hour
              </p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2">
                  <div className="text-xs text-amber-700 dark:text-amber-300 mb-1">Current</div>
                  <div className="font-bold text-amber-900 dark:text-amber-100">
                    {currentSpike.currentCount}
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2">
                  <div className="text-xs text-amber-700 dark:text-amber-300 mb-1">Previous</div>
                  <div className="font-bold text-amber-900 dark:text-amber-100">
                    {currentSpike.previousCount}
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2">
                  <div className="text-xs text-amber-700 dark:text-amber-300 mb-1">Ratio</div>
                  <div className="font-bold text-amber-900 dark:text-amber-100">
                    {currentSpike.spikeRatio}x
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2">
                  <div className="text-xs text-amber-700 dark:text-amber-300 mb-1">Sentiment</div>
                  <div className="font-bold text-amber-900 dark:text-amber-100 capitalize">
                    {currentSpike.sentiment?.dominant || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Sources */}
              {currentSpike.sources && Object.keys(currentSpike.sources).length > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 mb-3">
                  <span className="font-medium">Sources:</span>
                  {Object.entries(currentSpike.sources).map(([source, count]) => (
                    <span key={source} className="bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded">
                      {source}: {count}
                    </span>
                  ))}
                </div>
              )}

              {/* Top Mentions */}
              {currentSpike.topMentions && currentSpike.topMentions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    Top Mentions:
                  </div>
                  {currentSpike.topMentions.slice(0, 2).map((mention) => (
                    <a
                      key={mention.id}
                      href={mention.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 p-2 bg-white/70 dark:bg-slate-800/70 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-amber-900 dark:text-amber-100 line-clamp-2">
                          {mention.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-amber-600 dark:text-amber-400">
                          <span className="capitalize">{mention.source}</span>
                          <span>•</span>
                          <span className="capitalize">{mention.sentiment}</span>
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => removeSpike(currentSpike.id)}
              className="p-2 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors flex-shrink-0"
              aria-label="Dismiss spike alert"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}