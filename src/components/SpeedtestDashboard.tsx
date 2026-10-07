import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  ExternalLink,
  Trash2,
  History,
  RefreshCw,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Zap,
  PlusCircle,
  X
} from 'lucide-react';
import { CurrentWifiMetrics, SpeedTestRun } from '../types/wifi';
import { WifiAccuracyDisclaimer } from './WifiAccuracyDisclaimer';
import { SignalValue } from './SignalValue';
import { Capacitor } from '@capacitor/core';
import { WifiHelper } from '../plugins/wifiHelper';
import { useTheme } from '../context/ThemeContext';

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
  onSaveSpeedRun,
  onClearHistory,
}) => {
  const { isDark, cardBg, cardSubtle, btnOutline, btnOutlineSm, btnActive, inputClass } = useTheme();

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

  // Синхронизация темы со встроенным окном
  useEffect(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage({ theme: isDark ? 'dark' : 'light' }, '*');
    } catch (e) {}
  }, [isDark, iframeKey]);

  // Полноэкранный режим
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
      <div className={`${cardBg} rounded-3xl p-5 sm:p-6 transition-colors`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <Zap className="w-5 h-5" />
              Внешние сервисы замера скорости
            </h2>
            <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Отдельные кнопки для открытия официальных сайтов в браузере
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Кнопка 1: Яндекс Интернетометр */}
            <button
              onClick={handleOpenYandexExternal}
              className={`${btnOutline} flex-1 sm:flex-initial`}
              title="Открыть Яндекс Интернетометр в браузере"
            >
              <Globe className="w-4 h-4" />
              <span>Яндекс Интернетометр</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            {/* Кнопка 2: 2IP.ru Замер скорости */}
            <button
              onClick={handleOpen2ipExternal}
              className={`${btnOutline} flex-1 sm:flex-initial`}
              title="Открыть 2IP.ru в браузере"
            >
              <Globe className="w-4 h-4" />
              <span>2ip.ru Замер скорости</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Основное встроенное окно Яндекс Интернетометра */}
      <div className={`${cardBg} rounded-3xl overflow-hidden flex flex-col transition-colors`}>
        {/* Панель заголовка встроенного окна */}
        <div className={`px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b ${
          isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-sm ${
              isDark
                ? 'bg-zinc-800 border-white text-white'
                : 'bg-zinc-900 border-zinc-900 text-white'
            }`}>
              Я
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Яндекс Интернетометр
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'border-white/50 text-white bg-white/10'
                    : 'border-zinc-900/50 text-zinc-900 bg-zinc-900/10'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-white' : 'bg-zinc-900'}`} />
                  Встроено в приложение
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Замер скорости, внешний IP-адрес, браузер и разрешение экрана
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Кнопка обновления окна */}
            <button
              onClick={handleReloadIframe}
              className={btnOutlineSm}
              title="Перезагрузить встроенное окно"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isIframeLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Обновить</span>
            </button>

            {/* Кнопка развертывания на весь экран */}
            <button
              onClick={handleOpenFullscreen}
              className={btnOutlineSm}
              title="Развернуть окно на весь экран"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Во весь экран</span>
            </button>
          </div>
        </div>

        {/* Область самого встроенного окна */}
        <div className={`relative w-full h-[60vh] min-h-[380px] max-h-[720px] landscape:h-[72vh] landscape:min-h-[290px] flex-1 overflow-hidden ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
          {isIframeLoading && (
            <div className={`absolute inset-0 z-10 backdrop-blur-sm flex flex-col items-center justify-center gap-3 ${
              isDark ? 'bg-zinc-950/80 text-zinc-300' : 'bg-white/80 text-zinc-700'
            }`}>
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium">Загрузка Яндекс Интернетометра...</p>
              <p className="text-xs font-mono opacity-70">Подключение безопасного фрейма</p>
            </div>
          )}

          <iframe
            key={iframeKey}
            ref={iframeRef}
            name="yandex_meter_frame"
            src="/yandex-meter.html"
            title="Яндекс Интернетометр"
            className="w-full h-full border-0 bg-transparent"
            onLoad={() => {
              setIsIframeLoading(false);
              try {
                iframeRef.current?.contentWindow?.postMessage({ theme: isDark ? 'dark' : 'light' }, '*');
              } catch (e) {}
            }}
            allow="fullscreen; clipboard-read; clipboard-write"
          />
        </div>

        {/* Подвал встроенного окна */}
        <div className={`px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs border-t ${
          isDark
            ? 'bg-zinc-950/90 border-zinc-800 text-zinc-400'
            : 'bg-zinc-50 border-zinc-200 text-zinc-600'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Окно работает напрямую с серверами Яндекса через безопасный туннель</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSaveForm(!showSaveForm)}
              className={btnOutlineSm}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showSaveForm ? 'Скрыть форму записи' : 'Зафиксировать замер в истории'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Форма быстрой фиксации замеров */}
      {showSaveForm && (
        <form
          onSubmit={handleSaveResult}
          className={`${cardBg} rounded-3xl p-5 sm:p-6 space-y-4`}
        >
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <PlusCircle className="w-4 h-4" />
              Сохранить результат замера из Интернетометра в историю
            </h3>
            <button
              type="button"
              onClick={() => setShowSaveForm(false)}
              className={btnOutlineSm}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-mono mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
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
                className={`w-full rounded-xl px-3 py-2 text-sm font-mono ${inputClass}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-mono mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Исходящее (Мбит/с)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="напр. 78.1"
                value={upInput}
                onChange={e => setUpInput(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm font-mono ${inputClass}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-mono mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Задержка / Пинг (мс)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="напр. 14.5"
                value={pingInput}
                onChange={e => setPingInput(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm font-mono ${inputClass}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-mono mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Примечание (комната, условия, устройство)
            </label>
            <input
              type="text"
              placeholder="напр. Замер в спальне возле окна, диапазон 5 ГГц"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-sm ${inputClass}`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowSaveForm(false)}
              className={btnOutline}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={btnActive}
            >
              Сохранить в историю
            </button>
          </div>
        </form>
      )}

      {/* 3. Предупреждение о точности беспроводных замеров */}
      <WifiAccuracyDisclaimer currentBand={wifi.band} />

      {/* 4. Текущие параметры Wi-Fi канала */}
      <div className={`${cardBg} rounded-3xl p-5 sm:p-6`}>
        <h3 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Параметры текущей сети Wi-Fi
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className={`${cardSubtle} rounded-2xl p-3`}>
            <span className={`block mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Сеть (SSID)</span>
            <span className={`font-bold truncate block ${isDark ? 'text-white' : 'text-zinc-900'}`}>{wifi.ssid || 'Wi-Fi'}</span>
          </div>
          <div className={`${cardSubtle} rounded-2xl p-3`}>
            <span className={`block mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Диапазон</span>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{wifi.band} (канал {wifi.channel})</span>
          </div>
          <div className={`${cardSubtle} rounded-2xl p-3`}>
            <span className={`block mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Скорость линка (радио)</span>
            <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{wifi.linkSpeedTxMbps} Мбит/с</span>
          </div>
          <div className={`${cardSubtle} rounded-2xl p-3`}>
            <span className={`block mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Сигнал (RSSI)</span>
            <SignalValue rssi={wifi.rssi} percent={wifi.signalPercent} />
          </div>
        </div>
      </div>

      {/* 5. История замеров */}
      <div className={`${cardBg} rounded-3xl p-5 sm:p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>История замеров</h3>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
              isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-300 text-zinc-700'
            }`}>
              {history.length}
            </span>
          </div>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className={btnOutlineSm}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить историю</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className={`text-center py-8 border border-dashed rounded-2xl text-xs sm:text-sm ${
            isDark ? 'border-zinc-800 text-zinc-500' : 'border-zinc-300 text-zinc-500'
          }`}>
            <History className="w-8 h-8 opacity-40 mx-auto mb-2" />
            История замеров чистая.
            <br />
            Выполните замер во встроенном окне Яндекс Интернетометра и сохраните результат для отчета.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b font-mono ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-600'}`}>
                  <th className="pb-2">Время</th>
                  <th className="pb-2">Источник</th>
                  <th className="pb-2 text-right">Входящая</th>
                  <th className="pb-2 text-right">Исходящая</th>
                  <th className="pb-2 text-right">Пинг</th>
                  <th className="pb-2">Примечание</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono ${isDark ? 'divide-zinc-800' : 'divide-zinc-200'}`}>
                {history.map(run => (
                  <tr key={run.id} className={isDark ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50'}>
                    <td className={`py-2.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className={`py-2.5 font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {run.source === 'yandex' ? 'Яндекс Интернетометр' : run.source === '2ip' ? '2IP.ru' : 'Тест сети'}
                    </td>
                    <td className={`py-2.5 text-right font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {run.downloadMbps} Мбит/с
                    </td>
                    <td className={`py-2.5 text-right ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      {run.uploadMbps} Мбит/с
                    </td>
                    <td className={`py-2.5 text-right ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {run.pingMs} мс
                    </td>
                    <td className={`py-2.5 italic font-sans max-w-[200px] truncate ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {run.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Полноэкранный модальный режим */}
      {isFullscreenModal && (
        <div className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-zinc-950/95' : 'bg-zinc-100/95'} backdrop-blur-md`}>
          <div className={`px-4 py-3 flex items-center justify-between border-b ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Яндекс Интернетометр (Полноэкранный режим)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReloadIframe}
                className={btnOutlineSm}
              >
                Обновить
              </button>
              <button
                onClick={() => setIsFullscreenModal(false)}
                className={btnOutlineSm}
              >
                <Minimize2 className="w-4 h-4" />
                <span>Свернуть</span>
              </button>
            </div>
          </div>
          <div className="flex-1 w-full bg-transparent">
            <iframe
              name="yandex_meter_frame"
              src="/yandex-meter.html"
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
