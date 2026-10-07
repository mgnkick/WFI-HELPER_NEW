import { registerPlugin } from '@capacitor/core';
import { AccessPoint, CurrentWifiMetrics } from '../types/wifi';

export interface WifiNativeSnapshot {
  wifiConnected: boolean;
  usingMobileInternet: boolean;
  current: Partial<CurrentWifiMetrics> | null;
  accessPoints: AccessPoint[];
}

export interface WifiHelperPlugin {
  getSnapshot(): Promise<WifiNativeSnapshot>;
  requestPermissions(): Promise<{ location?: string; nearby?: string }>;
}

export const WifiHelper = registerPlugin<WifiHelperPlugin>('WifiHelper');
