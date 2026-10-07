import React from 'react';
import {
  Gauge,
  Radio,
  FileText,
  BookOpen,
  Lightbulb,
  Heart
} from 'lucide-react';
import { CurrentWifiMetrics } from '../types/wifi';

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
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Верхняя строка: Логотип и текущий статус сети */}
        <div className="flex items-center justify-between gap-3">
          {/* Бренд */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 flex-shrink-0">
              <Gauge className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight">
                  Wi-Fi Эксперт
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5 font-mono">
                Анализатор радиоэфира и диагностика
              </span>
            </div>
          </div>

          {/* Правая панель: Текущий Wi-Fi статус */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-slate-300">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="font-bold text-white max-w-[140px] sm:max-w-[200px] truncate">
                {currentWifi.ssid || 'Wi-Fi'}
              </span>
              <span className="text-cyan-400 text-[11px]">
                {currentWifi.band}
              </span>
              <span className="text-slate-400 hidden sm:inline text-[11px]">
                {currentWifi.rssi} дБм
              </span>
            </div>
          </div>
        </div>

        {/* Навигационные вкладки: Анализатор -> Замер скорости -> Рекомендации -> Отчет -> Справочник */}
        <nav className="flex items-center gap-1 sm:gap-2 mt-3 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          {/* 1. Анализатор */}
          <button
            onClick={() => onTabChange('analyzer')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analyzer'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Справочник</span>
          </button>

          {/* Маленькая аккуратная кнопка для доната на карту Сбербанка после справочника */}
          <div className="h-4 w-px bg-slate-800 my-auto mx-0.5 shrink-0" />

          <button
            onClick={onOpenDonate}
            title="Поддержать автора (Сбербанк: 5336 6903 0435 1846)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border border-emerald-500/30 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
          >
            <Heart className="w-3 h-3 fill-emerald-400/30 text-emerald-400" />
            <span>Донат</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
