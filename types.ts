export enum RiskLevel {
  SAFE = 'SAFE',
  UNKNOWN = 'UNKNOWN',
  SUS = 'SUS',
  CRITICAL = 'CRITICAL'
}

export enum ProcessStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  TERMINATED = 'TERMINATED',
  KILLED = 'KILLED'
}

export interface ApiProcess {
  id: string;
  name: string;
  pid: number;
  port: number;
  protocol: 'TCP' | 'UDP';
  status: ProcessStatus;
  riskLevel: RiskLevel;
  description?: string;
  connectedApps?: string[]; // What apps it talks to
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}