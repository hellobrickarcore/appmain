import React, { useState } from 'react';
import { Camera, Server, Activity, Bug } from 'lucide-react';
import { DetectorState, ScannerError } from '../detector/detectorTypes';

export interface DebugStats {
  cameraReady: boolean;
  resolution: string;
  detectorState: DetectorState;
  lastError: ScannerError | null;
  inferenceCount: number;
  consecutiveFailures: number;
  overlaysRendered: number;
  sessionId: string;
  liveDetectionsCount: number;
  captureDetectionsCount: number;
  tilesProcessed: number;
  nmsRemovedBoxes: number;
  captureProcessingTime: number;
}

export const ScannerDebugPanel: React.FC<{ stats: DebugStats }> = ({ stats }) => {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button 
        onClick={() => setExpanded(true)}
        className="absolute top-4 right-4 z-[9999] p-2 bg-black/60 rounded-full text-zinc-400 hover:text-white"
      >
        <Bug size={24} />
      </button>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-[9999] w-80 bg-black/90 border border-zinc-700 rounded-lg overflow-hidden text-xs font-mono text-zinc-300">
      <div className="flex items-center justify-between p-2 bg-zinc-900 border-b border-zinc-700">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Bug size={14} className="text-orange-500" /> Scanner Core Debug
        </h3>
        <button onClick={() => setExpanded(false)} className="px-2 py-1 bg-zinc-800 rounded hover:bg-zinc-700 text-white">&times;</button>
      </div>
      
      <div className="p-3 space-y-4">
        {/* Camera */}
        <div>
          <h4 className="flex items-center gap-2 font-bold text-white mb-1"><Camera size={12}/> Camera</h4>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-zinc-500">Active:</span> 
            <span className={stats.cameraReady ? 'text-green-400' : 'text-red-400'}>{stats.cameraReady ? 'YES' : 'NO'}</span>
            <span className="text-zinc-500">Res:</span> 
            <span>{stats.resolution}</span>
            <span className="text-zinc-500">Secure:</span> 
            <span>{window.isSecureContext ? 'true' : 'false'}</span>
          </div>
        </div>

        {/* Detector */}
        <div>
          <h4 className="flex items-center gap-2 font-bold text-white mb-1"><Server size={12}/> Detector</h4>
          <div className="grid grid-cols-2 gap-1 mb-2">
            <span className="text-zinc-500">State:</span> 
            <span className={stats.detectorState === 'ready' || stats.detectorState === 'detecting' ? 'text-green-400' : 'text-orange-400'}>{stats.detectorState.toUpperCase()}</span>
            <span className="text-zinc-500">Session:</span> 
            <span className="truncate" title={stats.sessionId}>{stats.sessionId}</span>
            <span className="text-zinc-500">Inferences:</span> 
            <span>{stats.inferenceCount}</span>
            <span className="text-zinc-500">Consec Fails:</span> 
            <span className={stats.consecutiveFailures > 0 ? "text-red-400" : ""}>{stats.consecutiveFailures}</span>
          </div>
          
          <h5 className="font-bold text-white text-[10px] mt-2 mb-1 opacity-70">LIFETIME PIPELINE STATS</h5>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <span className="text-zinc-400">Live Det:</span> 
            <span className="text-blue-300">{stats.liveDetectionsCount}</span>
            <span className="text-zinc-400">Capture Det:</span> 
            <span className="text-purple-300">{stats.captureDetectionsCount}</span>
            <span className="text-zinc-400">Tiles Processed:</span> 
            <span>{stats.tilesProcessed}</span>
            <span className="text-zinc-400">NMS Removed:</span> 
            <span>{stats.nmsRemovedBoxes}</span>
            <span className="text-zinc-400">Capture Time:</span> 
            <span>{stats.captureProcessingTime > 0 ? `${stats.captureProcessingTime}ms` : '-'}</span>
          </div>
        </div>

        {/* Errors */}
        <div className="pt-2 border-t border-zinc-800">
          <h4 className="flex items-center gap-2 font-bold text-red-400 mb-1"><Activity size={12}/> Last Error</h4>
          {stats.lastError ? (
            <div className="text-[10px] break-words">
              <span className="text-zinc-500">[{stats.lastError.stage}]</span> {stats.lastError.message}
              {stats.lastError.status && <div><span className="text-zinc-500">Status:</span> {stats.lastError.status}</div>}
              <div><span className="text-zinc-500">T:</span> {new Date(stats.lastError.ts).toISOString().split('T')[1].replace('Z','')}</div>
            </div>
          ) : (
             <span className="text-zinc-500 italic">No structured errors logged.</span>
          )}
        </div>
      </div>
    </div>
  );
};
