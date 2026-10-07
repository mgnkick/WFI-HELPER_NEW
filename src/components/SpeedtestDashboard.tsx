import React, { useState } from 'react';
import {
  Globe,
  Radio,
  ExternalLink,
  ChevronDown,
  PlusCircle,
  Trash2,
  History,
  ShieldAlert,
  Sparkles,
  Maximize2,
  Minimize2,
  RefreshCw,
  Lock,
  Layers,
  HelpCircle,
  Activity
} from 'lucide-react';
import { CurrentWifiMetrics, SpeedTestRun } from '../types/wifi';
import { VpnBanner } from './VpnBanner';
import { WifiAccuracyDisclaimer } from './WifiAccuracyDisclaimer';
import { SignalValue } from './SignalValue';

interface SpeedtestDashboardProps {
  wifi: CurrentWifiMetrics;
  history: SpeedTestRun[];
  onOpenTerm: (termId: string) => void;
  onSaveSpeedRun: (run: SpeedTestRun) => void;
  onClearHistory: () => void;
  onToggleVpnMock: () => void;
}

export const SpeedtestDashboard: React.FC<SpeedtestDashboardProps> = ({
  wifi,
  history,
  onOpenTerm,
  onSaveSpeedRun,
  onClearHistory,
  onToggleVpnMock
}) => {
  // Состояния аккордеонов для замерщиков (выбрал нужный - развернул - запустил замер)
  const [isYandexExpanded, setIsYandexExpanded] = useState<boolean>(true);
  const [is2ipExpanded, setIs2ipExpanded] = useState<boolean>(true);

  // Ключи перезагрузки веб-фреймов
  const [yandexFrameKey, setYandexFrameKey] = useState(0);
  const [twoIpFrameKey, setTwoIpFrameKey] = useState(0);

  // Полноэкранный/увеличенный режим
  const [yandexFullscreen, setYandexFullscreen] = useState(false);
  const [twoIpFullscreen, setTwoIpFullscreen] = useState(false);

  // Форма ручной фиксации результатов Яндекс Интернетометра
  const [showYandexForm, setShowYandexForm] = useState(false);
  const [yandexDown, setYandexDown] = useState('');
  const [yandexUp, setYandexUp] = useState('');
  const [yandexPing, setYandexPing] = useState('');
  const [yandexNote, setYandexNote] = useState('');

  // Форма ручной фиксации результатов 2IP.ru
  const [show2ipForm, setShow2ipForm] = useState(false);
  const [twoIpDown, setTwoIpDown] = useState('');
  const [twoIpUp, setTwoIpUp] = useState('');
  const [twoIpPing, setTwoIpPing] = useState('');
  const [twoIpNote, setTwoIpNote] = useState('');

  const handleSaveYandexManual = (e: React.FormEvent) => {
    e.preventDefault();
    const run: SpeedTestRun = {
      id: 'yandex-' + Date.now(),
      timestamp: new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      downloadMbps: parseFloat(yandexDown) || 0,
      uploadMbps: parseFloat(yandexUp) || 0,
      pingMs: parseFloat(yandexPing) || 0,
      jitterMs: 1.2,
      lossPercent: 1, // 1% — норма для беспроводной сети передачи данных (Wi-Fi)
      source: 'yandex',
      ispName: wifi.ispName || 'ПАО Ростелеком',
      serverLocation: 'Москва, Яндекс',
      externalIp: wifi.externalIp || '178.62.204.18',
      wifiSsid: wifi.ssid,
      wifiBssid: wifi.bssid,
      wifiBand: wifi.band,
      wifiRssi: wifi.rssi,
      vpnActive: wifi.vpn.isActive,
      vpnName: wifi.vpn.interfaceName,
      note: yandexNote || 'Замер через Яндекс Интернетометр'
    };
    onSaveSpeedRun(run);
    setShowYandexForm(false);
    setYandexDown('');
    setYandexUp('');
    setYandexPing('');
    setYandexNote('');
  };

  const handleSave2ipManual = (e: React.FormEvent) => {
    e.preventDefault();
    const run: SpeedTestRun = {
      id: '2ip-' + Date.now(),
      timestamp: new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      downloadMbps: parseFloat(twoIpDown) || 0,
      uploadMbps: parseFloat(twoIpUp) || 0,
      pingMs: parseFloat(twoIpPing) || 0,
      jitterMs: 1.5,
      lossPercent: 1, // 1% — норма для беспроводной сети передачи данных (Wi-Fi)
      source: '2ip',
      ispName: wifi.ispName || 'ПАО Ростелеком',
      serverLocation: 'Москва, 2IP.ru',
      externalIp: wifi.externalIp || '178.62.204.18',
      wifiSsid: wifi.ssid,
      wifiBssid: wifi.bssid,
      wifiBand: wifi.band,
      wifiRssi: wifi.rssi,
      vpnActive: wifi.vpn.isActive,
      vpnName: wifi.vpn.interfaceName,
      note: twoIpNote || 'Замер через 2IP.ru Скорость'
    };
    onSaveSpeedRun(run);
    setShow2ipForm(false);
    setTwoIpDown('');
    setTwoIpUp('');
    setTwoIpPing('');
    setTwoIpNote('');
  };

  return (
    <div className="space-y-6">
      {/* 1. БАННЕР VPN (ЕСЛИ ВКЛЮЧЕН) */}
      <VpnBanner vpn={wifi.vpn} onToggleVpnMock={onToggleVpnMock} />

      {/* 2. ПРЕДУПРЕЖДЕНИЕ О НЕДОСТОВЕРНОСТИ ЗАМЕРА ПО WI-FI */}
      <WifiAccuracyDisclaimer currentBand={wifi.band} />

      {/* 3. КАРТОЧКА ТЕКУЩЕЙ СЕТИ WI-FI И ПАНЕЛЬ ПЕРЕКЛЮЧЕНИЯ */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">
                  {wifi.ssid || 'Беспроводная сеть'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono border border-slate-700">
                  {wifi.band}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-1 font-mono flex-wrap">
                <span>
                  Сигнал: <SignalValue rssi={wifi.rssi} percent={wifi.signalPercent} />
                </span>
                <span>•</span>
                <span>
                  Линк: <strong className="text-slate-200">{wifi.linkSpeedTxMbps} Мбит/с</strong>
                </span>
                <span>•</span>
                <span>Канал {wifi.channel} ({wifi.channelWidth})</span>
              </div>
            </div>
          </div>

          {/* Быстрые переключатели 2 замерщиков */}
          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            <button
              onClick={() => {
                setIsYandexExpanded(true);
                setIs2ipExpanded(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isYandexExpanded && !is2ipExpanded
                  ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span>Яндекс Интернетометр</span>
            </button>

            <button
              onClick={() => {
                setIs2ipExpanded(true);
                setIsYandexExpanded(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                is2ipExpanded && !isYandexExpanded
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>2IP.ru Скорость</span>
            </button>

            <button
              onClick={() => {
                setIsYandexExpanded(true);
                setIs2ipExpanded(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                isYandexExpanded && is2ipExpanded
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
              title="Развернуть оба замерщика одновременно"
            >
              Показать оба
            </button>
          </div>
        </div>
      </div>

      {/* Памятка по потерям пинга 1-2% в беспроводных сетях */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-xs text-slate-300 flex items-start gap-3 shadow-lg">
        <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-white text-sm block">
            💡 Важно: Потери пакетов (пинг) 1–2% в беспроводной сети передачи данных допустимы и не являются проблемой
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            В отличие от проводного Ethernet-кабеля (где норма строго 0%), в радиоэфире Wi-Fi микропотери <strong>1–2% абсолютно допустимы</strong> из-за естественных микропомех, работы протокола CSMA/CA и переотражений. Они мгновенно компенсируются без прерывания видео или сайтов. Реальной проблемой для обращения в поддержку признаются только систематические потери от <strong>3–5% и выше</strong>.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. ЯНДЕКС ИНТЕРНЕТОМЕТР (ВСТРОЕННЫЙ ИНТЕРФЕЙС)          */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-red-950/20 via-slate-900 to-slate-900 border border-red-500/35 rounded-3xl shadow-xl overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsYandexExpanded(!isYandexExpanded)}
          className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors border-b border-slate-800/60"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">
                  1. Яндекс Интернетометр (yandex.ru/internet)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-mono">
                  Официальный измеритель Рунета
                </span>
                <span className="text-xs text-emerald-400 font-mono">
                  ● Встроен прямо в интерфейс
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Замер входящей и исходящей скорости, пинга и параметров сети через сервера Яндекса
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              {isYandexExpanded ? 'Свернуть' : 'Развернуть'}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-red-400 transition-transform duration-200 ${
                isYandexExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Тело Яндекс Интернетометра */}
        <div className={`p-6 space-y-4 ${isYandexExpanded ? 'block' : 'hidden'}`}>
          {/* Панель управления встроенным WebView окном */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Адрес:</span>
              <span className="text-white font-semibold">https://yandex.ru/internet</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full ml-1">
                SSL Защищено
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setYandexFrameKey(k => k + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Перезагрузить встроенный фрейм Яндекс"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setYandexFullscreen(!yandexFullscreen)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={yandexFullscreen ? 'Обычный размер' : 'Увеличить окно'}
              >
                {yandexFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => window.open('https://yandex.ru/internet', '_blank', 'noopener,noreferrer')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-sm"
                title="Открыть во внешней вкладке браузера"
              >
                <span>В отдельном окне</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowYandexForm(!showYandexForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold text-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{showYandexForm ? 'Скрыть запись' : 'Записать в историю'}</span>
              </button>
            </div>
          </div>

          {/* Встроенный интерактивный веб-фрейм Яндекс Интернетометра */}
          <div className={`relative w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner transition-all ${
            yandexFullscreen ? 'h-[750px]' : 'h-[520px]'
          }`}>
            <iframe
              key={yandexFrameKey}
              src="https://yandex.ru/internet"
              title="Яндекс Интернетометр"
              className="w-full h-full border-0 bg-white"
              allow="geolocation; microphone; camera; display-capture"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>
              ℹ️ Нажмите «Измерить» прямо во встроенном окне выше, чтобы запустить официальный тест Яндекса.
            </span>
            <span className="text-emerald-400 font-medium">
              Потери 1–2% в беспроводной сети Wi-Fi — штатная норма
            </span>
          </div>

          {/* Форма сохранения результата из Яндекс Интернетометра */}
          {showYandexForm && (
            <form onSubmit={handleSaveYandexManual} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4.5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Сохранение замера из Яндекс Интернетометра в историю
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  Потери 1% — норма для Wi-Fi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Входящая скорость (Мбит/с):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={yandexDown}
                    onChange={e => setYandexDown(e.target.value)}
                    placeholder="Например, 94.5"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Исходящая скорость (Мбит/с):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={yandexUp}
                    onChange={e => setYandexUp(e.target.value)}
                    placeholder="Например, 88.2"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Пинг (мс):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={yandexPing}
                    onChange={e => setYandexPing(e.target.value)}
                    placeholder="Например, 7.8"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Заметка (комната, условия):
                </label>
                <input
                  type="text"
                  value={yandexNote}
                  onChange={e => setYandexNote(e.target.value)}
                  placeholder="Например: Замер в гостиной через 5 ГГц Wi-Fi"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowYandexForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors"
                >
                  Сохранить замер Яндекс
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. 2IP.RU ЗАМЕР СКОРОСТИ (ВСТРОЕННЫЙ ИНТЕРФЕЙС)          */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-900 border border-emerald-500/35 rounded-3xl shadow-xl overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIs2ipExpanded(!is2ipExpanded)}
          className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors border-b border-slate-800/60"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">
                  2. 2IP.ru Скорость интернета (2ip.io/ru/speed/)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  Независимый тест провайдеров
                </span>
                <span className="text-xs text-emerald-400 font-mono">
                  ● Встроен прямо в интерфейс
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Замер реальной скорости соединения, пинга и джиттера через независимую платформу 2IP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              {is2ipExpanded ? 'Свернуть' : 'Развернуть'}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-emerald-400 transition-transform duration-200 ${
                is2ipExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Тело 2IP замерщика */}
        <div className={`p-6 space-y-4 ${is2ipExpanded ? 'block' : 'hidden'}`}>
          {/* Панель управления встроенным WebView окном 2IP */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Адрес:</span>
              <span className="text-white font-semibold">https://2ip.io/ru/speed/</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full ml-1">
                SSL Защищено
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTwoIpFrameKey(k => k + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Перезагрузить встроенный фрейм 2IP"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setTwoIpFullscreen(!twoIpFullscreen)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={twoIpFullscreen ? 'Обычный размер' : 'Увеличить окно'}
              >
                {twoIpFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => window.open('https://2ip.io/ru/speed/', '_blank', 'noopener,noreferrer')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
                title="Открыть во внешней вкладке браузера"
              >
                <span>В отдельном окне</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShow2ipForm(!show2ipForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold text-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{show2ipForm ? 'Скрыть запись' : 'Записать в историю'}</span>
              </button>
            </div>
          </div>

          {/* Встроенный интерактивный веб-фрейм 2IP */}
          <div className={`relative w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner transition-all ${
            twoIpFullscreen ? 'h-[750px]' : 'h-[520px]'
          }`}>
            <iframe
              key={twoIpFrameKey}
              src="https://2ip.io/ru/speed/"
              title="2IP Замер скорости"
              className="w-full h-full border-0 bg-white"
              allow="geolocation"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>
              ℹ️ Нажмите «Тестировать» прямо во встроенном окне выше для проверки скорости на серверах 2IP.ru.
            </span>
            <span className="text-emerald-400 font-medium">
              Потери 1–2% в беспроводной сети Wi-Fi — штатная норма
            </span>
          </div>

          {/* Форма сохранения результата из 2IP */}
          {show2ipForm && (
            <form onSubmit={handleSave2ipManual} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4.5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Сохранение замера из 2IP.ru в историю
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  Потери 1% — норма для Wi-Fi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Входящая скорость (Мбит/с):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={twoIpDown}
                    onChange={e => setTwoIpDown(e.target.value)}
                    placeholder="Например, 82.4"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Исходящая скорость (Мбит/с):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={twoIpUp}
                    onChange={e => setTwoIpUp(e.target.value)}
                    placeholder="Например, 76.1"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Пинг (мс):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={twoIpPing}
                    onChange={e => setTwoIpPing(e.target.value)}
                    placeholder="Например, 9.2"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Заметка (условия замера):
                </label>
                <input
                  type="text"
                  value={twoIpNote}
                  onChange={e => setTwoIpNote(e.target.value)}
                  placeholder="Например: Замер 2IP через 5 ГГц Wi-Fi 6"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShow2ipForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                >
                  Сохранить замер 2IP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. ЕДИНАЯ ИСТОРИЯ ЗАМЕРОВ СКОРОСТИ (ВСЕ 15 ЗАПИСЕЙ)     */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h4 className="text-base font-bold text-white">
              История проверок скорости ({history.length} записей)
            </h4>
            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
              Яндекс Интернетометр & 2IP.ru
            </span>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить историю</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            История пуста. Запустите замер в Яндекс Интернетометре или 2IP.ru выше.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Дата</th>
                  <th className="py-3 px-3">Источник</th>
                  <th className="py-3 px-3">Скачивание</th>
                  <th className="py-3 px-3">Выгрузка</th>
                  <th className="py-3 px-3">Пинг & Потери</th>
                  <th className="py-3 px-3">VPN</th>
                  <th className="py-3 px-3">Сеть Wi-Fi</th>
                  <th className="py-3 px-3">Сигнал</th>
                  <th className="py-3 px-3">Заметка</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.slice(0, 15).map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-semibold">{index + 1}</td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">{item.timestamp}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.source === 'yandex'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : item.source === '2ip'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {item.source === 'yandex' ? 'Яндекс' : item.source === '2ip' ? '2IP.ru' : 'Тест'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-cyan-300 text-sm">
                      {item.downloadMbps.toFixed(1)} Мб/с
                    </td>
                    <td className="py-3 px-3 font-bold text-indigo-300 text-sm">
                      {item.uploadMbps.toFixed(1)} Мб/с
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <div>{item.pingMs.toFixed(1)} мс</div>
                      <div className="text-[10px] text-slate-400">
                        {item.lossPercent <= 2 ? (
                          <span className="text-emerald-400 font-semibold" title="В беспроводной сети передачи данных потери 1-2% допустимы и не являются проблемой">
                            {item.lossPercent}% (норма Wi-Fi)
                          </span>
                        ) : (
                          <span className="text-red-400 font-semibold">
                            {item.lossPercent}% (высокие)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {item.vpnActive ? (
                        <span className="text-amber-400 text-[10px]">⚠️ VPN Вкл</span>
                      ) : (
                        <span className="text-emerald-400 text-[10px]">Прямой</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {item.wifiSsid} ({item.wifiBand})
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {item.wifiRssi ? `${item.wifiRssi} дБм` : '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-sans text-[11px] max-w-xs truncate">
                      {item.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
