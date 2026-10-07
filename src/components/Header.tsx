import React from 'react';
import {
  Gauge,
  Radio,
  ExternalLink,
  FileText,
  BookOpen,
  Code2,
  Download,
  ShieldAlert,
  ShieldCheck,
  Lightbulb
} from 'lucide-react';
import { CurrentWifiMetrics } from '../types/wifi';
import { SCENARIO_PROFILES } from '../data/mockScenarios';

export type ActiveTab = 'speedtest' | 'analyzer' | 'recommendations' | 'yandex' | 'report' | 'knowledge' | 'code';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentWifi: CurrentWifiMetrics;
  selectedScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  onToggleVpnMock: () => void;
  onDownloadZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  currentWifi,
  selectedScenarioId,
  onSelectScenario,
  onToggleVpnMock,
  onDownloadZip
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Верхняя строка: Логотип, селектор сценариев, VPN и кнопка APK */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Бренд */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950">
                <Gauge className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-base tracking-tight">
                    WiFi-Helper
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block -mt-0.5 font-mono">
                  Анализатор, скорость и рекомендации
                </span>
              </div>
            </div>

            {/* Мобильная плашка VPN */}
            <div className="sm:hidden">
              <button
                onClick={onToggleVpnMock}
                className={`text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border ${
                  currentWifi.vpn.isActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {currentWifi.vpn.isActive ? 'ВПН: ВКЛ ⚠️' : 'ВПН: ВЫКЛ ✅'}
              </button>
            </div>
          </div>

          {/* Правая панель: Сценарий, VPN статус, кнопка ZIP */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {/* Выбор сценария */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-[11px] text-slate-400 hidden md:inline">Сценарий:</span>
              <select
                value={selectedScenarioId}
                onChange={e => onSelectScenario(e.target.value)}
                className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                {SCENARIO_PROFILES.map(sc => (
                  <option key={sc.id} value={sc.id} className="bg-slate-900 text-white">
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Десктопный тумблер VPN */}
            <button
              onClick={onToggleVpnMock}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                currentWifi.vpn.isActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
              title="Переключить состояние ВПН (для проверки ограничений скорости)"
            >
              {currentWifi.vpn.isActive ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>ВПН ВКЛЮЧЕН ⚠️</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ВПН ВЫКЛЮЧЕН ✅</span>
                </>
              )}
            </button>

            {/* Скачать Android проект */}
            <button
              onClick={onDownloadZip}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать .APK / Проект</span>
            </button>
          </div>
        </div>

        {/* Навигационные вкладки */}
        <nav className="flex items-center gap-1 sm:gap-2 mt-3 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => onTabChange('speedtest')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'speedtest'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Замер скорости</span>
          </button>

          <button
            onClick={() => onTabChange('analyzer')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'analyzer'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Анализатор</span>
          </button>

          <button
            onClick={() => onTabChange('recommendations')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'recommendations'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Рекомендации</span>
          </button>

          <button
            onClick={() => onTabChange('report')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'report'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Отчет для провайдера</span>
          </button>

          <button
            onClick={() => onTabChange('knowledge')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'knowledge'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Справочник (Простыми словами)</span>
          </button>

          <button
            onClick={() => onTabChange('code')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Код & Сборка APK</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
