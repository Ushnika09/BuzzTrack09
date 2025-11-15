// client/src/components/Debug/WebSocketDebug.jsx
import { useRealtime } from '../../hooks/useRealtime';
import { Wifi, WifiOff } from 'lucide-react';

export default function WebSocketDebug({ brand }) {
  const { isConnected, spike, newMention } = useRealtime(brand);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-slate-900 text-white p-4 rounded-lg shadow-xl text-xs font-mono max-w-sm z-50">
      <div className="flex items-center gap-2 mb-2 font-bold">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-400">WebSocket Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-red-400">WebSocket Disconnected</span>
          </>
        )}
      </div>
      
      <div className="space-y-1 text-slate-300">
        <div>Brand: <span className="text-blue-300">{brand || 'None'}</span></div>
        <div>Has Spike: <span className={spike ? 'text-green-300' : 'text-red-300'}>
          {spike ? 'YES' : 'NO'}
        </span></div>
        <div>Spike Detected: <span className={spike?.detected ? 'text-green-300' : 'text-red-300'}>
          {spike?.detected ? 'YES' : 'NO'}
        </span></div>
        {spike?.detected && (
          <>
            <div>Increase: <span className="text-yellow-300">{spike.increase}%</span></div>
            <div>Current: <span className="text-yellow-300">{spike.currentCount}</span></div>
          </>
        )}
        <div>New Mention: <span className={newMention ? 'text-green-300' : 'text-red-300'}>
          {newMention ? 'YES' : 'NO'}
        </span></div>
      </div>
    </div>
  );
}