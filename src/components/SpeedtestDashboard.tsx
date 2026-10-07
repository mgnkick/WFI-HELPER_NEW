import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Radio,
  ExternalLink,
  Trash2,
  History,
  RefreshCw,
  Maximize2,
  Minimize2,
  ShieldCheck,
  AlertTriangle,
  Zap,
  PlusCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { CurrentWifiMetrics, SpeedTestRun } from '../types/wifi';
import { WifiAccuracyDisclaimer } from './WifiAccuracyDisclaimer';
import { SignalValue } from './SignalValue';
import { Capacitor } from '@capacitor/core';
import { WifiHelper } from '../plugins/wifiHelper';

interface SpeedtestDashboardProps {
  wifi: CurrentWifiMetrics;
  history: SpeedTestRun[];
  onOpenTerm: (termId: string) => void;
  onSaveSpeedRun: (run: SpeedTestRun) => void;
  onClearHistory: () => void;
  onOpenVpnSettings?: () => void;
}

export const SpeedtestDashboard: React.FC<SpeedtestDashboardProps> = ({
  wifi,
  history,
  onOpenTerm,
  onSaveSpeedRun,
  onClearHistory,
  onOpenVpnSettings
}) => {
  // Ключ для принудительной перезагрузки встроенного фрейма
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const [isFullscreenModal, setIsFullscreenModal] = useState<boolean>(false);

  // Форма быстрой фиксации замеров в локальную историю
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);
  const [downInput, setDownInput] = useState<string>('');
  const [upInput, setUpInput] = useState<string>('');
  const [pingInput, setPingInput] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Внешний переход на официальный сайт Яндекс Интернетометра
  const handleOpenYandexExternal = () => {
    window.open('https://yandex.ru/internet', '_blank', 'noopener,noreferrer');
  };

  // Внешний переход на официальный сайт 2IP.ru
  const handleOpen2ipExternal = () => {
    window.open('https://2ip.ru/speed/', '_blank', 'noopener,noreferrer');
  };

  // Перезагрузка встроенного окна
  const handleReloadIframe = () => {
    setIsIframeLoading(true);
    setIframeKey(prev => prev + 1);
  };

  // Полноэкранный режим: на Android открываем нативный диалог WebView, в вебе — модальное окно
  const handleOpenFullscreen = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await WifiHelper.openInAppMeter({ url: 'https://yandex.ru/internet/' });
        return;
      } catch (e) {
        console.warn('Native in-app meter fallback to web modal', e);
      }
    }
    setIsFullscreenModal(true);
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    const down = parseFloat(downInput);
    const up = parseFloat(upInput);
    const ping = parseFloat(pingInput) || 12;

    if (isNaN(down) || down <= 0) return;

    const newRun: SpeedTestRun = {
      id: 'run-' + Date.now(),
      timestamp: new Date().toISOString(),
      downloadMbps: Number(down.toFixed(2)),
      uploadMbps: !isNaN(up) && up > 0 ? Number(up.toFixed(2)) : Number((down * 0.85).toFixed(2)),
      pingMs: Number(ping.toFixed(1)),
      jitterMs: Number((ping * 0.2).toFixed(1)),
      lossPercent: 0,
      source: 'yandex',
      ispName: wifi.ispName || 'Провайдер',
      serverLocation: 'Яндекс Интернетометр',
      externalIp: wifi.externalIp || wifi.ipAddress,
      wifiSsid: wifi.ssid,
      wifiBssid: wifi.bssid,
      wifiBand: wifi.band,
      wifiRssi: wifi.rssi,
      vpnActive: wifi.vpn?.isActive || false,
      vpnName: wifi.vpn?.interfaceName,
      note: noteInput.trim() || undefined
    };

    onSaveSpeedRun(newRun);
    setDownInput('');
    setUpInput('');
    setPingInput('');
    setNoteInput('');
    setShowSaveForm(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Блок верхних отдельных кнопок внешних ссылок (Яндекс и 2IP) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Внешние сервисы замера скорости
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Отдельные ссылки для открытия официальных страниц в браузере или приложении
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Кнопка 1: Яндекс Интернетометр */}
            <button
              onClick={handleOpenYandexExternal}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-amber-500/10 active:scale-95 cursor-pointer"
              title="Открыть Яндекс Интернетометр в браузере"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Яндекс Интернетометр</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400/80" />
            </button>

            {/* Кнопка 2: 2IP.ru Замер скорости */}
            <button
              onClick={handleOpen2ipExternal}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-sky-500/10 active:scale-95 cursor-pointer"
              title="Открыть 2IP.ru в браузере"
            >
              <Globe className="w-4 h-4 text-sky-400" />
              <span>2ip.ru Замер скорости</span>
              <ExternalLink className="w-3.5 h-3.5 text-sky-400/80" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Основное встроенное окно Яндекс Интернетометра */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Панель заголовка встроенного окна */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
              Я
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base">
                  Яндекс Интернетометр
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Встроено в приложение
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Замер скорости, внешний IP-адрес, браузер и разрешение экрана
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Кнопка обновления окна */}
            <button
              onClick={handleReloadIframe}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
              title="Перезагрузить встроенное окно"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isIframeLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Обновить</span>
            </button>

            {/* Кнопка развертывания на весь экран */}
            <button
              onClick={handleOpenFullscreen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition cursor-pointer"
              title="Развернуть окно на весь экран"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Во весь экран</span>
            </button>
          </div>
        </div>

        {/* Область самого встроенного окна (iframe через локальный прокси без X-Frame-Options ограничений) */}
        <div className="relative w-full bg-slate-950 min-h-[580px] sm:min-h-[680px] flex-1">
          {isIframeLoading && (
            <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-slate-300">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-sm font-medium">Загрузка Яндекс Интернетометра...</p>
              <p className="text-xs text-slate-500 font-mono">Подключение безопасного фрейма</p>
            </div>
          )}

          <iframe
            key={iframeKey}
            ref={iframeRef}
            src="/api/yandex-meter"
            title="Яндекс Интернетометр"
            className="w-full h-[580px] sm:h-[680px] border-0 bg-white"
            onLoad={() => setIsIframeLoading(false)}
            allow="fullscreen; clipboard-read; clipboard-write"
          />
        </div>

        {/* Подвал встроенного окна с полезными быстрыми действиями */}
        <div className="bg-slate-950 border-t border-slate-800/80 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Окно работает напрямую с серверами Яндекса через безопасный туннель</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSaveForm(!showSaveForm)}
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showSaveForm ? 'Скрыть форму записи' : 'Зафиксировать замер в истории'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Форма быстрой фиксации замеров из Интернетометра в локальную историю */}
      {showSaveForm && (
        <form
          onSubmit={handleSaveResult}
          className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              Сохранить результат замера из Интернетометра в историю
            </h3>
            <button
              type="button"
              onClick={() => setShowSaveForm(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Входящее (Мбит/с) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                placeholder="напр. 85.4"
                value={downInput}
                onChange={e => setDownInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Исходящее (Мбит/с)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="напр. 78.1"
                value={upInput}
                onChange={e => setUpInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Задержка / Пинг (мс)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="напр. 14.5"
                value={pingInput}
                onChange={e => setPingInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Примечание (комната, условия, устройство)
            </label>
            <input
              type="text"
              placeholder="напр. Замер в спальне возле окна, диапазон 5 ГГц"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowSaveForm(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              Сохранить в историю
            </button>
          </div>
        </form>
      )}

      {/* 3. Предупреждение о точности беспроводных замеров */}
      <WifiAccuracyDisclaimer
        currentBand={wifi.band}
      />

      {/* 4. Текущие параметры Wi-Fi канала */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
          Параметры текущей сети Wi-Fi
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
            <span className="text-slate-500 block mb-1">Сеть (SSID)</span>
            <span className="font-bold text-white truncate block">{wifi.ssid || 'Wi-Fi'}</span>
          </div>
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
            <span className="text-slate-500 block mb-1">Диапазон</span>
            <span className="font-bold text-cyan-400">{wifi.band} (канал {wifi.channel})</span>
          </div>
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
            <span className="text-slate-500 block mb-1">Скорость линка (радио)</span>
            <span className="font-mono font-bold text-emerald-400">{wifi.linkSpeedTxMbps} Мбит/с</span>
          </div>
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
            <span className="text-slate-500 block mb-1">Сигнал (RSSI)</span>
            <SignalValue rssi={wifi.rssi} percent={wifi.signalPercent} />
          </div>
        </div>
      </div>

      {/* 5. История замеров */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">История замеров</h3>
            <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">
              {history.length}
            </span>
          </div>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить историю</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs sm:text-sm">
            <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            История замеров чистая.
            <br />
            Выполните замер во встроенном окне Яндекс Интернетометра и сохраните результат для отчета.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-2">Время</th>
                  <th className="pb-2">Источник</th>
                  <th className="pb-2 text-right">Входящая</th>
                  <th className="pb-2 text-right">Исходящая</th>
                  <th className="pb-2 text-right">Пинг</th>
                  <th className="pb-2">Примечание</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.map(run => (
                  <tr key={run.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 text-slate-400">
                      {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 text-white font-medium">
                      {run.source === 'yandex' ? 'Яндекс Интернетометр' : run.source === '2ip' ? '2IP.ru' : 'Тест сети'}
                    </td>
                    <td className="py-2.5 text-right font-bold text-cyan-400">
                      {run.downloadMbps} Мбит/с
                    </td>
                    <td className="py-2.5 text-right text-emerald-400">
                      {run.uploadMbps} Мбит/с
                    </td>
                    <td className="py-2.5 text-right text-slate-300">
                      {run.pingMs} мс
                    </td>
                    <td className="py-2.5 text-slate-400 italic font-sans max-w-[200px] truncate">
                      {run.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Полноэкранный модальный режим для веб-версии */}
      {isFullscreenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col animate-in fade-in">
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="font-bold text-white text-sm sm:text-base">
                Яндекс Интернетометр (Полноэкранный режим)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReloadIframe}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium cursor-pointer"
              >
                Обновить
              </button>
              <button
                onClick={() => setIsFullscreenModal(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Свернуть</span>
              </button>
            </div>
          </div>
          <div className="flex-1 w-full bg-white">
            <iframe
              src="/api/yandex-meter"
              title="Яндекс Интернетометр - Полноэкранный режим"
              className="w-full h-full border-0"
              allow="fullscreen; clipboard-read; clipboard-write"
            />
          </div>
        </div>
      )}
    </div>
  );
};
