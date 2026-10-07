import React from 'react';
import {
  Gauge,
  Radio,
  FileText,
  BookOpen,
  Lightbulb,
  Heart,
  Sun,
  Moon
} from 'lucide-react';
import { CurrentWifiMetrics } from '../types/wifi';
import { useTheme } from '../context/ThemeContext';

export type ActiveTab = 'speedtest' | 'analyzer' | 'recommendations' | 'yandex' | 'report' | 'knowledge';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentWifi: CurrentWifiMetrics;
  onOpenDonate?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  currentWifi,
  onOpenDonate
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors ${
      isDark
        ? 'bg-zinc-900/95 border-b border-zinc-800 text-zinc-100'
        : 'bg-white/95 border-b border-zinc-200 text-zinc-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Верхняя строка: Логотип, текущий статус сети и переключатель темы */}
        <div className="flex items-center justify-between gap-3">
          {/* Бренд */}
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
              isDark
                ? 'bg-zinc-800 border border-white text-white shadow-md'
                : 'bg-zinc-900 border border-zinc-900 text-white shadow-md'
            }`}>
              <Gauge className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-base tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Wi-Fi Эксперт
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                  isDark
                    ? 'border-white/60 text-white bg-white/10'
                    : 'border-zinc-900/60 text-zinc-900 bg-zinc-900/10'
                }`}>
                  PRO
                </span>
              </div>
              <span className={`text-[11px] block -mt-0.5 font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Анализатор радиоэфира и диагностика
              </span>
            </div>
          </div>

          {/* Правая панель: Текущий Wi-Fi статус и Переключатель темы */}
          <div className="flex items-center gap-2.5 font-mono text-xs">
            {/* Wi-Fi статус */}
            <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 border transition-colors ${
              isDark
                ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
                : 'bg-zinc-50 border-zinc-200 text-zinc-700'
            }`}>
              <Radio className={`w-3.5 h-3.5 animate-pulse ${isDark ? 'text-white' : 'text-zinc-900'}`} />
              <span className={`font-bold max-w-[120px] sm:max-w-[180px] truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {currentWifi.ssid || 'Wi-Fi'}
              </span>
              <span className={`text-[11px] font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {currentWifi.band}
              </span>
              <span className={`hidden sm:inline text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {currentWifi.rssi} дБм
              </span>
            </div>

            {/* Переключатель светлой/тёмной темы */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isDark
                  ? 'border border-white text-white hover:bg-white/10 active:scale-95'
                  : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10 active:scale-95'
              }`}
              title={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
              aria-label="Переключить тему оформления"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline font-sans">Светлая тема</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-900" />
                  <span className="hidden sm:inline font-sans">Тёмная тема</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Навигационные вкладки: Анализатор -> Замер скорости -> Рекомендации -> Отчет -> Справочник */}
        <nav className="flex items-center gap-1.5 sm:gap-2 mt-3 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          {/* 1. Анализатор */}
          <button
            onClick={() => onTabChange('analyzer')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analyzer'
                ? isDark
                  ? 'bg-white text-zinc-950 font-bold border border-white shadow-md'
                  : 'bg-zinc-900 text-white font-bold border border-zinc-900 shadow-md'
                : isDark
                  ? 'border border-white text-white hover:bg-white/10'
                  : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Анализатор</span>
          </button>

          {/* 2. Замер скорости */}
          <button
            onClick={() => onTabChange('speedtest')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'speedtest'
                ? isDark
                  ? 'bg-white text-zinc-950 font-bold border border-white shadow-md'
                  : 'bg-zinc-900 text-white font-bold border border-zinc-900 shadow-md'
                : isDark
                  ? 'border border-white text-white hover:bg-white/10'
                  : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Замер скорости</span>
          </button>

          {/* 3. Рекомендации */}
          <button
            onClick={() => onTabChange('recommendations')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'recommendations'
                ? isDark
                  ? 'bg-white text-zinc-950 font-bold border border-white shadow-md'
                  : 'bg-zinc-900 text-white font-bold border border-zinc-900 shadow-md'
                : isDark
                  ? 'border border-white text-white hover:bg-white/10'
                  : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Рекомендации</span>
          </button>

          {/* 4. Отчет */}
          <button
            onClick={() => onTabChange('report')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'report'
                ? isDark
                  ? 'bg-white text-zinc-950 font-bold border border-white shadow-md'
                  : 'bg-zinc-900 text-white font-bold border border-zinc-900 shadow-md'
                : isDark
                  ? 'border border-white text-white hover:bg-white/10'
                  : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Отчет</span>
          </button>

          {/* 5. Справочник */}
          <button
            onClick={() => onTabChange('knowledge')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'knowledge'
                ? isDark
                  ? 'bg-white text-zinc-950 font-bold border border-white shadow-md'
                  : 'bg-zinc-900 text-white font-bold border border-zinc-900 shadow-md'
                : isDark
                  ? 'border border-white text-white hover:bg-white/10'
                  : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Справочник</span>
          </button>

          {/* Разделитель */}
          <div className={`h-4 w-px my-auto mx-0.5 shrink-0 ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`} />

          {/* Кнопка для доната на карту Сбербанка */}
          <button
            onClick={onOpenDonate}
            title="Поддержать автора (Сбербанк: 5336 6903 0435 1846)"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm ${
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
