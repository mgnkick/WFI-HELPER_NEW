import { Capacitor } from '@capacitor/core';
import { AccessPoint, CurrentWifiMetrics } from '../types/wifi';
import { WifiHelper } from '../plugins/wifiHelper';
import { rssiToPercent } from '../utils/signalQuality';

export function jitterAccessPoints(aps: AccessPoint[]): AccessPoint[] {
  return aps.map(ap => {
    const delta = Math.round(Math.random() * 4 - 2);
    const rssi = Math.max(-95, Math.min(-30, ap.rssi + delta));
    return { ...ap, rssi };
  });
}

export function jitterCurrentWifi(wifi: CurrentWifiMetrics, aps: AccessPoint[]): CurrentWifiMetrics {
  const currentAp = aps.find(ap => ap.isCurrent) || aps[0];
  const rssi = currentAp ? currentAp.rssi : Math.max(-95, Math.min(-30, wifi.rssi + Math.round(Math.random() * 4 - 2)));
  const coChannelApCount = aps.filter(ap => ap.channel === wifi.channel && !ap.isCurrent).length;
  return {
    ...wifi,
    rssi,
    signalPercent: rssiToPercent(rssi),
    snrDb: Math.max(1, rssi - wifi.noiseEstimateDbm),
    coChannelApCount
  };
}

export async function fetchNativeWifiSnapshot(): Promise<{
  wifiConnected: boolean;
  usingMobileInternet: boolean;
  current: Partial<CurrentWifiMetrics> | null;
  accessPoints: AccessPoint[];
} | null> {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    await WifiHelper.requestPermissions();
  } catch {
    // Пользователь мог отклонить запрос — всё равно пробуем снимок.
  }

  try {
    const snap = await WifiHelper.getSnapshot();
    return {
      wifiConnected: !!snap.wifiConnected,
      usingMobileInternet: !!snap.usingMobileInternet,
      current: snap.current || null,
      accessPoints: Array.isArray(snap.accessPoints) ? snap.accessPoints : []
    };
  } catch (err) {
    console.warn('Wi-Fi snapshot failed', err);
    return null;
  }
}

export function mergeNativeIntoWifi(
  prev: CurrentWifiMetrics,
  current: Partial<CurrentWifiMetrics> | null,
  wifiConnected: boolean,
  usingMobileInternet: boolean,
  aps: AccessPoint[]
): CurrentWifiMetrics {
  const rssi = current?.rssi ?? prev.rssi;
  const channel = current?.channel ?? prev.channel;
  const coChannelApCount = aps.filter(ap => ap.channel === channel && !ap.isCurrent).length;

  return {
    ...prev,
    ...current,
    vpn: prev.vpn,
    wifiConnected,
    usingMobileInternet,
    rssi,
    signalPercent: current?.signalPercent ?? rssiToPercent(rssi),
    coChannelApCount,
    ssid: wifiConnected ? (current?.ssid || prev.ssid) : 'Нет подключения Wi‑Fi'
  };
}
