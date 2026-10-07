import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Info, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { VpnStatus } from '../types/wifi';

interface VpnBannerProps {
  vpn: VpnStatus;
  onToggleVpnMock: () => void;
}

export const VpnBanner: React.FC<VpnBannerProps> = ({ vpn, onToggleVpnMock }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        vpn.isActive
          ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
          : 'bg-emerald-950/30 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
      } p-4 text-white`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              vpn.isActive
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {vpn.isActive ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Статус туннеля:
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 ${
                  vpn.isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${vpn.isActive ? 'bg-slate-950 animate-ping' : 'bg-emerald-400'}`} />
                {vpn.isActive ? 'ВПН ВКЛЮЧЕН ⚠️' : 'ВПН ВЫКЛЮЧЕН ✅'}
              </span>

              {vpn.isActive && (
                <span className="text-xs bg-slate-800/80 border border-slate-700 text-amber-200 px-2 py-0.5 rounded font-mono">
                  {vpn.interfaceName || 'Интерфейс: tun0'}
                </span>
              )}
            </div>

            <p className="text-sm font-medium text-slate-200 mt-1">
              {vpn.isActive ? (
                <span className="text-amber-300 font-semibold">
                  Скорость замера ограничена сервером VPN, а не вашим интернет-провайдером!
                </span>
              ) : (
                <span className="text-slate-300">
                  Прямое соединение с провайдером. Скорость и задержка измеряются честно.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={onToggleVpnMock}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
            title="Переключить состояние VPN для проверки поведения приложения"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{vpn.isActive ? 'Выключить VPN' : 'Включить VPN'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <span>{isExpanded ? 'Скрыть' : 'Почему это важно?'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 bg-slate-900/60 p-3.5 rounded-xl">
          <div className="flex items-start gap-2 text-amber-300 font-medium">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Как ВПН влияет на спидтест и почему абоненты часто ошибаются:</span>
          </div>
          <p className="leading-relaxed text-slate-300 pl-6">
            1. <strong>Крюк через другую страну:</strong> Ваши данные летят не на ближайший сервер провайдера в вашем городе, а за тысячи километров (например, в Амстердам или Франкфурт). Пинг возрастает в 5–15 раз.
          </p>
          <p className="leading-relaxed text-slate-300 pl-6">
            2. <strong>Узкое горло VPN-сервера:</strong> Если на сервере сидят тысячи пользователей или он бесплатный, он физически выдаст вам только 20–40 Мбит/с, даже если у вас дома оптика на 1000 Мбит/с.
          </p>
          <p className="leading-relaxed text-slate-300 pl-6">
            3. <strong>Перед обращением в техподдержку:</strong> Оператор провайдера видит входящие запросы через заграничный IP-адрес и не сможет принять заявку на низкую скорость, пока VPN не будет выключен.
          </p>
        </div>
      )}
    </div>
  );
};
