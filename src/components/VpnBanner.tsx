import React from 'react';
import { ShieldAlert, Settings } from 'lucide-react';
import { VpnStatus } from '../types/wifi';
import { WifiHelper } from '../plugins/wifiHelper';
import { Capacitor } from '@capacitor/core';
import { useTheme } from '../context/ThemeContext';

interface VpnBannerProps {
  vpn: VpnStatus;
  onOpenSettings?: () => void;
}

export const VpnBanner: React.FC<VpnBannerProps> = ({ vpn, onOpenSettings }) => {
  const { isDark, btnOutline } = useTheme();

  if (!vpn.isActive) {
    return null;
  }

  const handleOpenVpn = async () => {
    if (onOpenSettings) {
      onOpenSettings();
      return;
    }
    if (Capacitor.isNativePlatform()) {
      try {
        await WifiHelper.openVpnSettings();
      } catch (e) {
        console.warn('Не удалось открыть настройки VPN', e);
      }
    } else {
      window.alert('В вашей операционной системе активен VPN. Пожалуйста, откройте ваш VPN-клиент или настройки сети и отключите соединение.');
    }
  };

  return (
    <div className={`rounded-2xl border-2 p-4 sm:p-5 transition-colors ${
      isDark
        ? 'border-red-500/70 bg-red-950/40 text-white shadow-[0_0_25px_rgba(239,68,68,0.25)]'
        : 'border-red-500 bg-red-50 text-red-950 shadow-md'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500/20 text-red-500 border border-red-500/40">
            <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-extrabold text-red-500">
                Обнаружен подключенный интерфейс VPN!
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono border ${
                isDark ? 'bg-red-500 text-zinc-950 border-red-400' : 'bg-red-600 text-white border-red-700'
              }`}>
                {vpn.interfaceName || 'tun0'}
              </span>
            </div>

            <p className={`text-xs sm:text-sm font-medium mt-1 max-w-2xl leading-relaxed ${
              isDark ? 'text-zinc-200' : 'text-zinc-800'
            }`}>
              Внимание: активный VPN искажает замер скорости, завышает пинг и направляет трафик в обход Wi-Fi шлюза. Для честной диагностики сети отключите VPN в настройках.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenVpn}
          className={`${btnOutline} flex-shrink-0`}
        >
          <Settings className="w-4 h-4" />
          <span>Открыть настройки VPN</span>
        </button>
      </div>
    </div>
  );
};
