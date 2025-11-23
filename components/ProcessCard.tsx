import React from 'react';
import { ApiProcess, ProcessStatus, RiskLevel } from '../types';
import { ShieldCheck, ShieldAlert, Skull, Activity, XCircle, StopCircle, Trash2 } from 'lucide-react';

interface ProcessCardProps {
  process: ApiProcess;
  onAction: (id: string, action: 'KILL' | 'STOP' | 'TERMINATE') => void;
  onAnalyze: (process: ApiProcess) => void;
}

const ProcessCard: React.FC<ProcessCardProps> = ({ process, onAction, onAnalyze }) => {
  const isRunning = process.status === ProcessStatus.RUNNING;
  
  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.SAFE: return 'border-slimer-500 text-slimer-100 bg-slimer-900/20';
      case RiskLevel.SUS: return 'border-yellow-500 text-yellow-100 bg-yellow-900/20';
      case RiskLevel.CRITICAL: return 'border-red-600 text-red-100 bg-red-900/30 animate-pulse';
      default: return 'border-gray-500 text-gray-300 bg-gray-900/20';
    }
  };

  const getRiskIcon = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.SAFE: return <ShieldCheck className="w-5 h-5 text-slimer-400" />;
      case RiskLevel.SUS: return <ShieldAlert className="w-5 h-5 text-yellow-400" />;
      case RiskLevel.CRITICAL: return <Skull className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className={`relative p-4 rounded-lg border-2 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(132,204,22,0.3)] ${getRiskColor(process.riskLevel)}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {getRiskIcon(process.riskLevel)}
          <h3 className="font-bold font-mono text-lg">{process.name}</h3>
        </div>
        <span className="text-xs font-mono opacity-70">PID: {process.pid}</span>
      </div>
      
      <div className="space-y-1 text-sm mb-4 font-mono">
        <p><span className="opacity-60">Port:</span> {process.port}</p>
        <p><span className="opacity-60">Protocol:</span> {process.protocol}</p>
        <p><span className="opacity-60">Talks To:</span> {process.connectedApps?.join(', ')}</p>
        <p className={`text-xs mt-2 italic ${process.riskLevel === RiskLevel.SAFE ? 'opacity-50' : 'text-yellow-300'}`}>
          {process.description}
        </p>
      </div>

      {isRunning ? (
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => onAction(process.id, 'STOP')}
            className="flex-1 bg-yellow-700/50 hover:bg-yellow-600 text-xs py-1 px-2 rounded border border-yellow-600 flex items-center justify-center gap-1 transition-colors"
          >
            <StopCircle size={14} /> Stop
          </button>
          <button 
            onClick={() => onAction(process.id, 'TERMINATE')}
            className="flex-1 bg-orange-800/50 hover:bg-orange-700 text-xs py-1 px-2 rounded border border-orange-700 flex items-center justify-center gap-1 transition-colors"
          >
            <XCircle size={14} /> Terminate
          </button>
          <button 
            onClick={() => onAction(process.id, 'KILL')}
            className="flex-1 bg-red-900/50 hover:bg-red-800 text-xs py-1 px-2 rounded border border-red-700 flex items-center justify-center gap-1 transition-colors"
          >
            <Trash2 size={14} /> Kill
          </button>
        </div>
      ) : (
        <div className="mt-2 text-center py-1 text-xs uppercase tracking-widest bg-black/40 rounded text-red-500 font-bold border border-red-900/50">
          {process.status}
        </div>
      )}

      <button 
        onClick={() => onAnalyze(process)}
        className="w-full mt-2 text-xs text-slimer-400 hover:text-slimer-200 underline text-center"
      >
        Ask AI Slimer about this
      </button>
    </div>
  );
};

export default ProcessCard;