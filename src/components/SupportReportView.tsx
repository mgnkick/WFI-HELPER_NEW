import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Share2,
  AlertOctagon,
  ShieldAlert,
  Send,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { CurrentWifiMetrics, AccessPoint, PingResult, SpeedTestRun } from '../types/wifi';
import { generateSupportReport } from '../services/networkTester';
import { SignalValue } from './SignalValue';

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
  lastSpeedRun,
  onOpenTerm
}) => {
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
              Автоматический диагностический вердикт
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {wifi.vpn.isActive
                ? 'Внимание: Активен ВПН (VPN)'
                : (wifi.band.includes('2.4') && wifi.coChannelApCount > 3
                  ? 'Узкое место: Перегруженный диапазон 2.4 ГГц'
                  : (wifi.rssi < -78
                    ? 'Узкое место: Затухание сигнала в стенах'
                    : 'Домашняя сеть и радиоканал в отличном состоянии'))}
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {wifi.vpn.isActive
                ? 'Скорость соединения и задержка искусственно занижаются удаленным сервером ВПН. Оператор техподдержки не сможет протестировать линию до тех пор, пока вы не отключите ВПН на устройстве.'
                : (wifi.band.includes('2.4')
                  ? 'На вашем 6-м канале обнаружено еще несколько соседских роутеров. Физические радиоколлизии вызывают скачки пинга до роутера и снижение скорости.'
                  : 'Параметры радиосигнала и задержка до домашнего роутера находятся в пределах идеальной нормы. Если наблюдаются проблемы с сайтами — причина на внешнем кабеле провайдера.')}
            </p>
            <div className="text-xs text-slate-400 mt-3 font-mono">
              Сигнал Wi‑Fi: <SignalValue rssi={wifi.rssi} percent={wifi.signalPercent} />
            </div>
          </div>
        </div>
      </div>

      {/* Памятка по потерям пинга в беспроводных сетях */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 text-xs text-slate-300 flex items-start gap-3 shadow-lg">
        <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-white text-sm block">
            💡 Важно: Потери пакетов (пинг) 1–2% в беспроводной сети передачи данных допустимы и не являются проблемой
          </span>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            В отличие от проводного медного кабеля Ethernet, радиоэфир Wi-Fi подвержен естественным микропомехам, затуханию и конкуренции за частоту (протокол CSMA/CA). Микропотери <strong>1–2% являются нормальным поведением беспроводного линка</strong> и мгновенно компенсируются сетевыми протоколами без ущерба для видео, сайтов или звонков. Проблемой для обращения в поддержку признаются только систематические потери от <strong>3–5% и выше</strong>.
          </p>
        </div>
      </div>

      {/* 2. ГОТОВЫЙ ТЕКСТОВЫЙ ОТЧЕТ С КНОПКАМИ ЭКСПОРТА */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h4 className="text-base font-bold text-white">
              Структурированный отчет для службы поддержки
            </h4>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать .TXT</span>
            </button>

            <button
              onClick={handleShareTelegram}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-950/60 hover:bg-sky-900 text-sky-300 border border-sky-600/40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Текстовая область отчета */}
        <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed select-all">
          {report.text}
        </pre>
      </div>

      {/* 3. РЕКОМЕНДАЦИИ ПО ОПТИМИЗАЦИИ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* МАКСИМАЛЬНАЯ СКОРОСТЬ */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
          <h5 className="text-sm font-bold text-cyan-300 mb-2 flex items-center gap-2">
            <span>🚀 Для максимальной скорости:</span>
          </h5>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span>Переключите все смартфоны и ноутбуки исключительно на сеть <strong>5 ГГц</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span>В настройках роутера установите ширину полосы <strong>80 МГц</strong> (или 160 МГц при поддержке Wi-Fi 6).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><strong>Обязательно выключайте VPN</strong> при просмотре 4K видео и загрузке тяжелых файлов, если нет необходимости в обходе блокировок.</span>
            </li>
          </ul>
        </div>

        {/* МАКСИМАЛЬНАЯ СТАБИЛЬНОСТЬ */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
          <h5 className="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2">
            <span>🛡️ Для максимальной стабильности:</span>
          </h5>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Если сигнал пробивает через 2 несущие стены — зафиксируйте в роутере полосу <strong>20 МГц</strong> на каналах 1, 6 или 11 во избежание межканального перекрытия.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Для стационарных ПК и смарт-ТВ идеальное решение — проложить один раз медный провод Ethernet.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
