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
  // Если Wi-Fi не подключен — никаких случайных колебаний или симуляций параметров не производим
  if (!wifi.wifiConnected) {
    return wifi;
  }
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

export function createDisconnectedWifiMetrics(
  usingMobileInternet: boolean = false,
  vpnActive: boolean = false,
  vpnInterfaceName?: string,
  externalIp?: string
): CurrentWifiMetrics {
  return {
    ssid: 'Wi-Fi не подключен',
    bssid: '',
    rssi: -100,
    signalPercent: 0,
    frequency: 0,
    channel: 0,
    band: '2.4GHz',
    channelWidth: '20MHz',
    standard: '802.11n',
    linkSpeedTxMbps: 0,
    linkSpeedRxMbps: 0,
    noiseEstimateDbm: -95,
    snrDb: 0,
    coChannelApCount: 0,
    ipAddress: '',
    subnetMask: '',
    gateway: '',
    dnsServers: [],
    externalIp,
    ispName: usingMobileInternet ? 'Мобильный интернет' : undefined,
    wifiConnected: false,
    usingMobileInternet: !!usingMobileInternet,
    vpn: {
      isActive: vpnActive,
      interfaceName: vpnInterfaceName,
      warningNote: vpnActive
        ? 'ВНИМАНИЕ: В системе активен VPN!'
        : 'VPN выключен.'
    }
  };
}

export async function fetchNativeWifiSnapshot(): Promise<{
  wifiConnected: boolean;
  usingMobileInternet: boolean;
  vpnActive?: boolean;
  vpnInterfaceName?: string;
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
    const isConnected = !!snap.wifiConnected;
    return {
      wifiConnected: isConnected,
      usingMobileInternet: !!snap.usingMobileInternet,
      vpnActive: snap.vpnActive,
      vpnInterfaceName: snap.vpnInterfaceName,
      current: isConnected ? (snap.current || null) : null,
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
  aps: AccessPoint[],
  vpnActive?: boolean,
  vpnInterfaceName?: string
): CurrentWifiMetrics {
  const isVpnOn = vpnActive !== undefined ? vpnActive : prev.vpn.isActive;
  const iface = vpnInterfaceName || prev.vpn.interfaceName || 'tun0';

  // ЕСЛИ WI-FI НЕ ПОДКЛЮЧЕН — НИКАКИХ ЗАГЛУШЕК НЕ ОТОБРАЖАТЬ!
  // Полностью очищаем параметры несуществующего радиолинка.
  if (!wifiConnected) {
    return createDisconnectedWifiMetrics(
      usingMobileInternet,
      isVpnOn,
      iface,
      prev.externalIp
    );
  }

  const rssi = current?.rssi ?? (prev.rssi !== -100 ? prev.rssi : -50);
  const channel = current?.channel ?? (prev.channel > 0 ? prev.channel : 1);
  const coChannelApCount = aps.filter(ap => ap.channel === channel && !ap.isCurrent).length;

  return {
    ...prev,
    ...current,
    wifiConnected: true,
    usingMobileInternet: false,
    rssi,
    signalPercent: current?.signalPercent ?? rssiToPercent(rssi),
    coChannelApCount,
    ssid: current?.ssid || (prev.ssid !== 'Wi-Fi не подключен' && prev.ssid !== 'Не подключено' ? prev.ssid : 'Подключенная сеть'),
    vpn: {
      ...prev.vpn,
      isActive: isVpnOn,
      interfaceName: isVpnOn ? iface : undefined,
      vpnAppName: isVpnOn ? (prev.vpn.vpnAppName || 'Системный VPN') : undefined,
      warningNote: isVpnOn
        ? 'ВНИМАНИЕ: В системе активен VPN! Скорость и задержка ограничены удаленным туннелем, а не вашим интернет-провайдером!'
        : 'VPN выключен. Трафик идет напрямую к вашему провайдеру без посторонних ограничений.'
    }
  };
}
