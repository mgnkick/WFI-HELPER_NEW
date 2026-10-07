import { registerPlugin } from '@capacitor/core';
import { AccessPoint, CurrentWifiMetrics } from '../types/wifi';

export interface WifiNativeSnapshot {
  wifiConnected: boolean;
  usingMobileInternet: boolean;
  vpnActive?: boolean;
  vpnInterfaceName?: string;
  current: Partial<CurrentWifiMetrics> | null;
  accessPoints: AccessPoint[];
}

export interface WifiHelperPlugin {
  getSnapshot(): Promise<WifiNativeSnapshot>;
  requestPermissions(): Promise<{ location?: string; nearby?: string }>;
  openVpnSettings(): Promise<void>;
}

export const WifiHelper = registerPlugin<WifiHelperPlugin>('WifiHelper');
