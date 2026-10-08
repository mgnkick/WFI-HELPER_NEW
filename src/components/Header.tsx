import React from 'react';
import {
  Gauge,
  Radio,
  FileText,
  BookOpen,
  Lightbulb,
  Heart,
  Sun,
  Moon,
  WifiOff,
  Router
} from 'lucide-react';
import { CurrentWifiMetrics } from '../types/wifi';
import { useTheme } from '../context/ThemeContext';

export type ActiveTab = 'speedtest' | 'analyzer' | 'recommendations' | 'yandex' | 'report' | 'knowledge';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentWifi: CurrentWifiMetrics;
  onOpenDonate?: () => void;
  onOpenWifiSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  currentWifi,
  onOpenDonate,
  onOpenWifiSettings
}) => {
  const { isDark, toggleTheme } = useTheme();

  // Открытие веб-интерфейса настройки роутера по адресу основного шлюза
  const isWifiActive = !!currentWifi.wifiConnected;
  const routerGatewayIp = (currentWifi.gateway && currentWifi.gateway !== '0.0.0.0')
    ? currentWifi.gateway
    : '192.168.1.1';

  const handleOpenRouterSettings = () => {
    if (!isWifiActive) return;
    const url = `http://${routerGatewayIp}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors w-full pt-[max(env(safe-area-inset-top,0px),14px)] sm:pt-4 ${
      isDark
        ? 'bg-zinc-900/95 border-b border-zinc-800 text-zinc-100'
        : 'bg-white/95 border-b border-zinc-200 text-zinc-900 shadow-sm'
    }`}>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 pt-1 sm:pt-1.5 pb-2 sm:pb-2.5 transition-all">
        {/* Верхняя строка: Логотип, текущий статус сети и переключатель темы */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 pt-1">
          {/* Бренд */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 landscape:w-7 landscape:h-7 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
              isDark
                ? 'bg-zinc-800 border border-white text-white shadow-md'
                : 'bg-zinc-900 border border-zinc-900 text-white shadow-md'
            }`}>
              <Gauge className="w-4 h-4 sm:w-5 sm:h-5 landscape:w-3.5 landscape:h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`font-black text-sm sm:text-base tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Wi-Fi Эксперт
                </span>
                <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase px-1 sm:px-1.5 py-0.5 rounded border ${
                  isDark
                    ? 'border-white/60 text-white bg-white/10'
                    : 'border-zinc-900/60 text-zinc-900 bg-zinc-900/10'
                }`}>
                  PRO
                </span>
              </div>
              <span className={`text-[10px] sm:text-[11px] block -mt-0.5 font-mono hidden xs:block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Анализатор радиоэфира
              </span>
            </div>
          </div>

          {/* Правая панель: Текущий Wi-Fi статус, роутер и переключатель темы (никогда не вылезает за пределы) */}
          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs flex-shrink-0 min-w-0">
            {/* Wi-Fi статус: ясно показываем статус или отсутствие подключения */}
            {!currentWifi.wifiConnected ? (
              <button
                type="button"
                onClick={onOpenWifiSettings}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-1.5 border transition-all cursor-pointer flex-shrink-0 whitespace-nowrap ${
                  isDark
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-950/60'
                    : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-sm'
                }`}
                title="Wi‑Fi не подключен. Нажмите, чтобы открыть системные настройки Wi‑Fi"
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="font-bold text-[11px] sm:text-xs">
                  Wi‑Fi не подключен
                </span>
                <span className="hidden sm:inline text-[10px] opacity-75 underline">
                  Подключить
                </span>
              </button>
            ) : (
              <div className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl flex items-center gap-1.5 border transition-colors flex-shrink min-w-0 ${
                isDark
                  ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700'
              }`}>
                <Radio className={`w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse flex-shrink-0 ${isDark ? 'text-white' : 'text-zinc-900'}`} />
                <span
                  className={`font-bold max-w-[70px] xs:max-w-[110px] sm:max-w-[160px] md:max-w-[220px] truncate text-[11px] sm:text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}
                  title={currentWifi.ssid}
                >
                  {currentWifi.ssid || 'Wi-Fi'}
                </span>
                <span className={`text-[10px] sm:text-[11px] font-semibold hidden xs:inline flex-shrink-0 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {currentWifi.band}
                </span>
                <span className={`hidden sm:inline text-[10px] sm:text-[11px] flex-shrink-0 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {currentWifi.rssi} дБм
                </span>
              </div>
            )}

            {/* Кнопка "Настройка роутера" (слева от кнопки переключения темы, активна если Wi-Fi подключен) */}
            <button
              type="button"
              onClick={handleOpenRouterSettings}
              disabled={!isWifiActive}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 whitespace-nowrap ${
                isWifiActive
                  ? isDark
                    ? 'border border-cyan-400/80 bg-cyan-950/30 text-cyan-200 hover:bg-cyan-900/40 active:scale-95 cursor-pointer shadow-sm'
                    : 'border border-cyan-700 bg-cyan-50 text-cyan-950 hover:bg-cyan-100 active:scale-95 cursor-pointer shadow-sm'
                  : isDark
                    ? 'border border-zinc-800 text-zinc-600 bg-zinc-900/50 cursor-not-allowed opacity-50'
                    : 'border border-zinc-200 text-zinc-400 bg-zinc-100/60 cursor-not-allowed opacity-50'
              }`}
              title={
                isWifiActive
                  ? `Открыть страницу настройки роутера в браузере (шлюз: ${routerGatewayIp})`
                  : 'Настройка роутера недоступна: устройство не подключено к Wi‑Fi'
              }
              aria-label="Настройка роутера"
            >
              <Router className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden md:inline whitespace-nowrap font-sans">
                Роутер
              </span>
            </button>

            {/* Переключатель светлой/тёмной темы */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex-shrink-0 whitespace-nowrap ${
                isDark
                  ? 'border border-white text-white hover:bg-white/10 active:scale-95'
                  : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10 active:scale-95'
              }`}
              title={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
              aria-label="Переключить тему оформления"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-white flex-shrink-0" />
                  <span className="hidden md:inline font-sans whitespace-nowrap">Светлая</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-900 flex-shrink-0" />
                  <span className="hidden md:inline font-sans whitespace-nowrap">Тёмная</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Навигационные вкладки: Анализатор -> Замер скорости -> Рекомендации -> Отчет -> Справочник */}
        <nav className="flex items-center gap-1 sm:gap-2 mt-2 landscape:mt-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none w-full scroll-menu-x">
          {/* 1. Анализатор */}
          <button
            onClick={() => onTabChange('analyzer')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 landscape:py-1 landscape:px-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer text-xs ${
              activeTab === 'analyzer'
                ? isDark
                  ? 'bg-white text-zinc-950 font-bold border border-white shadow-md'
                  : 'bg-zinc-900 text-white font-bold border border-zinc-900 shadow-md'
                : isDark
                  ? 'border border-white text-white hover:bg-white/10'
                  : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Анализатор</span>
          </button>

          {/* 2. Замер скорости */}
          <button
            onClick={() => onTabChange('speedtest')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 landscape:py-1 landscape:px-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer text-xs ${
              activeTab === 'speedtest'
                ? isDark
                  ? 'bg-white text-zinc-950 font-bold border border-white shadow-md'
                  : 'bg-zinc-900 text-white font-bold border border-zinc-900 shadow-md'
                : isDark
                  ? 'border border-white text-white hover:bg-white/10'
                  : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Замер скорости</span>
          </button>

          {/* 3. Рекомендации */}
          <button
            onClick={() => onTabChange('recommendations')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 landscape:py-1 landscape:px-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer text-xs ${
              activeTab === 'recommendations'
                ? isDark
                  ? 'bg-white text-zinc-950 font-bold border border-white shadow-md'
                  : 'bg-zinc-900 text-white font-bold border border-zinc-900 shadow-md'
                : isDark
                  ? 'border border-white text-white hover:bg-white/10'
                  : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Рекомендации</span>
          </button>

          {/* 4. Отчет */}
          <button
            onClick={() => onTabChange('report')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 landscape:py-1 landscape:px-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer text-xs ${
              activeTab === 'report'
                ? isDark
                  ? 'bg-white text-zinc-950 font-bold border border-white shadow-md'
                  : 'bg-zinc-900 text-white font-bold border border-zinc-900 shadow-md'
                : isDark
                  ? 'border border-white text-white hover:bg-white/10'
                  : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Отчет</span>
          </button>

          {/* 5. Справочник */}
          <button
            onClick={() => onTabChange('knowledge')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 landscape:py-1 landscape:px-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer text-xs ${
              activeTab === 'knowledge'
                ? isDark
                  ? 'bg-white text-zinc-950 font-bold border border-white shadow-md'
                  : 'bg-zinc-900 text-white font-bold border border-zinc-900 shadow-md'
                : isDark
                  ? 'border border-white text-white hover:bg-white/10'
                  : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Справочник</span>
          </button>

          {/* Разделитель */}
          <div className={`h-4 w-px my-auto mx-0.5 shrink-0 ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`} />

          {/* Кнопка для доната на карту Сбербанка */}
          <button
            onClick={onOpenDonate}
            title="Поддержать автора (Сбербанк: 5336 6903 0435 1846)"
            className={`flex items-center gap-1 px-2.5 py-1.5 landscape:py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm ${
              isDark
                ? 'border border-white text-white hover:bg-white/15 active:scale-95'
                : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10 active:scale-95'
            }`}
          >
            <Heart className={`w-3 h-3 ${isDark ? 'fill-white/30 text-white' : 'fill-zinc-900/30 text-zinc-900'}`} />
            <span>Донат</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
