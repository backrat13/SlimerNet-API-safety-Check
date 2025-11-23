import React, { useState, useEffect } from 'react';
import { ApiProcess, ProcessStatus, RiskLevel } from './types';
import { scanSystemProcesses } from './services/mockSystem';
import ProcessCard from './components/ProcessCard';
import ChatWidget from './components/ChatWidget';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Shield, Ghost, Search, AlertTriangle, Terminal } from 'lucide-react';
import { analyzeProcessWithAI } from './services/geminiService';

const COLORS = ['#84cc16', '#eab308', '#dc2626']; // Safe (Slimer Green), Sus (Yellow), Critical (Red)

const App: React.FC = () => {
  const [processes, setProcesses] = useState<ApiProcess[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'SUS' | 'RUNNING'>('ALL');
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  const stats = {
    safe: processes.filter(p => p.riskLevel === RiskLevel.SAFE).length,
    sus: processes.filter(p => p.riskLevel === RiskLevel.SUS).length,
    critical: processes.filter(p => p.riskLevel === RiskLevel.CRITICAL).length,
  };

  const chartData = [
    { name: 'Safe', value: stats.safe },
    { name: 'Suspicious', value: stats.sus },
    { name: 'Critical', value: stats.critical },
  ];

  const handleScan = async () => {
    setIsScanning(true);
    setProcesses([]);
    try {
      const results = await scanSystemProcesses();
      setProcesses(results);
      setLastScanTime(new Date());
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAction = (id: string, action: 'KILL' | 'STOP' | 'TERMINATE') => {
    setProcesses(prev => prev.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          status: action === 'KILL' ? ProcessStatus.KILLED : 
                  action === 'STOP' ? ProcessStatus.STOPPED : 
                  ProcessStatus.TERMINATED 
        };
      }
      return p;
    }));
  };

  const handleAnalyze = async (process: ApiProcess) => {
    // If we were really integrating deeply, this would open a modal with the AI response.
    // For this demo, we'll alert the user or log it, but the ChatWidget has the main AI context.
    const result = await analyzeProcessWithAI(process.name, process.port);
    alert(`Slimer AI Analysis for ${process.name}:\n\nRisk: ${result.risk}\n\n${result.explanation}`);
  };

  const filteredProcesses = processes.filter(p => {
    if (filter === 'SUS') return p.riskLevel === RiskLevel.SUS || p.riskLevel === RiskLevel.CRITICAL;
    if (filter === 'RUNNING') return p.status === ProcessStatus.RUNNING;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slimer-100 font-sans selection:bg-slimer-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-slimer-900 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slimer-500 rounded-lg shadow-[0_0_15px_#84cc16]">
              <Ghost className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono tracking-wider text-white">Slimer<span className="text-slimer-500">Net</span></h1>
              <p className="text-xs text-slimer-400 font-mono tracking-widest uppercase">API Threat Monitor v1.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {lastScanTime && (
               <span className="text-xs text-slate-400 font-mono hidden md:block">
                 Last Scan: {lastScanTime.toLocaleTimeString()}
               </span>
             )}
             <button
              onClick={handleScan}
              disabled={isScanning}
              className={`
                px-6 py-2 rounded font-bold uppercase tracking-wider text-sm transition-all
                ${isScanning 
                  ? 'bg-slimer-900 text-slimer-700 cursor-not-allowed border border-slimer-800' 
                  : 'bg-slimer-600 text-black hover:bg-slimer-500 shadow-[0_0_20px_rgba(132,204,22,0.4)] hover:shadow-[0_0_30px_rgba(132,204,22,0.6)]'
                }
              `}
             >
               {isScanning ? (
                 <span className="flex items-center gap-2"><Activity className="animate-spin" size={16}/> Scanning...</span>
               ) : (
                 <span className="flex items-center gap-2"><Search size={16}/> Initialize Scan</span>
               )}
             </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        
        {/* Dashboard Stats */}
        {processes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Chart */}
            <div className="lg:col-span-1 bg-slate-900/50 rounded-xl border border-slate-800 p-4 h-64 shadow-lg">
              <h3 className="text-slimer-400 font-mono text-sm mb-2 flex items-center gap-2">
                <Shield size={14} /> Threat Distribution
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3f6212', color: '#ecfccb' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Status Panel */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-slimer-900/10 border border-slimer-800 rounded-xl p-6 flex flex-col justify-center items-center">
                 <span className="text-4xl font-bold text-slimer-400 mb-2">{stats.safe}</span>
                 <span className="text-sm uppercase tracking-widest text-slimer-600">Safe Processes</span>
               </div>
               <div className="bg-yellow-900/10 border border-yellow-900/30 rounded-xl p-6 flex flex-col justify-center items-center">
                 <span className="text-4xl font-bold text-yellow-500 mb-2">{stats.sus}</span>
                 <span className="text-sm uppercase tracking-widest text-yellow-700">Suspicious</span>
               </div>
               <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden">
                 {stats.critical > 0 && <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>}
                 <span className="text-4xl font-bold text-red-500 mb-2 relative z-10">{stats.critical}</span>
                 <span className="text-sm uppercase tracking-widest text-red-700 relative z-10">Critical Threats</span>
               </div>
            </div>
          </div>
        )}

        {/* Process List Controls */}
        <div className="flex flex-wrap gap-4 mb-6 border-b border-slimer-900 pb-4">
          <button 
            onClick={() => setFilter('ALL')}
            className={`text-sm font-mono px-4 py-1 rounded-full transition-colors ${filter === 'ALL' ? 'bg-slimer-600 text-black' : 'text-slate-400 hover:text-slimer-300'}`}
          >
            All Processes
          </button>
          <button 
             onClick={() => setFilter('SUS')}
             className={`text-sm font-mono px-4 py-1 rounded-full transition-colors ${filter === 'SUS' ? 'bg-yellow-600 text-black' : 'text-slate-400 hover:text-yellow-300'}`}
          >
            Sus/Critical Only
          </button>
          <button 
             onClick={() => setFilter('RUNNING')}
             className={`text-sm font-mono px-4 py-1 rounded-full transition-colors ${filter === 'RUNNING' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Running Only
          </button>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {processes.length === 0 && !isScanning && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
              <Terminal size={48} className="mb-4 opacity-50" />
              <p className="font-mono text-lg">System Idle. Initialize Scan to Detect APIs.</p>
              <p className="text-sm mt-2 opacity-50">(Simulating Fedora/Web Environment)</p>
            </div>
          )}

          {isScanning && (
            <div className="col-span-full py-20 text-center">
              <div className="inline-block w-12 h-12 border-4 border-slimer-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slimer-400 font-mono animate-pulse">Scanning ports and protocols...</p>
            </div>
          )}

          {filteredProcesses.map(process => (
            <ProcessCard 
              key={process.id} 
              process={process} 
              onAction={handleAction}
              onAnalyze={handleAnalyze}
            />
          ))}
        </div>

        {/* Warning Banner for SUS */}
        {stats.critical > 0 && !isScanning && (
           <div className="fixed bottom-0 left-0 right-0 bg-red-900/90 text-white p-4 z-50 flex justify-between items-center backdrop-blur shadow-[0_-5px_20px_rgba(220,38,38,0.5)] border-t border-red-500">
             <div className="flex items-center gap-3 container mx-auto">
               <AlertTriangle className="animate-bounce" />
               <div>
                 <h2 className="font-bold text-lg">CRITICAL THREATS DETECTED</h2>
                 <p className="text-sm text-red-200">Recommendation: Immediate termination of {stats.critical} processes.</p>
               </div>
             </div>
           </div>
        )}

      </main>

      {/* Chat Bot */}
      <ChatWidget contextData={JSON.stringify(processes.map(p => ({ name: p.name, port: p.port, risk: p.riskLevel })))} />
    </div>
  );
};

export default App;