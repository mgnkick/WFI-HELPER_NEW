export type WifiStandard = '802.11b' | '802.11g' | '802.11n' | '802.11ac' | '802.11ax' | '802.11be';
export type WifiBand = '2.4GHz' | '5GHz' | '6GHz';
export type ChannelWidth = '20MHz' | '40MHz' | '80MHz' | '160MHz';
export type HealthStatus = 'excellent' | 'warning' | 'critical';

export interface VpnStatus {
  isActive: boolean;
  interfaceName?: string; // e.g. "tun0", "wg0", "ppp0"
  vpnAppName?: string; // e.g. "WireGuard / OpenVPN Client"
  serverLocation?: string;
  detectedIp?: string;
  warningNote: string;
}

export interface AccessPoint {
  bssid: string;
  ssid: string;
  rssi: number; // dBm e.g. -55
  frequency: number; // MHz e.g. 5180
  channel: number;
  band: WifiBand;
  channelWidth: ChannelWidth;
  standard: WifiStandard;
  isCurrent: boolean;
  security: string;
}

export interface CurrentWifiMetrics {
  ssid: string;
  bssid: string;
  rssi: number; // dBm
  signalPercent: number; // 0-100%
  frequency: number; // MHz
  channel: number;
  band: WifiBand;
  channelWidth: ChannelWidth;
  standard: WifiStandard;
  linkSpeedTxMbps: number;
  linkSpeedRxMbps: number;
  noiseEstimateDbm: number;
  snrDb: number;
  coChannelApCount: number;
  ipAddress: string;
  subnetMask: string;
  gateway: string;
  dnsServers: string[];
  externalIp?: string;
  ispName?: string;
  vpn: VpnStatus;
  wifiConnected?: boolean;
  usingMobileInternet?: boolean;
}

export interface SpeedTestRun {
  id: string;
  timestamp: string;
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
  lossPercent: number;
  source: 'yandex' | 'network_test' | '2ip';
  ispName: string;
  serverLocation: string;
  externalIp: string;
  wifiSsid: string;
  wifiBssid: string;
  wifiBand: WifiBand;
  wifiRssi: number;
  vpnActive: boolean;
  vpnName?: string;
  note?: string;
}

export interface PingResult {
  target: string;
  name: string;
  sent: number;
  received: number;
  lossPercent: number;
  minRtt: number;
  avgRtt: number;
  maxRtt: number;
  jitter: number;
  status: HealthStatus;
  statusNote: string;
}

export interface TermExplanation {
  id: string;
  term: string;
  shortName: string;
  simpleExplanation: string;
  analogy: string;
  idealRange: string;
  whyItMatters: string;
  practicalTips: string[];
}

export interface AndroidCodeFile {
  path: string;
  name: string;
  category: 'kotlin' | 'gradle' | 'manifest' | 'ci' | 'scripts' | 'res';
  description: string;
  content: string;
}
