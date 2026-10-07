import React, { useMemo, useState } from 'react';
import {
  Radio,
  Signal,
  HelpCircle,
  Cpu,
  BarChart3,
  Gauge,
  ChevronDown,
  RefreshCw,
  Layers,
  Copy,
  Check,
  Search,
  Filter,
  Info
} from 'lucide-react';
import { CurrentWifiMetrics, AccessPoint } from '../types/wifi';
import { SignalValue } from './SignalValue';
import {
  signalBadgeClass,
  signalBarClass,
  signalLabel,
  signalSvgFill,
  signalTextClass,
  rssiToPercent
} from '../utils/signalQuality';

interface WifiAnalyzerViewProps {
  wifi: CurrentWifiMetrics;
  visibleAps: AccessPoint[];
  onOpenTerm: (termId: string) => void;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
}

interface SsidGroup {
  ssid: string;
  devices: AccessPoint[];
  deviceCount: number;
  hasMultipleDevices: boolean;
  isCurrent: boolean;
  bestRssi: number;
  worstRssi: number;
  bands: string[];
  channels: number[];
  standards: string[];
  securityList: string[];
}

export const WifiAnalyzerView: React.FC<WifiAnalyzerViewProps> = ({
  wifi,
  visibleAps,
  onOpenTerm,
  lastUpdated,
  onRefresh
}) => {
  // Выбор диапазона для графического спектрального анализатора
  const [selectedBandTab, setSelectedBandTab] = useState<'2.4GHz' | '5GHz'>(
    wifi.band.includes('2.4') ? '2.4GHz' : '5GHz'
  );

  // Настройки списка сетей
  const [listBandFilter, setListBandFilter] = useState<'all' | '2.4GHz' | '5GHz'>('all');
  const [groupBySsid, setGroupBySsid] = useState<boolean>(true);
  const [onlyMultiDevice, setOnlyMultiDevice] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSsids, setExpandedSsids] = useState<Record<string, boolean>>({
    [wifi.ssid]: true
  });
  const [expandedBssids, setExpandedBssids] = useState<Record<string, boolean>>({});
  const [copiedBssid, setCopiedBssid] = useState<string | null>(null);

  // Копирование BSSID в буфер
  const handleCopyBssid = (bssid: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(bssid);
      setCopiedBssid(bssid);
      setTimeout(() => setCopiedBssid(null), 2000);
    }
  };

  // Точки для спектрального графика
  const spectrumAps = useMemo(() => {
    return visibleAps
      .filter(ap => ap.band === selectedBandTab)
      .slice()
      .sort((a, b) => (a.ssid || '').localeCompare(b.ssid || '', 'ru', { sensitivity: 'base', numeric: true }));
  }, [visibleAps, selectedBandTab]);

  // Фильтрация точек доступа для списка
  const filteredListAps = useMemo(() => {
    return visibleAps.filter(ap => {
      if (listBandFilter !== 'all' && ap.band !== listBandFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSsid = (ap.ssid || '').toLowerCase().includes(query);
        const matchesBssid = (ap.bssid || '').toLowerCase().includes(query);
        if (!matchesSsid && !matchesBssid) {
          return false;
        }
      }
      return true;
    });
  }, [visibleAps, listBandFilter, searchQuery]);

  // Группировка точек доступа по одинаковому имени сети (SSID)
  const ssidGroups = useMemo<SsidGroup[]>(() => {
    const map = new Map<string, AccessPoint[]>();

    for (const ap of filteredListAps) {
      const key = ap.ssid || 'Скрытая сеть';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(ap);
    }

    const groups: SsidGroup[] = [];

    map.forEach((devices, ssid) => {
      // Сортируем физические устройства внутри группы: текущее первое, затем по убыванию силы сигнала
      devices.sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        return b.rssi - a.rssi;
      });

      const deviceCount = devices.length;
      const hasMultipleDevices = deviceCount > 1;
      const isCurrent = devices.some(d => d.isCurrent || (wifi.bssid && d.bssid.toLowerCase() === wifi.bssid.toLowerCase()));
      const bestRssi = Math.max(...devices.map(d => d.rssi));
      const worstRssi = Math.min(...devices.map(d => d.rssi));
      const bands = Array.from(new Set(devices.map(d => d.band)));
      const channels = Array.from(new Set(devices.map(d => d.channel))).sort((a, b) => a - b);
      const standards = Array.from(new Set(devices.map(d => d.standard)));
      const securityList = Array.from(new Set(devices.map(d => d.security)));

      groups.push({
        ssid,
        devices,
        deviceCount,
        hasMultipleDevices,
        isCurrent,
        bestRssi,
        worstRssi,
        bands,
        channels,
        standards,
        securityList
      });
    });

    // Фильтр только сетей с несколькими устройствами
    let result = groups;
    if (onlyMultiDevice) {
      result = result.filter(g => g.hasMultipleDevices);
    }

    // Сортировка групп: активная сеть в начале, затем сети с несколькими устройствами, затем по силе сигнала
    result.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      if (a.hasMultipleDevices && !b.hasMultipleDevices) return -1;
      if (!a.hasMultipleDevices && b.hasMultipleDevices) return 1;
      return b.bestRssi - a.bestRssi;
    });

    return result;
  }, [filteredListAps, wifi.bssid, onlyMultiDevice]);

  // Подсчёт общего количества многоточечных сетей
  const multiDeviceCountTotal = useMemo(() => {
    const map = new Map<string, number>();
    for (const ap of visibleAps) {
      const key = ap.ssid || 'Скрытая сеть';
      map.set(key, (map.get(key) || 0) + 1);
    }
    let count = 0;
    map.forEach(num => {
      if (num > 1) count++;
    });
    return count;
  }, [visibleAps]);

  // Переключение состояния раскрытия группы
  const toggleSsidGroup = (ssid: string) => {
    setExpandedSsids(prev => ({
      ...prev,
      [ssid]: !prev[ssid]
    }));
  };

  const expandAllGroups = () => {
    const next: Record<string, boolean> = {};
    ssidGroups.forEach(g => {
      next[g.ssid] = true;
    });
    setExpandedSsids(next);
  };

  const collapseAllGroups = () => {
    setExpandedSsids({});
  };

  return (
    <div className="space-y-6">
      {/* Статус автообновления и кнопка ручного обновления */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
        <span className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Фоновое автообновление сетей раз в 6 секунд</span>
        </span>
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Обновить вручную</span>
            </button>
          )}
          {lastUpdated && (
            <span className="font-mono text-slate-400 text-[11px]">
              Обновлено: {lastUpdated.toLocaleTimeString('ru-RU')}
            </span>
          )}
        </div>
      </div>

      {/* Верхние 4 карточки параметров текущей сети */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 relative group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Signal className="w-4 h-4 text-cyan-400" />
              <span>МОЩНОСТЬ (RSSI)</span>
            </span>
            <button
              onClick={() => onOpenTerm('rssi')}
              className="text-slate-500 hover:text-cyan-400 transition-colors"
              title="Что такое RSSI простыми словами?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black font-mono ${signalTextClass(wifi.rssi)}`}>{wifi.rssi}</span>
            <span className="text-sm font-semibold text-slate-400">дБм</span>
            <span className={`text-xs font-mono ml-auto ${signalTextClass(wifi.rssi)}`}>({wifi.signalPercent}%)</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 my-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${signalBarClass(wifi.rssi)}`}
              style={{ width: `${wifi.signalPercent}%` }}
            />
          </div>

          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border inline-block ${signalBadgeClass(wifi.rssi)}`}>
            {signalLabel(wifi.rssi)}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 relative group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="w-4 h-4 text-purple-400" />
              <span>СКОРОСТЬ ЛИНКА</span>
            </span>
            <button
              onClick={() => onOpenTerm('link_speed')}
              className="text-slate-500 hover:text-cyan-400 transition-colors"
              title="Что такое Link Speed?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{wifi.linkSpeedTxMbps}</span>
            <span className="text-sm font-semibold text-slate-400">Мбит/с</span>
          </div>

          <div className="text-xs text-slate-400 mt-2 font-mono flex justify-between">
            <span>Tx (Передача): {wifi.linkSpeedTxMbps} Мб/с</span>
            <span>Rx (Прием): {wifi.linkSpeedRxMbps} Мб/с</span>
          </div>

          <p className="text-[10px] text-slate-500 mt-2">
            Теоретический предел радиоканала
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 relative group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>ДИАПАЗОН И КАНАЛ</span>
            </span>
            <button
              onClick={() => onOpenTerm('bands_24_5')}
              className="text-slate-500 hover:text-cyan-400 transition-colors"
              title="2.4 vs 5 ГГц"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{wifi.channel}</span>
            <span className="text-sm font-semibold text-cyan-400">канал</span>
            <span className="text-xs text-slate-400 font-mono ml-auto">({wifi.frequency} МГц)</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-white font-bold border border-slate-700">
              {wifi.band}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
              {wifi.channelWidth}
            </span>
          </div>

          <p className="text-[10px] text-slate-500 mt-2">
            Полоса пропускания радиоэфира
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 relative group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>ПОКОЛЕНИЕ WI-FI</span>
            </span>
            <button
              onClick={() => onOpenTerm('channel_width')}
              className="text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="text-2xl font-black text-white font-mono">
            {wifi.standard}
          </div>

          <div className="text-xs text-slate-400 mt-2 flex justify-between font-mono">
            <span>Шум: {wifi.noiseEstimateDbm} дБм</span>
            <span className="text-emerald-400 font-bold">SNR: {wifi.snrDb} дБ</span>
          </div>

          <p className="text-[10px] text-slate-500 mt-2">
            {wifi.coChannelApCount > 0
              ? `⚠️ На канале ${wifi.channel} еще ${wifi.coChannelApCount} сетей`
              : '✅ Канал свободен от помех'}
          </p>
        </div>
      </div>

      {/* Спектральный анализатор радиоэфира */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Спектральный анализатор радиоэфира</h3>
              <button
                onClick={() => onOpenTerm('channel_width')}
                className="text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Наглядное распределение точек доступа по частотным каналам и перекрытие сигналов
            </p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedBandTab('2.4GHz')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedBandTab === '2.4GHz'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2.4 ГГц (Каналы 1–13)
            </button>
            <button
              onClick={() => setSelectedBandTab('5GHz')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedBandTab === '5GHz'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              5 ГГц (Каналы 36–165)
            </button>
          </div>
        </div>

        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 overflow-x-auto">
          <div className="min-w-[640px] h-64 relative flex flex-col justify-between">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
              {[-30, -50, -70, -90].map(level => (
                <div key={level} className="border-b border-slate-700 w-full flex items-center justify-between text-[10px] text-slate-400 pr-2">
                  <span>{level} дБм</span>
                </div>
              ))}
            </div>

            <svg className="w-full h-48 mt-4 overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="currentApGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="neighborApGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {selectedBandTab === '2.4GHz' ? (
                <>
                  {spectrumAps.map((ap, idx) => {
                    const chIndex = Math.max(1, Math.min(13, ap.channel));
                    const centerX = (chIndex / 14) * 580 + 10;
                    const widthPx = ap.channelWidth.includes('40') ? 130 : 75;
                    const peakY = 150 - ((ap.rssi + 100) / 70) * 130;
                    const pLeft = centerX - widthPx / 2;
                    const pRight = centerX + widthPx / 2;
                    const pathD = `M ${pLeft} 150 Q ${centerX} ${peakY} ${pRight} 150 Z`;

                    return (
                      <g key={ap.bssid || idx}>
                        <path
                          d={pathD}
                          fill={ap.isCurrent ? 'url(#currentApGrad)' : 'url(#neighborApGrad)'}
                          stroke={ap.isCurrent ? '#00f2fe' : '#f59e0b'}
                          strokeWidth={ap.isCurrent ? '2.5' : '1.5'}
                        />
                        <text
                          x={centerX}
                          y={peakY - 6}
                          fill={signalSvgFill(ap.rssi)}
                          fontSize="10"
                          fontWeight={ap.isCurrent ? 'bold' : 'normal'}
                          textAnchor="middle"
                        >
                          {ap.ssid} ({ap.rssi} dBm)
                        </text>
                      </g>
                    );
                  })}
                </>
              ) : (
                <>
                  {spectrumAps.map((ap, idx) => {
                    const channelPosMap: Record<number, number> = {
                      36: 80,
                      40: 130,
                      44: 180,
                      48: 230,
                      52: 290,
                      100: 420,
                      149: 530
                    };
                    const centerX = channelPosMap[ap.channel] || (idx * 90 + 90);
                    const widthPx = 80;
                    const peakY = 150 - ((ap.rssi + 100) / 70) * 130;
                    const pLeft = centerX - widthPx / 2;
                    const pRight = centerX + widthPx / 2;
                    const pathD = `M ${pLeft} 150 Q ${centerX} ${peakY} ${pRight} 150 Z`;

                    return (
                      <g key={ap.bssid || idx}>
                        <path
                          d={pathD}
                          fill={ap.isCurrent ? 'url(#currentApGrad)' : 'url(#neighborApGrad)'}
                          stroke={ap.isCurrent ? '#00f2fe' : '#f59e0b'}
                          strokeWidth={ap.isCurrent ? '2.5' : '1.5'}
                        />
                        <text
                          x={centerX}
                          y={peakY - 6}
                          fill={signalSvgFill(ap.rssi)}
                          fontSize="10"
                          fontWeight={ap.isCurrent ? 'bold' : 'normal'}
                          textAnchor="middle"
                        >
                          {ap.ssid} ({ap.rssi} dBm)
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>

            <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              {selectedBandTab === '2.4GHz' ? (
                <>
                  <span className="text-cyan-400 font-bold">Ch 1 (2412)</span>
                  <span>Ch 3</span>
                  <span className="text-cyan-400 font-bold">Ch 6 (2437)</span>
                  <span>Ch 9</span>
                  <span className="text-cyan-400 font-bold">Ch 11 (2462)</span>
                  <span>Ch 13</span>
                </>
              ) : (
                <>
                  <span className="text-cyan-400 font-bold">Ch 36 (5180)</span>
                  <span>Ch 40</span>
                  <span>Ch 44</span>
                  <span>Ch 48</span>
                  <span>Ch 52 (DFS)</span>
                  <span>Ch 100</span>
                  <span>Ch 149</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* РАЗДЕЛ СПИСКА СЕТЕЙ С ГРУППИРОВКОЙ ПО ОДИНАКОВОМУ SSID   */}
        {/* ======================================================== */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          {/* Панель управления и фильтрации */}
          <div className="flex flex-col gap-4 mb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    <span>Сети в эфире</span>
                  </h4>
                  <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                    {groupBySsid ? `${ssidGroups.length} имен сетей` : `${filteredListAps.length} точек доступа`}
                  </span>
                  {multiDeviceCountTotal > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      <Layers className="w-3 h-3 text-amber-400" />
                      {multiDeviceCountTotal} {multiDeviceCountTotal === 1 ? 'сеть' : 'сетей'} с несколькими устройствами
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Группировка объединяет точки с одинаковым именем (SSID), позволяя отличить Mesh-узлы, роутеры и репитеры по их аппаратным BSSID.
                </p>
              </div>

              {/* Кнопки переключения режима отображения */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setGroupBySsid(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      groupBySsid
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Группировать сети с одинаковым именем SSID"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>По имени (SSID)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupBySsid(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      !groupBySsid
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Показать каждую точку доступа BSSID отдельно"
                  >
                    <span>Все точки (BSSID)</span>
                  </button>
                </div>

                {groupBySsid && (
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      onClick={expandAllGroups}
                      className="px-2 py-1 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Развернуть все группы сетей"
                    >
                      Развернуть все
                    </button>
                    <span className="text-slate-600">/</span>
                    <button
                      onClick={collapseAllGroups}
                      className="px-2 py-1 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Свернуть все группы"
                    >
                      Свернуть
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Фильтры и строка поиска */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  Диапазон:
                </span>
                <button
                  type="button"
                  onClick={() => setListBandFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    listBandFilter === 'all'
                      ? 'bg-slate-800 text-white border border-slate-600'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Все (2.4 + 5G)
                </button>
                <button
                  type="button"
                  onClick={() => setListBandFilter('2.4GHz')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    listBandFilter === '2.4GHz'
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Только 2.4 ГГц
                </button>
                <button
                  type="button"
                  onClick={() => setListBandFilter('5GHz')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    listBandFilter === '5GHz'
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Только 5 ГГц
                </button>

                {/* Быстрый фильтр только многоточечных сетей */}
                <button
                  type="button"
                  onClick={() => setOnlyMultiDevice(!onlyMultiDevice)}
                  className={`ml-1 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                    onlyMultiDevice
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title="Показать только сети, которые раздаются 2 или более устройствами"
                >
                  <Layers className={`w-3.5 h-3.5 ${onlyMultiDevice ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>Только 2+ устройства (Mesh/Репитеры)</span>
                </button>
              </div>

              {/* Поиск по SSID / BSSID */}
              <div className="relative min-w-[200px] sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск по SSID или BSSID..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Информационная подсказка об одноименных сетях */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3.5 mb-4 text-xs text-slate-300 flex items-start gap-3">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-200">
                Как понять, что сеть раздают разные устройства?
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Если у сети стоит плашка <span className="text-amber-300 font-semibold">«Одноименная сеть: X разных устройства»</span>, значит несколько физических передатчиков (с разными MAC-адресами BSSID) вещают одно и то же имя Wi-Fi. Это может быть <strong>Mesh-система</strong> (роутер + узел), <strong>роутер и репитер</strong> или <strong>двухдиапазонная точка</strong> (2.4 + 5 ГГц). Внутри группы вы можете сравнить сигнал каждого передатчика и увидеть, к какому именно подключен ваш телефон.
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* ВАРИАНТ 1: ОТОБРАЖЕНИЕ С ГРУППИРОВКОЙ ПО SSID (ПО УМОЛЧАНИЮ) */}
          {/* ======================================================== */}
          {groupBySsid ? (
            <div className="space-y-3">
              {ssidGroups.length === 0 && (
                <div className="text-xs text-slate-500 p-6 border border-dashed border-slate-800 rounded-2xl text-center">
                  {onlyMultiDevice
                    ? 'Нет сетей, вещаемых несколькими устройствами одновременно при выбранных фильтрах.'
                    : 'В этом диапазоне сетей не найдено. Подождите автообновление (5 сек) или измените параметры поиска.'}
                </div>
              )}

              {ssidGroups.map(group => {
                const isOpen = !!expandedSsids[group.ssid];

                return (
                  <div
                    key={group.ssid}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      group.isCurrent
                        ? 'border-cyan-500/40 bg-slate-900/90 shadow-lg shadow-cyan-950/20'
                        : group.hasMultipleDevices
                        ? 'border-amber-500/30 bg-slate-900/70 hover:border-amber-500/50'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    {/* Заголовок группы сетей */}
                    <button
                      type="button"
                      onClick={() => toggleSsidGroup(group.ssid)}
                      title="Нажмите, чтобы развернуть устройства этой сети"
                      className="w-full text-left px-4 py-3.5 flex items-center gap-3.5 hover:bg-slate-800/40 transition-colors"
                    >
                      <ChevronDown
                        className={`w-5 h-5 flex-shrink-0 text-cyan-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {group.isCurrent && (
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
                          )}
                          <span className="font-bold text-white text-sm sm:text-base truncate">
                            {group.ssid}
                          </span>

                          {/* Признак текущей сети */}
                          {group.isCurrent && (
                            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-semibold">
                              Ваша активная сеть
                            </span>
                          )}

                          {/* КЛЮЧЕВОЙ ПРИЗНАК: Одноименная сеть с несколькими физическими устройствами */}
                          {group.hasMultipleDevices ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/35 shadow-sm">
                              <Layers className="w-3.5 h-3.5 text-amber-400" />
                              <span>Одноименная сеть: {group.deviceCount} разных устройства (BSSID)</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
                              1 физ. точка
                            </span>
                          )}
                        </div>

                        {/* Краткая сводка по диапазонам и каналам */}
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1 flex-wrap">
                          <span>
                            Диапазоны: <strong className="text-slate-200">{group.bands.join(' + ')}</strong>
                          </span>
                          <span>·</span>
                          <span>
                            Каналы: <strong className="text-cyan-300">{group.channels.join(', ')}</strong>
                          </span>
                          {group.hasMultipleDevices && (
                            <>
                              <span>·</span>
                              <span className="text-slate-400">
                                Разброс: от {group.bestRssi} до {group.worstRssi} дБм
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Лучший сигнал группы */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] text-slate-400 block font-mono">Лучший сигнал</span>
                          <SignalValue rssi={group.bestRssi} percent={rssiToPercent(group.bestRssi)} />
                        </div>
                        <div className="sm:hidden">
                          <SignalValue rssi={group.bestRssi} />
                        </div>
                      </div>
                    </button>

                    {/* Развернутый список физических устройств в группе */}
                    {isOpen && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/50 space-y-3">
                        {/* Поясняющая плашка для сетей с несколькими устройствами */}
                        {group.hasMultipleDevices && (
                          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/25 text-xs text-amber-100 flex items-start gap-3">
                            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                              <Layers className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="font-bold text-amber-300 text-xs sm:text-sm">
                                  Внимание: Обнаружено {group.deviceCount} независимых устройства с именем «{group.ssid}»
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onOpenTerm('bssid_vs_ssid')}
                                  className="text-cyan-400 hover:text-cyan-300 text-[11px] underline flex items-center gap-1 font-sans"
                                >
                                  Подробнее про BSSID vs SSID
                                  <HelpCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                                Каждое устройство имеет собственный аппаратный MAC-адрес (BSSID). Это характерно для <strong>Mesh-систем</strong> с бесшовным роумингом (802.11k/v/r), связок «роутер + репитер/усилитель» или роутеров, вещающих одну сеть в 2.4 и 5 ГГц. Сравните уровень сигнала ниже:
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Список конкретных физических устройств (точек доступа) */}
                        <div className="space-y-2.5">
                          {group.devices.map((device, dIdx) => (
                            <div
                              key={device.bssid}
                              className={`rounded-xl p-3.5 border transition-all ${
                                device.isCurrent
                                  ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                                  : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                              }`}
                            >
                              {/* Верхняя строка устройства */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                                    <Cpu className={`w-3.5 h-3.5 ${device.isCurrent ? 'text-cyan-400' : 'text-slate-400'}`} />
                                    <span>Устройство #{dIdx + 1}</span>
                                  </div>

                                  {device.isCurrent ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                      Ваше текущее подключение (активный узел)
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                                      Альтернативная точка доступа
                                    </span>
                                  )}

                                  {group.hasMultipleDevices && (
                                    <span className="text-[10px] font-mono">
                                      {device.rssi === group.bestRssi ? (
                                        <span className="text-emerald-400 font-semibold">🏆 Максимальный сигнал</span>
                                      ) : (
                                        <span className="text-amber-400/90">{device.rssi - group.bestRssi} дБм от сильнейшего</span>
                                      )}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <SignalValue rssi={device.rssi} percent={rssiToPercent(device.rssi)} />
                                </div>
                              </div>

                              {/* Технические атрибуты физического устройства */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2.5 text-xs font-mono">
                                <div>
                                  <span className="text-[10px] text-slate-500 block">BSSID (MAC-адрес):</span>
                                  <div className="flex items-center gap-1.5 text-slate-200 mt-0.5">
                                    <span className="font-semibold text-cyan-300">{device.bssid}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyBssid(device.bssid)}
                                      title="Скопировать MAC-адрес устройства"
                                      className="text-slate-400 hover:text-cyan-400 p-0.5 transition-colors"
                                    >
                                      {copiedBssid === device.bssid ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <span className="text-[10px] text-slate-500 block">Канал и частота:</span>
                                  <span className="text-slate-200 block mt-0.5 font-semibold">
                                    Канал {device.channel} ({device.frequency} МГц)
                                  </span>
                                </div>

                                <div>
                                  <span className="text-[10px] text-slate-500 block">Диапазон и полоса:</span>
                                  <span className="text-slate-200 block mt-0.5">
                                    {device.band} · {device.channelWidth}
                                  </span>
                                </div>

                                <div>
                                  <span className="text-[10px] text-slate-500 block">Стандарт и шифрование:</span>
                                  <span className="text-slate-200 block mt-0.5">
                                    {device.standard} ({device.security})
                                  </span>
                                </div>
                              </div>

                              {/* Полоса прогресса мощности сигнала */}
                              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mr-3">
                                  <div
                                    className={`h-full rounded-full ${signalBarClass(device.rssi)}`}
                                    style={{ width: `${rssiToPercent(device.rssi)}%` }}
                                  />
                                </div>
                                <span className="flex-shrink-0 font-medium font-sans">
                                  {signalLabel(device.rssi)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // ========================================================
            // ВАРИАНТ 2: ПЛОСКИЙ СПИСОК ВСЕХ ТОЧЕК (BSSID)
            // ========================================================
            <div className="space-y-2">
              {filteredListAps.length === 0 && (
                <div className="text-xs text-slate-500 p-6 border border-dashed border-slate-800 rounded-2xl text-center">
                  Точек доступа не обнаружено при заданных фильтрах.
                </div>
              )}

              {filteredListAps.map(ap => {
                const open = !!expandedBssids[ap.bssid];
                // Проверяем, есть ли другие точки с таким же SSID
                const sisterCount = visibleAps.filter(
                  other => other.ssid === ap.ssid && other.bssid !== ap.bssid
                ).length;

                return (
                  <div
                    key={ap.bssid}
                    className={`rounded-2xl border overflow-hidden transition-all ${
                      ap.isCurrent
                        ? 'border-cyan-500/40 bg-cyan-950/20'
                        : sisterCount > 0
                        ? 'border-amber-500/25 bg-slate-950/60'
                        : 'border-slate-800 bg-slate-950/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedBssids(prev => ({
                          ...prev,
                          [ap.bssid]: !prev[ap.bssid]
                        }))
                      }
                      title="Нажмите, чтобы развернуть подробности этой точки"
                      className="w-full text-left px-3.5 py-3 flex items-center gap-3 hover:bg-slate-800/40 transition-colors"
                    >
                      <ChevronDown
                        className={`w-5 h-5 flex-shrink-0 text-cyan-400 transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {ap.isCurrent && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                          <span className="font-bold text-white truncate">{ap.ssid || 'Скрытая сеть'}</span>
                          {ap.isCurrent && (
                            <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-300 font-medium">
                              Ваша сеть
                            </span>
                          )}
                          {sisterCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                              <Layers className="w-3 h-3 text-amber-400" />
                              Одноименная сеть (еще {sisterCount} устр.)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>Канал {ap.channel} · {ap.band} ({ap.frequency} МГц)</span>
                          <span>·</span>
                          <span className="text-slate-400">BSSID: {ap.bssid}</span>
                        </div>
                      </div>
                      <SignalValue rssi={ap.rssi} percent={rssiToPercent(ap.rssi)} />
                    </button>

                    {open && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span>BSSID (MAC): <strong className="text-cyan-300">{ap.bssid}</strong></span>
                          <button
                            type="button"
                            onClick={() => handleCopyBssid(ap.bssid)}
                            className="text-slate-400 hover:text-cyan-400 p-0.5"
                          >
                            {copiedBssid === ap.bssid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <div>Частота: {ap.frequency} МГц</div>
                        <div>Канал: {ap.channel} ({ap.channelWidth})</div>
                        <div>Стандарт: {ap.standard}</div>
                        <div>Защита: {ap.security}</div>
                        <div>
                          Сигнал: <SignalValue rssi={ap.rssi} percent={rssiToPercent(ap.rssi)} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
