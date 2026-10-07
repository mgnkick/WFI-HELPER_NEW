import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Share2,
  Send,
  Sparkles
} from 'lucide-react';
import { CurrentWifiMetrics, AccessPoint, PingResult, SpeedTestRun } from '../types/wifi';
import { generateSupportReport } from '../services/networkTester';
import { SignalValue } from './SignalValue';
import { useTheme } from '../context/ThemeContext';

interface SupportReportViewProps {
  wifi: CurrentWifiMetrics;
  visibleAps: AccessPoint[];
  pings: PingResult[];
  lastSpeedRun?: SpeedTestRun;
  onOpenTerm: (termId: string) => void;
}

export const SupportReportView: React.FC<SupportReportViewProps> = ({
  wifi,
  visibleAps,
  pings,
  lastSpeedRun
}) => {
  const { isDark, cardBg, cardSubtle, btnOutlineSm, btnActive } = useTheme();
  const [copied, setCopied] = useState(false);

  const report = generateSupportReport(wifi, pings, visibleAps, lastSpeedRun);

  const handleCopy = () => {
    navigator.clipboard.writeText(report.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([report.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wifi_diagnostic_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareTelegram = () => {
    const encoded = encodeURIComponent(report.text);
    window.open(`https://t.me/share/url?url=${encoded}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(report.text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* 1. ВЕРДИКТ ДИАГНОСТИКИ */}
      <div className={`${cardBg} rounded-3xl p-6 transition-colors`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 ${
            isDark ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-900 border-zinc-900 text-white'
          }`}>
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <span className={`text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Автоматический диагностический вердикт
            </span>
            <h3 className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {wifi.vpn.isActive
                ? 'Внимание: Активен ВПН (VPN)'
                : (wifi.band.includes('2.4') && wifi.coChannelApCount > 3
                  ? 'Узкое место: Перегруженный диапазон 2.4 ГГц'
                  : (wifi.rssi < -78
                    ? 'Узкое место: Затухание сигнала в стенах'
                    : 'Домашняя сеть и радиоканал в отличном состоянии'))}
            </h3>

            <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
              {wifi.vpn.isActive
                ? 'Скорость соединения и задержка искусственно занижаются удаленным сервером ВПН. Оператор техподдержки не сможет протестировать линию до тех пор, пока вы не отключите ВПН на устройстве.'
                : (wifi.band.includes('2.4')
                  ? 'На вашем 6-м канале обнаружено еще несколько соседских роутеров. Физические радиоколлизии вызывают скачки пинга до роутера и снижение скорости.'
                  : 'Параметры радиосигнала и задержка до домашнего роутера находятся в пределах идеальной нормы. Если наблюдаются проблемы с сайтами — причина на внешнем кабеле провайдера.')}
            </p>
            <div className={`text-xs mt-3 font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Сигнал Wi‑Fi: <SignalValue rssi={wifi.rssi} percent={wifi.signalPercent} />
            </div>
          </div>
        </div>
      </div>

      {/* Памятка по потерям пинга */}
      <div className={`${cardSubtle} rounded-3xl p-5 text-xs flex items-start gap-3`}>
        <div className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${
          isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-200 border-zinc-300 text-zinc-900'
        }`}>
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className={`font-bold text-sm block ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            💡 Важно: Потери пакетов (пинг) 1–2% в беспроводной сети передачи данных допустимы и не являются проблемой
          </span>
          <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            В отличие от проводного медного кабеля Ethernet, радиоэфир Wi-Fi подвержен естественным микропомехам, затуханию и конкуренции за частоту (протокол CSMA/CA). Микропотери <strong>1–2% являются нормальным поведением беспроводного линка</strong> и компенсируются сетевыми протоколами. Проблемой для обращения в поддержку признаются только систематические потери от <strong>3–5% и выше</strong>.
          </p>
        </div>
      </div>

      {/* 2. ГОТОВЫЙ ТЕКСТОВЫЙ ОТЧЕТ С КНОПКАМИ ЭКСПОРТА */}
      <div className={`${cardBg} rounded-3xl p-6 shadow-xl`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Структурированный отчет для службы поддержки
            </h4>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className={btnActive}
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className={btnOutlineSm}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать .TXT</span>
            </button>

            <button
              onClick={handleShareTelegram}
              className={btnOutlineSm}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className={btnOutlineSm}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Текстовая область отчета */}
        <pre className={`p-4 rounded-2xl border text-xs font-mono overflow-x-auto max-h-96 leading-relaxed select-all ${
          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
        }`}>
          {report.text}
        </pre>
      </div>

      {/* 3. РЕКОМЕНДАЦИИ ПО ОПТИМИЗАЦИИ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* МАКСИМАЛЬНАЯ СКОРОСТЬ */}
        <div className={`${cardBg} rounded-3xl p-5`}>
          <h5 className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            <span>🚀 Для максимальной скорости:</span>
          </h5>
          <ul className={`text-xs space-y-2 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Переключите все смартфоны и ноутбуки исключительно на сеть <strong>5 ГГц</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>В настройках роутера установите ширину полосы <strong>80 МГц</strong> (или 160 МГц при поддержке Wi-Fi 6).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span><strong>Обязательно выключайте VPN</strong> при замере скорости и загрузке тяжелых файлов.</span>
            </li>
          </ul>
        </div>

        {/* МАКСИМАЛЬНАЯ СТАБИЛЬНОСТЬ */}
        <div className={`${cardBg} rounded-3xl p-5`}>
          <h5 className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            <span>🛡️ Для максимальной стабильности:</span>
          </h5>
          <ul className={`text-xs space-y-2 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Если сигнал пробивает через 2 несущие стены — зафиксируйте в роутере полосу <strong>20 МГц</strong> на каналах 1, 6 или 11.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Для стационарных ПК и смарт-ТВ лучшее решение — проложить кабель Ethernet.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
