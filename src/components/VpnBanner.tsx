import React from 'react';
import { ShieldAlert, Settings } from 'lucide-react';
import { VpnStatus } from '../types/wifi';
import { WifiHelper } from '../plugins/wifiHelper';
import { Capacitor } from '@capacitor/core';

interface VpnBannerProps {
  vpn: VpnStatus;
  onOpenSettings?: () => void;
}

export const VpnBanner: React.FC<VpnBannerProps> = ({ vpn, onOpenSettings }) => {
  // Если VPN не активен — ничего лишнего не отображаем
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
    <div className="rounded-2xl border-2 border-red-500/60 bg-red-950/40 p-4 sm:p-5 text-white shadow-[0_0_25px_rgba(239,68,68,0.25)] animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500/20 text-red-400 border border-red-500/40">
            <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-extrabold text-red-400">
                Обнаружен подключенный интерфейс VPN!
              </span>
              <span className="text-xs bg-red-500 text-slate-950 font-bold px-2 py-0.5 rounded-full font-mono">
                {vpn.interfaceName || 'tun0'}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-200 mt-1 max-w-2xl leading-relaxed">
              Внимание: активный VPN искажает замер скорости, завышает пинг и направляет трафик в обход Wi-Fi шлюза. Для честной диагностики сети отключите VPN в настройках.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenVpn}
          className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>Открыть настройки VPN</span>
        </button>
      </div>
    </div>
  );
};
