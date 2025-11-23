import { ApiProcess, ProcessStatus, RiskLevel } from '../types';

const SAFE_APPS = [
  { name: 'python3 (flask_server)', port: 5000, risk: RiskLevel.SAFE, desc: 'Local Python Flask web server' },
  { name: 'node (react_scripts)', port: 3000, risk: RiskLevel.SAFE, desc: 'Node.js development server' },
  { name: 'postgres', port: 5432, risk: RiskLevel.SAFE, desc: 'PostgreSQL Database' },
  { name: 'docker-proxy', port: 8080, risk: RiskLevel.SAFE, desc: 'Docker Container Proxy' },
  { name: 'chrome-helper', port: 9222, risk: RiskLevel.SAFE, desc: 'Google Chrome remote debugging' },
  { name: 'spotify-connect', port: 57621, risk: RiskLevel.SAFE, desc: 'Spotify Connect API' },
];

const SUS_APPS = [
  { name: 'unknown_miner.exe', port: 6666, risk: RiskLevel.CRITICAL, desc: 'Suspected Crypto Miner' },
  { name: 'data-exfil-daemon', port: 1337, risk: RiskLevel.SUS, desc: 'Unverified Data Transfer Tool' },
  { name: 'keylog_service.py', port: 4444, risk: RiskLevel.CRITICAL, desc: 'Potential Keylogger' },
  { name: 'ads_injector_v2', port: 8899, risk: RiskLevel.SUS, desc: 'Adware Injection Service' },
];

// Helper to simulate scanning delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const scanSystemProcesses = async (): Promise<ApiProcess[]> => {
  await delay(1500); // Simulate scan time

  const processes: ApiProcess[] = [];
  
  // Add some safe apps
  SAFE_APPS.forEach(app => {
    if (Math.random() > 0.3) { // Randomize presence
      processes.push({
        id: crypto.randomUUID(),
        name: app.name,
        pid: Math.floor(Math.random() * 90000) + 1000,
        port: app.port,
        protocol: 'TCP',
        status: ProcessStatus.RUNNING,
        riskLevel: app.risk,
        description: app.desc,
        connectedApps: ['Localhost', 'System Kernel'],
        timestamp: new Date().toISOString()
      });
    }
  });

  // Add some SUS apps
  SUS_APPS.forEach(app => {
    if (Math.random() > 0.6) { // Occasional threat
      processes.push({
        id: crypto.randomUUID(),
        name: app.name,
        pid: Math.floor(Math.random() * 90000) + 1000,
        port: app.port,
        protocol: 'TCP',
        status: ProcessStatus.RUNNING,
        riskLevel: app.risk,
        description: app.desc,
        connectedApps: ['External IP (192.168.x.x)', 'Unknown Server'],
        timestamp: new Date().toISOString()
      });
    }
  });

  // Sort by risk
  return processes.sort((a, b) => (a.riskLevel === RiskLevel.SAFE ? 1 : -1));
};